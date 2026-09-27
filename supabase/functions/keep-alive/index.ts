import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
      },
    });
  }

  // Check optional secret if configured
  const cronSecretHeader = req.headers.get("x-cron-secret");
  const configuredSecret = Deno.env.get("CRON_SECRET");

  if (configuredSecret && cronSecretHeader !== configuredSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid or missing x-cron-secret header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables in Edge Runtime.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Strategy 1: Try dedicated RPC ping function (most reliable, table-independent)
    const { data: rpcData, error: rpcError } = await supabase.rpc("keep_alive_ping");

    if (!rpcError && rpcData) {
      return new Response(
        JSON.stringify({
          success: true,
          method: "rpc",
          result: rpcData,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Strategy 2: Fallback to Auth Admin or table query if RPC is not yet created
    let dbError = null;
    let queryResult = null;

    try {
      const { data: tableData, error: tableErr } = await supabase
        .from("datasets")
        .select("id")
        .limit(1);

      if (tableErr) {
        dbError = tableErr;
      } else {
        queryResult = { rows: tableData?.length ?? 0 };
      }
    } catch (e: any) {
      dbError = e;
    }

    if (dbError) {
      // If table query had permission issues, try auth service activity
      const { data: users, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      if (authError) {
        console.error("Keep-alive errors:", { rpcError, dbError, authError });
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database queries failed. Please run keep_alive_cron.sql in Supabase SQL Editor.",
            details: {
              rpcError: rpcError?.message,
              tableError: dbError?.message,
              authError: authError?.message,
            },
            timestamp: new Date().toISOString(),
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      queryResult = { authPing: true, totalUsers: users?.users?.length ?? 0 };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Supabase database pinged successfully. Project inactivity timer reset.",
        data: queryResult,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    console.error("Keep-alive execution error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
