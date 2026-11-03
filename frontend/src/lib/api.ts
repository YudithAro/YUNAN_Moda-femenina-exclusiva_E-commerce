import { supabase } from "@/lib/supabase";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo completar la operación. Inténtalo de nuevo.";
}

function reportError(error: Error) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("yunan:api-error", { detail: error.message }));
  }
}

/** Requests to the Render API always use the current Supabase session. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) throw new ApiError("Tu sesión terminó. Vuelve a iniciar sesión.", 401);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
    const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(45000),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const detail = Array.isArray(payload?.message) ? payload.message.join(". ") : payload?.message;
      const message = response.status === 401 ? "Tu sesión terminó. Vuelve a iniciar sesión."
        : response.status === 403 ? "Tu cuenta no tiene permiso para realizar esta operación."
        : response.status >= 500 ? "El servidor no pudo completar la operación. Inténtalo de nuevo."
        : typeof detail === "string" ? detail : "No se pudo completar la operación.";
      throw new ApiError(message, response.status);
    }
    return response;
  } catch (error) {
    const failure = error instanceof ApiError ? error : new ApiError("No se pudo conectar con la tienda. Revisa tu conexión e inténtalo de nuevo.", 0);
    reportError(failure);
    throw failure;
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  return response.json() as Promise<T>;
}

export interface CurrentUser { id: string; email: string; role: "ADMIN" | "USER"; }
