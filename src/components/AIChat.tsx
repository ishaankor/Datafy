import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { X, Send, Sparkles, Pencil, Check, RotateCcw } from "lucide-react";
import { parseChartSegments, ChartRenderer, ImageRenderer } from "@/components/ChartRenderer";
import { saveChatMessage, touchDatasetTimestamp } from "@/lib/supabase";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AIChatProps {
  open: boolean;
  onClose: () => void;
  datasetContext?: string;
  selectionCSV?: string;
  selectionLabel?: string | null;
  pendingPrompt?: string | null;
  onPromptConsumed?: () => void;
  sessionId?: string | null;
  datasetId?: string | null;
  onActivity?: () => void;
  initialMessages?: Message[];
}

import ReactMarkdown from "react-markdown";

export const AIChat = ({
  open,
  onClose,
  datasetContext,
  selectionCSV,
  selectionLabel,
  pendingPrompt,
  onPromptConsumed,
  sessionId,
  datasetId,
  onActivity,
  initialMessages = [],
}: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, sessionId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasRealSelection = Boolean(selectionLabel && selectionLabel.trim() !== "");
  const activeSelectionCSV = hasRealSelection ? selectionCSV : undefined;
  const activeSelectionLabel = hasRealSelection ? selectionLabel : undefined;

  const liveContext = useRef({ datasetContext, activeSelectionCSV, activeSelectionLabel });
  useEffect(() => {
    liveContext.current = { datasetContext, activeSelectionCSV, activeSelectionLabel };
  }, [datasetContext, activeSelectionCSV, activeSelectionLabel]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const notifyActivity = () => {
    if (datasetId) {
      touchDatasetTimestamp(datasetId).catch(console.error);
    }
    onActivity?.();
  };

  const fetchAssistantReply = async (history: Message[]) => {
    setIsLoading(true);
    try {
      const payload = {
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        datasetContext: liveContext.current.datasetContext,
        selectionCSV: liveContext.current.activeSelectionCSV,
        selectionLabel: liveContext.current.activeSelectionLabel,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const replyText = data.response || "No response generated.";

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (sessionId) {
        saveChatMessage(sessionId, "assistant", replyText, datasetId).catch(console.error);
      }
      notifyActivity();
    } catch (error: any) {
      console.error("Chat API fetch error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "⚠️ Request timed out or encountered a network error. Try highlighting specific columns or rows for faster analysis.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const append = async (content: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);

    if (sessionId) {
      saveChatMessage(sessionId, "user", content, datasetId).catch(console.error);
    }
    notifyActivity();
    await fetchAssistantReply(updatedHistory);
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim() || isLoading) return;
    const targetIdx = messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const newContent = editingText.trim();
    const updatedMsg: Message = { ...messages[targetIdx], content: newContent };
    
    // Truncate messages after edited message
    const newHistory = [...messages.slice(0, targetIdx), updatedMsg];
    setMessages(newHistory);
    setEditingMessageId(null);
    setEditingText("");

    if (sessionId) {
      saveChatMessage(sessionId, "user", newContent, datasetId).catch(console.error);
    }
    notifyActivity();
    await fetchAssistantReply(newHistory);
  };

  useEffect(() => {
    if (pendingPrompt && open) {
      append(pendingPrompt);
      onPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, open]);

  const submit = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    append(text);
  };

  const suggestions = activeSelectionLabel
    ? ["Plot this", "What stands out?", "Compare these"]
    : ["Show me a trend", "What's interesting here?", "Suggest a chart"];

  if (!open) return null;

  return (
    <aside className="fixed top-0 right-0 h-screen w-full sm:w-[460px] bg-canvas border-l border-border shadow-noir z-40 flex flex-col transition-transform duration-300">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <p className="eyebrow text-[0.6rem]">Sidekick</p>
          <p className="font-display text-xl mt-0.5">Let's look at this together</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-gold transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <Sparkles className="w-7 h-7 text-gold mx-auto mb-4 opacity-70" />
            <p className="font-display text-lg text-foreground/90 leading-snug max-w-[300px] mx-auto">
              Highlight any part of the table and I'll plot it, summarize it, or tell you what's
              interesting.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Or just ask me anything about your data.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const segments = m.role === "assistant" ? parseChartSegments(m.content) : [];

          return (
            <div key={m.id} className={m.role === "user" ? "flex justify-end group" : "space-y-1"}>
              {m.role === "user" ? (
                editingMessageId === m.id ? (
                  <div className="max-w-[90%] bg-gold/20 border border-gold p-2.5 rounded-md space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-gold/40 rounded p-2 text-xs text-foreground focus:outline-none focus:border-gold font-sans"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMessageId(null);
                          setEditingText("");
                        }}
                        className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(m.id)}
                        disabled={isLoading || !editingText.trim()}
                        className="bg-gold text-ink hover:bg-gold-soft text-[11px] h-6 px-2.5 font-medium"
                      >
                        <Check className="w-3 h-3 mr-1" /> Save & Resubmit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-1.5 max-w-[88%]">
                    <button
                      onClick={() => {
                        setEditingMessageId(m.id);
                        setEditingText(m.content);
                      }}
                      title="Edit message & update session activity"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-gold p-1 shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <div className="bg-gold text-ink px-3.5 py-2 rounded-sm text-sm">
                      {m.content}
                    </div>
                  </div>
                )
              ) : (
                <>
                  <p className="eyebrow text-[0.55rem]">Sidekick</p>
                  <div className="text-sm leading-relaxed text-foreground/90 space-y-4">
                    {segments.map((seg, i) => {
                      if (seg.kind === "chart") return <ChartRenderer key={i} spec={seg.spec} />;
                      if (seg.kind === "image")
                        return <ImageRenderer key={i} alt={seg.alt} src={seg.src} />;
                      if (seg.kind === "error")
                        return (
                          <p key={i} className="text-xs text-destructive italic">
                            {seg.text}
                          </p>
                        );
                      return (
                        <div
                          key={i}
                          className="text-sm leading-relaxed text-foreground/90 font-serif space-y-2"
                        >
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-base font-bold text-gold font-display mt-3 mb-1">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-bold text-gold font-display mt-2 mb-1">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xs font-semibold text-gold font-display mt-2 mb-1">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-2 leading-relaxed">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gold">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-foreground/80">{children}</em>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 space-y-1 my-2 text-xs">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 space-y-1 my-2 text-xs">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => <li className="leading-normal">{children}</li>,
                              code: ({ children }) => (
                                <code className="bg-secondary/70 text-gold px-1.5 py-0.5 rounded font-mono text-[11px]">
                                  {children}
                                </code>
                              ),
                              img: ({ src, alt }) => (
                                <div className="my-3 rounded-lg overflow-hidden border border-gold/30 bg-ink/90 p-2 shadow-2xl space-y-2">
                                  <div className="relative group">
                                    <img
                                      src={src}
                                      alt={alt || "Python Matplotlib / Seaborn Chart"}
                                      className="w-full h-auto rounded object-contain max-h-[500px] border border-border/40"
                                    />
                                    {src && (
                                      <a
                                        href={src}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-gold text-foreground hover:text-ink px-2.5 py-1 rounded text-[10px] font-mono font-medium shadow"
                                      >
                                        🔍 View Full Resolution
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-gold/80 font-mono px-1">
                                    <span>📊 Python Seaborn / Matplotlib Graphic</span>
                                    <span>dpi=150</span>
                                  </div>
                                </div>
                              ),
                            }}
                          >
                            {seg.text}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="space-y-1">
            <p className="eyebrow text-[0.55rem]">Sidekick</p>
            <p className="text-sm text-muted-foreground italic">Thinking and analyzing data...</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {activeSelectionLabel && (
          <div className="text-[10px] text-gold/80 font-mono uppercase tracking-widest">
            ✦ Working with {activeSelectionLabel}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (!isLoading) append(s);
              }}
              disabled={isLoading}
              className="text-[11px] border border-border text-muted-foreground hover:text-gold hover:border-gold/40 px-2.5 py-1 rounded-sm transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
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
            placeholder={
              activeSelectionLabel
                ? "Ask about the selection..."
                : "Ask me anything about the data..."
            }
            rows={2}
            className="flex-1 bg-ink/50 border border-border rounded-sm p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 resize-none"
          />
          <Button
            onClick={submit}
            disabled={!input.trim() || isLoading}
            className="bg-gold hover:bg-gold-soft text-ink rounded-sm h-[60px] w-[60px] p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
