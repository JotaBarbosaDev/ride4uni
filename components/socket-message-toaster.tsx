"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {MessageSquare, X} from "lucide-react";
import {socket} from "@/Service/socket.js";
import {getCurrentUser} from "@/api/authService";

type SocketPayload = {
  message?: string;
  chatId?: string;
  senderId?: string;
};

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  chatId?: string;
};

//Filtrar o ChatId da pagina atual//
function getActiveChatId(pathname: string | null) {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "messages") return null;
  return parts[1] ?? null;
}

const MAX_TOASTS = 3;
const TOAST_TTL_MS = 6000;

export function SocketMessageToaster() {
  const router = useRouter();
  const pathname = usePathname();
  const activeChatId = useMemo(function () {
    return getActiveChatId(pathname);
  }, [pathname]);
  const [me, setMe] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(function () {
    let isMounted = true;
    async function loadMe() {
      try {
        const res = await getCurrentUser();
        const id = res.data?.id ?? res.data?.userId ?? res.data;
        if (isMounted && id) setMe(String(id));
      } catch (_err) {
      }
    }

    loadMe();
    return function () {
      isMounted = false;
    };
  }, []);

  useEffect(function () {
    return function () {
      dismissTimers.current.forEach(function (timer) {
        clearTimeout(timer);
      });
      dismissTimers.current.clear();
    };
  }, []);

  function removeToast(id: string) {
    const timer = dismissTimers.current.get(id);
    if (timer) clearTimeout(timer);
    dismissTimers.current.delete(id);
    setToasts(function (prev) {
      return prev.filter(function (toast) {
        return toast.id !== id;
      });
    });
  }

  function pushToast(toast: ToastItem) {
    setToasts(function (prev) {
      return [toast].concat(prev).slice(0, MAX_TOASTS);
    });
    const timer = setTimeout(function () {
      removeToast(toast.id);
    }, TOAST_TTL_MS);
    dismissTimers.current.set(toast.id, timer);
  }

  useEffect(function () {
    function handleIncoming(payload: SocketPayload) {
      if (!payload) return;
      if (me && payload.senderId && payload.senderId === me) return;

      if (activeChatId && payload.chatId && String(payload.chatId) === String(activeChatId)) {
        return;
      }

      const toastId = crypto.randomUUID();
      pushToast({
        id: toastId,
        title: "New message",
        description: payload.message || "You received a new message.",
        chatId: payload.chatId,
      });
    }

    socket.on("receive-message", handleIncoming);
    return function () {
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
      {toasts.map(function (toast) {
        return (
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
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={function () {
                  const target = toast.chatId ? `/messages/${toast.chatId}` : "/messages";
                  router.push(target);
                  removeToast(toast.id);
                }}
              >
                Open chat
              </button>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
              aria-label="Dismiss"
              onClick={function () {
                removeToast(toast.id);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
