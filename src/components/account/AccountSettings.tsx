"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { LogOut } from "@/icons";
import { ACCOUNT_CARD_CLASS } from "./format";

type AccountSettingsProps = {
  name: string;
  email: string;
  /** Updates the banner and header after a rename. */
  onNameSaved: (name: string) => void;
};

type FormState = {
  kind: "idle" | "saving" | "saved" | "error";
  message?: string;
};

/**
 * Sends a JSON request and returns the parsed body or throws its error.
 *
 * @param path - API path
 * @param method - HTTP method
 * @param body - JSON payload
 */
async function send<T>(
  path: string,
  method: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

/**
 * Inline status line under a settings form.
 *
 * @param props - Current form state
 */
function StatusLine({ state }: { state: FormState }) {
  if (state.kind !== "saved" && state.kind !== "error") return null;
  return (
    <p
      className={`text-sm ${state.kind === "error" ? "text-primary" : "text-emerald-700"}`}
      role={state.kind === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

/**
 * Name, password, and sign-out controls.
 *
 * @param props - Current name and email plus the rename callback
 */
export default function AccountSettings({
  name,
  email,
  onNameSaved,
}: AccountSettingsProps) {
  const router = useRouter();
  const [draftName, setDraftName] = useState(name);
  const [nameState, setNameState] = useState<FormState>({ kind: "idle" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordState, setPasswordState] = useState<FormState>({
    kind: "idle",
  });
  const [loggingOut, setLoggingOut] = useState(false);

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    setNameState({ kind: "saving" });
    try {
      const data = await send<{ name: string }>("/api/account", "PATCH", {
        name: draftName,
      });
      onNameSaved(data.name);
      setDraftName(data.name);
      setNameState({ kind: "saved", message: "Name updated." });
      router.refresh();
    } catch (err) {
      setNameState({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordState({ kind: "saving" });
    try {
      await send("/api/account/password", "POST", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordState({ kind: "saved", message: "Password changed." });
    } catch (err) {
      setPasswordState({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveName} className={`${ACCOUNT_CARD_CLASS} space-y-4`}>
        <div>
          <p className="type-eyebrow text-primary">Personal details</p>
          <p className="type-h4 mt-2 text-ink">Your name and email</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="type-ui mb-1.5 block text-ink/80"
              htmlFor="account-name"
            >
              Full name
            </label>
            <input
              id="account-name"
              className="booking-input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label
              className="type-ui mb-1.5 block text-ink/80"
              htmlFor="account-email"
            >
              Email
            </label>
            <input
              id="account-email"
              className="booking-input bg-surface-muted! text-ink/60"
              value={email}
              readOnly
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={
              nameState.kind === "saving" || draftName.trim() === name.trim()
            }
          >
            {nameState.kind === "saving" ? "Saving…" : "Save name"}
          </Button>
          <StatusLine state={nameState} />
        </div>
      </form>

      <form
        onSubmit={savePassword}
        className={`${ACCOUNT_CARD_CLASS} space-y-4`}
      >
        <div>
          <p className="type-eyebrow text-primary">Security</p>
          <p className="type-h4 mt-2 text-ink">Change password</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="type-ui mb-1.5 block text-ink/80"
              htmlFor="current-password"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              className="booking-input"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label
              className="type-ui mb-1.5 block text-ink/80"
              htmlFor="new-password"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className="booking-input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={passwordState.kind === "saving"}
          >
            {passwordState.kind === "saving" ? "Saving…" : "Change password"}
          </Button>
          <StatusLine state={passwordState} />
        </div>
      </form>

      <div
        className={`${ACCOUNT_CARD_CLASS} flex flex-wrap items-center justify-between gap-4`}
      >
        <div>
          <p className="type-h4 text-ink">Log out</p>
          <p className="mt-1 text-sm text-ink/60">
            Sign out of your account on this device.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="md"
          className="border-ink/15!"
          onClick={logout}
          disabled={loggingOut}
        >
          <LogOut size={16} />
          {loggingOut ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </div>
  );
}
