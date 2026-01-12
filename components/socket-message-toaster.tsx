"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {MessageSquare, X} from "lucide-react";
import {socket} from "@/Service/socket.js";
import {getCurrentUser} from "@/api/authService";

type MessageApi = {
  id?: string;
  _id?: string;
  senderId?: string;
  sender?: string;
  from?: string;
  receiverId?: string;
  content?: string;
  message?: string;
  text?: string;
  userId?: string;
  user?: {id?: string};
  to?: string;
  targetId?: string;
  recipientId?: string;
  chatId?: string;
  chat?: {id?: string};
  timestamp?: string;
  createdAt?: string;
  created_at?: string;
};

type NormalizedMessage = {
  id: string;
  chatId?: string;
  senderId?: string;
  content: string;
  dedupeKey?: string;
};

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  chatId?: string;
};

const extractMessages = (payload: unknown): MessageApi[] => {
  if (Array.isArray(payload)) return payload as MessageApi[];
  if (!payload || typeof payload !== "object") return [];
  const data = payload as {messages?: MessageApi[]; data?: unknown};
  if (Array.isArray(data.messages)) return data.messages;
  if (Array.isArray(data.data)) return data.data as MessageApi[];
  if (data.data && typeof data.data === "object") {
    const nested = data.data as {messages?: MessageApi[]};
    if (Array.isArray(nested.messages)) return nested.messages;
  }
  return [];
};

const normalizeMessage = (raw: MessageApi): NormalizedMessage | null => {
  if (!raw) return null;
  const rawContent = raw.content ?? raw.message ?? raw.text;
  const content = rawContent !== undefined && rawContent !== null ? String(rawContent) : "";
  const chatId = raw.chatId ?? raw.chat?.id;
  const senderId = raw.senderId ?? raw.sender ?? raw.from ?? raw.userId ?? raw.user?.id;
  const timestamp = raw.timestamp ?? raw.createdAt ?? raw.created_at;
  const id = raw.id ?? raw._id ?? "";
  const dedupeKey = id
    ? String(id)
    : [chatId, senderId, timestamp, content].filter(Boolean).join("|") || undefined;

  return {
    id: id ? String(id) : crypto.randomUUID(),
    chatId: chatId ? String(chatId) : undefined,
    senderId: senderId ? String(senderId) : undefined,
    content,
    dedupeKey,
  };
};

const getActiveChatId = (pathname: string | null) => {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "messages") return null;
  return parts[1] ?? null;
};

const MAX_TOASTS = 3;
const TOAST_TTL_MS = 6000;
const DEDUPE_TTL_MS = 60000;

export function SocketMessageToaster() {
  const router = useRouter();
  const pathname = usePathname();
  const activeChatId = useMemo(() => getActiveChatId(pathname), [pathname]);
  const [me, setMe] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const loadMe = async () => {
      try {
        const res = await getCurrentUser();
        const id = res.data?.id ?? res.data?.userId ?? res.data;
        if (isMounted && id) setMe(String(id));
      } catch (_err) {
        // Ignore user lookup errors; we'll still show toasts.
      }
    };

    loadMe();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      dismissTimers.current.forEach((timer) => clearTimeout(timer));
      dismissTimers.current.clear();
    };
  }, []);

  const removeToast = (id: string) => {
    const timer = dismissTimers.current.get(id);
    if (timer) clearTimeout(timer);
    dismissTimers.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const pushToast = (toast: ToastItem) => {
    setToasts((prev) => [toast, ...prev].slice(0, MAX_TOASTS));
    const timer = setTimeout(() => removeToast(toast.id), TOAST_TTL_MS);
    dismissTimers.current.set(toast.id, timer);
  };

  useEffect(() => {
    const handleIncoming = (payload: MessageApi | MessageApi[]) => {
      const extracted = extractMessages(payload);
      const incoming = extracted.length ? extracted : (Array.isArray(payload) ? [] : [payload]);

      incoming.forEach((raw) => {
        const normalized = normalizeMessage(raw);
        if (!normalized) return;
        if (me && normalized.senderId && normalized.senderId === me) return;

        if (activeChatId) {
          if (!normalized.chatId) return;
          if (String(normalized.chatId) === String(activeChatId)) return;
        }

        if (normalized.dedupeKey) {
          if (seen.current.has(normalized.dedupeKey)) return;
          seen.current.add(normalized.dedupeKey);
          setTimeout(() => {
            seen.current.delete(normalized.dedupeKey as string);
          }, DEDUPE_TTL_MS);
        }

        const toastId = crypto.randomUUID();
        pushToast({
          id: toastId,
          title: "New message",
          description: normalized.content || "You received a new message.",
          chatId: normalized.chatId,
        });
      });
    };

    socket.on("message", handleIncoming);
    socket.on("receive-message", handleIncoming);
    return () => {
      socket.off("message", handleIncoming);
      socket.off("receive-message", handleIncoming);
    };
  }, [activeChatId, me]);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{toast.description}</p>
              ) : null}
              {toast.chatId ? (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    router.push(`/messages/${toast.chatId}`);
                    removeToast(toast.id);
                  }}
                >
                  Open chat
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
              aria-label="Dismiss"
              onClick={() => removeToast(toast.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
