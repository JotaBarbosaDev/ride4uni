"use client";

import {useEffect, useRef, useState} from "react";
import {AlertTriangle, CheckCircle, X} from "lucide-react";

type AlertType = "success" | "danger";

type AlertItem = {
  id: string;
  type: AlertType;
  message: string;
};

type AlertEventDetail = {
  type: string;
  message: string;
};

const ALERT_EVENT = "app-alert";
const MAX_ALERTS = 3;
const ALERT_TTL_MS = 6000;

function normalizeType(value: string | undefined) {
  if (!value) return "success";
  return value.toLowerCase() === "danger" ? "danger" : "success";
}

function getTypeLabel(type: AlertType) {
  return type === "danger" ? "Danger" : "Success";
}

function buildAlertItem(detail: AlertEventDetail) {
  if (!detail || !detail.message) return null;
  return {
    id: crypto.randomUUID(),
    type: normalizeType(detail.type),
    message: String(detail.message),
  };
}

export function showAlert(type: string, message: string) {
  if (typeof window === "undefined") return;
  const detail: AlertEventDetail = {type, message};
  window.dispatchEvent(new CustomEvent(ALERT_EVENT, {detail}));
}

export function AlertToaster() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function removeAlert(id: string) {
    const timer = dismissTimers.current.get(id);
    if (timer) clearTimeout(timer);
    dismissTimers.current.delete(id);
    setAlerts(function (prev) {
      return prev.filter(function (alert) {
        return alert.id !== id;
      });
    });
  }

  function pushAlert(alert: AlertItem) {
    setAlerts(function (prev) {
      return [alert].concat(prev).slice(0, MAX_ALERTS);
    });
    const timer = setTimeout(function () {
      removeAlert(alert.id);
    }, ALERT_TTL_MS);
    dismissTimers.current.set(alert.id, timer);
  }

  useEffect(function () {
    function handleAlert(event: Event) {
      const detail = (event as CustomEvent<AlertEventDetail>).detail;
      const item = buildAlertItem(detail);
      if (!item) return;
      pushAlert(item);
    }

    window.addEventListener(ALERT_EVENT, handleAlert);
    return function () {
      window.removeEventListener(ALERT_EVENT, handleAlert);
      dismissTimers.current.forEach(function (timer) {
        clearTimeout(timer);
      });
      dismissTimers.current.clear();
    };
  }, []);

  if (!alerts.length) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {alerts.map(function (alert) {
        const isDanger = alert.type === "danger";
        return (
          <div
            key={alert.id}
            className="rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  isDanger
                    ? "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                    : "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
                }
              >
                {isDanger ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{getTypeLabel(alert.type)}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                aria-label="Dismiss"
                onClick={function () {
                  removeAlert(alert.id);
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
