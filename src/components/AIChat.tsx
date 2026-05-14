import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, X, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  datasetContext: string;
  pendingFocus: string | null;
  onFocusConsumed: () => void;
}

export function AIChat({
  open,
  onClose,
  datasetContext,
  pendingFocus,
  onFocusConsumed,
}: Props) {
  const [input, setInput] = useState("");
  const [focus, setFocus] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: () => ({ datasetContext, focus }),
  });

  const { messages, sendMessage, status } = useChat({ transport });

  // When the user clicks "Ask" on a chart, prefill input
  useEffect(() => {
    if (pendingFocus) {
      setInput(pendingFocus);
      setFocus(pendingFocus);
      inputRef.current?.focus();
      onFocusConsumed();
    }
  }, [pendingFocus, onFocusConsumed]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = () => {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    setInput("");
    setFocus(null);
  };

  return (
    <aside
      className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-canvas border-l border-border shadow-noir z-40 flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <header className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <p className="eyebrow">The Curator</p>
          <p className="font-display text-xl mt-1">In conversation</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-gold transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Quote className="w-8 h-8 text-gold mx-auto mb-4 opacity-60" />
            <p className="font-display text-lg text-muted-foreground italic leading-relaxed">
              "Tell me what you see, and I will tell you what it means."
            </p>
            <p className="text-xs text-muted-foreground/60 mt-6 max-w-[260px] mx-auto">
              Ask anything about your data, or click <span className="text-gold">Ask</span> on any
              plate to begin a focused inquiry.
            </p>
          </div>
        )}

        {messages.map((m: UIMessage) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] bg-gold text-ink px-4 py-2.5 rounded-sm text-sm font-medium">
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="space-y-1">
              <p className="eyebrow text-[0.6rem]">Curator</p>
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-display text-[15px]">
                {text}
              </div>
            </div>
          );
        })}

        {(status === "submitted" || status === "streaming") &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="space-y-1">
              <p className="eyebrow text-[0.6rem]">Curator</p>
              <p className="text-sm text-muted-foreground italic">Considering…</p>
            </div>
          )}
      </div>

      <div className="border-t border-border p-4">
        {focus && (
          <div className="mb-2 text-[10px] text-gold/80 font-mono uppercase tracking-widest flex items-center justify-between">
            <span>Focus engaged</span>
            <button onClick={() => setFocus(null)} className="hover:text-gold-soft">clear</button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask the curator…"
            rows={2}
            className="flex-1 bg-ink/50 border border-border rounded-sm p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 resize-none"
          />
          <Button
            onClick={submit}
            disabled={!input.trim() || status === "streaming" || status === "submitted"}
            className="bg-gold hover:bg-gold-soft text-ink rounded-sm h-[60px] w-[60px] p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
