import type { ActionState } from "@/lib/validation";

export function FormFeedback({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p>;
}

export function FieldError({ state, name }: { state: ActionState; name: string }) {
  const message = state.errors?.[name]?.[0];
  return message ? <p className="field-error" id={`${name}-error`}>{message}</p> : null;
}
