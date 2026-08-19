"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  CircleCheck,
  Download,
  ExternalLink,
  Loader2,
  Send,
  Share,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPushSubscriptionStatus,
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type BusyAction = "install" | "subscribe" | "unsubscribe" | "send" | null;
type PushState =
  | "loading"
  | "service-worker-error"
  | "unsupported"
  | "not-configured"
  | "ios-install-required"
  | "permission-denied"
  | "auth-required"
  | "auth-error"
  | "not-subscribed"
  | "subscribed";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function openPwaSettings() {
  window.dispatchEvent(new CustomEvent("repodeck:open-pwa-settings"));
}

export function PwaManager() {
  const { status: authStatus, authenticated, signIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [serviceWorkerFailed, setServiceWorkerFailed] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [ownershipChecking, setOwnershipChecking] = useState(false);
  const [ownershipMismatch, setOwnershipMismatch] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );
  const [message, setMessage] = useState("RepoDeck notifications are working.");
  const [busy, setBusy] = useState<BusyAction>(null);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const pushConfigured = Boolean(vapidPublicKey);

  useEffect(() => {
    const openSettings = () => setOpen(true);
    window.addEventListener("repodeck:open-pwa-settings", openSettings);
    return () =>
      window.removeEventListener("repodeck:open-pwa-settings", openSettings);
  }, []);

  useEffect(() => {
    setStandalone(isInstalled());
    setIsIOS(isIOSDevice());

    const canServiceWorker = "serviceWorker" in navigator;
    setServiceWorkerSupported(canServiceWorker);
    const canPush =
      canServiceWorker && "PushManager" in window && "Notification" in window;
    setPushSupported(canPush);
    if ("Notification" in window) setPermission(Notification.permission);

    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const installed = () => {
      setStandalone(true);
      setInstallPrompt(null);
      toast.success("RepoDeck is installed.");
    };

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);

    if (canServiceWorker) {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then(() => setServiceWorkerReady(true))
        .catch((error) => {
          setServiceWorkerFailed(true);
          console.error("Service worker registration failed:", error);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const reconcileSubscription = useCallback(async () => {
    if (
      !pushSupported ||
      !serviceWorkerReady ||
      authStatus === "loading" ||
      authStatus === "error"
    ) {
      return;
    }

    setOwnershipChecking(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const browserSubscription =
        await registration.pushManager.getSubscription();

      if (!browserSubscription) {
        setSubscription(null);
        setOwnershipMismatch(false);
        return;
      }

      if (authStatus === "anonymous") {
        // Only a confirmed anonymous session may destructively reconcile local
        // push state. A loading or failed auth request must never unsubscribe a
        // valid browser subscription.
        await browserSubscription.unsubscribe().catch(() => false);
        setSubscription(null);
        setOwnershipMismatch(false);
        return;
      }

      const status = await getPushSubscriptionStatus(
        browserSubscription.endpoint,
      );
      if (status.success && status.ownedByCurrentUser) {
        setSubscription(browserSubscription);
        setOwnershipMismatch(false);
        return;
      }

      if (status.success && !status.ownedByCurrentUser) {
        await browserSubscription.unsubscribe().catch(() => false);
        setSubscription(null);
        setOwnershipMismatch(true);
        return;
      }

      // Do not claim "subscribed" when ownership cannot be established.
      setSubscription(null);
    } catch (error) {
      console.error("Push ownership reconciliation failed:", error);
      setSubscription(null);
    } finally {
      setOwnershipChecking(false);
    }
  }, [authStatus, pushSupported, serviceWorkerReady]);

  useEffect(() => {
    void reconcileSubscription();
  }, [reconcileSubscription]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("repodeck-pwa");
    channel.addEventListener("message", () => void reconcileSubscription());
    return () => channel.close();
  }, [reconcileSubscription]);

  const broadcastPwaChange = useCallback(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("repodeck-pwa");
    channel.postMessage("subscription-changed");
    channel.close();
  }, []);

  const installDescription = useMemo(() => {
    if (standalone) return "RepoDeck is installed and running in app mode.";
    if (installPrompt)
      return "Install RepoDeck for a standalone window and home-screen access.";
    if (isIOS)
      return "On iPhone or iPad, install RepoDeck from Safari's Share menu.";
    return "Use your browser's Install app command when it becomes available.";
  }, [installPrompt, isIOS, standalone]);

  const pushState = useMemo<PushState>(() => {
    if (serviceWorkerFailed) return "service-worker-error";
    if (!serviceWorkerSupported || !pushSupported) return "unsupported";
    if (!serviceWorkerReady || ownershipChecking || authStatus === "loading") {
      return "loading";
    }
    if (!pushConfigured) return "not-configured";
    if (isIOS && !standalone) return "ios-install-required";
    if (permission === "denied") return "permission-denied";
    if (authStatus === "error") return "auth-error";
    if (authStatus === "anonymous") return "auth-required";
    if (subscription) return "subscribed";
    return "not-subscribed";
  }, [
    authStatus,
    isIOS,
    ownershipChecking,
    permission,
    pushConfigured,
    pushSupported,
    serviceWorkerFailed,
    serviceWorkerReady,
    serviceWorkerSupported,
    standalone,
    subscription,
  ]);

  const requestInstall = useCallback(async () => {
    if (!installPrompt) return;
    setBusy("install");
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
    } finally {
      setBusy(null);
    }
  }, [installPrompt]);

  const serializeSubscription = useCallback((sub: PushSubscription) => {
    const value = sub.toJSON();
    if (!value.endpoint || !value.keys?.p256dh || !value.keys.auth) {
      throw new Error("The browser returned an incomplete push subscription.");
    }
    return {
      endpoint: value.endpoint,
      expirationTime: value.expirationTime ?? null,
      keys: { p256dh: value.keys.p256dh, auth: value.keys.auth },
    };
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!authenticated) {
      signIn(`${window.location.pathname}${window.location.search}`);
      return;
    }
    if ((isIOS && !standalone) || !pushSupported || !vapidPublicKey) return;

    setBusy("subscribe");
    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission !== "granted") {
        toast.error("Notification permission was not granted.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const sub =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const result = await subscribeUser(serializeSubscription(sub));
      if (!result.success) {
        if (result.code === "OWNERSHIP_CONFLICT" || !existing) {
          await sub.unsubscribe().catch(() => false);
        }
        throw new Error(result.error);
      }

      setSubscription(sub);
      setOwnershipMismatch(false);
      broadcastPwaChange();
      toast.success("Push notifications are enabled.");
    } catch (error) {
      console.error("Push subscription failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not enable push notifications.",
      );
    } finally {
      setBusy(null);
    }
  }, [
    authenticated,
    broadcastPwaChange,
    isIOS,
    pushSupported,
    serializeSubscription,
    signIn,
    standalone,
    vapidPublicKey,
  ]);

  const disableNotifications = useCallback(async () => {
    if (!subscription) return;
    setBusy("unsubscribe");
    try {
      const serverResult = authenticated
        ? await unsubscribeUser(subscription.endpoint)
        : { success: true as const };

      await subscription.unsubscribe().catch(() => false);
      setSubscription(null);
      setOwnershipMismatch(false);
      broadcastPwaChange();

      if (!serverResult.success) throw new Error(serverResult.error);
      toast.success("Push notifications are disabled on this browser.");
    } catch (error) {
      console.error("Push unsubscribe failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not disable push notifications.",
      );
    } finally {
      setBusy(null);
    }
  }, [authenticated, broadcastPwaChange, subscription]);

  const sendTest = useCallback(async () => {
    if (!subscription || !authenticated) return;
    setBusy("send");
    try {
      const result = await sendNotification(
        subscription.endpoint,
        message,
        `${window.location.pathname}${window.location.search}`,
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Test notification sent.");
    } catch (error) {
      console.error("Test notification failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send the test notification.",
      );
    } finally {
      setBusy(null);
    }
  }, [authenticated, message, subscription]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="text-primary h-4 w-4" />
            Install & notifications
          </DialogTitle>
          <DialogDescription>
            Install RepoDeck as an app and manage push notifications for this
            browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <section className="border-border bg-card rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  {standalone ? (
                    <CircleCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Download className="text-muted-foreground h-4 w-4" />
                  )}
                  Install RepoDeck
                </div>
                <p className="text-muted-foreground mt-1 text-xs/relaxed">
                  {installDescription}
                </p>
              </div>
              {!standalone && installPrompt && (
                <Button
                  size="sm"
                  onClick={requestInstall}
                  disabled={busy !== null}
                >
                  {busy === "install" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  Install
                </Button>
              )}
            </div>

            {!standalone && isIOS && (
              <Alert className="mt-3">
                <Share />
                <AlertTitle>Install from Safari</AlertTitle>
                <AlertDescription>
                  Tap Share, then choose <strong>Add to Home Screen</strong>.
                  Notifications become available from the installed Home Screen
                  app on supported iOS/iPadOS versions.
                </AlertDescription>
              </Alert>
            )}
          </section>

          <section className="border-border bg-card rounded-lg border p-3">
            <div className="flex items-center gap-2 font-medium">
              {pushState === "subscribed" ? (
                <Bell className="h-4 w-4 text-emerald-500" />
              ) : (
                <BellOff className="text-muted-foreground h-4 w-4" />
              )}
              Push notifications
            </div>

            {ownershipMismatch && (
              <Alert className="mt-3">
                <BellOff />
                <AlertTitle>Subscription reset</AlertTitle>
                <AlertDescription>
                  This browser had a subscription that was not owned by the
                  current RepoDeck account. It was removed; enable notifications
                  again if you want them for this account.
                </AlertDescription>
              </Alert>
            )}

            {pushState === "service-worker-error" ? (
              <Alert className="mt-3" variant="destructive">
                <BellOff />
                <AlertTitle>Service worker unavailable</AlertTitle>
                <AlertDescription>
                  Reload over HTTPS and check the browser console for the
                  registration error.
                </AlertDescription>
              </Alert>
            ) : pushState === "loading" ? (
              <p className="text-muted-foreground mt-2 text-xs" role="status">
                Checking notification support…
              </p>
            ) : pushState === "unsupported" ? (
              <p className="text-muted-foreground mt-2 text-xs/relaxed">
                This browser does not expose the Service Worker and Push APIs
                required for web push.
              </p>
            ) : pushState === "not-configured" ? (
              <Alert className="mt-3">
                <BellOff />
                <AlertTitle>Server setup required</AlertTitle>
                <AlertDescription>
                  Add the VAPID environment variables documented in
                  <code className="mx-1">.env.example</code> to enable push.
                </AlertDescription>
              </Alert>
            ) : pushState === "ios-install-required" ? (
              <Alert className="mt-3">
                <Share />
                <AlertTitle>Install RepoDeck first</AlertTitle>
                <AlertDescription>
                  On iPhone and iPad, add RepoDeck to the Home Screen and open
                  the installed app before enabling notifications.
                </AlertDescription>
              </Alert>
            ) : pushState === "permission-denied" ? (
              <Alert className="mt-3" variant="destructive">
                <BellOff />
                <AlertTitle>Notifications are blocked</AlertTitle>
                <AlertDescription>
                  Allow notifications for this site in your browser or system
                  settings, then reopen this panel.
                </AlertDescription>
              </Alert>
            ) : pushState === "auth-error" ? (
              <Alert className="mt-3">
                <BellOff />
                <AlertTitle>Could not verify your account</AlertTitle>
                <AlertDescription>
                  RepoDeck could not confirm your sign-in state. Your browser
                  subscription was left unchanged. Reconnect or reload, then try
                  again.
                </AlertDescription>
              </Alert>
            ) : pushState === "auth-required" ? (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs/relaxed">
                  Sign in so this browser&apos;s subscription is tied to your
                  RepoDeck account.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    signIn(
                      `${window.location.pathname}${window.location.search}`,
                    )
                  }
                >
                  Sign in
                  <ExternalLink />
                </Button>
              </div>
            ) : pushState === "subscribed" && subscription ? (
              <div className="mt-3 grid gap-2">
                <p className="text-muted-foreground text-xs/relaxed">
                  This browser is subscribed to the current account. Send a test
                  to verify end-to-end delivery.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={message}
                    maxLength={140}
                    aria-label="Test notification message"
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={sendTest}
                    disabled={busy !== null || message.trim().length === 0}
                  >
                    {busy === "send" ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send />
                    )}
                    Send test
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 justify-self-start"
                  onClick={disableNotifications}
                  disabled={busy !== null}
                >
                  {busy === "unsubscribe" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <BellOff />
                  )}
                  Disable notifications
                </Button>
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs/relaxed">
                  Permission is requested only after you click Enable.
                </p>
                <Button
                  size="sm"
                  onClick={enableNotifications}
                  disabled={busy !== null}
                >
                  {busy === "subscribe" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Bell />
                  )}
                  Enable
                </Button>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
