import type { FormValues } from './validation'

export type SubmitResult =
  | { ok: true; controlNumber: string; day: number }
  | { ok: false; code: 'CLOSED' | 'DUPLICATE' | 'INVALID' | 'ERROR'; message: string }

const ENDPOINT = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined

export async function submitRegistration(values: FormValues): Promise<SubmitResult> {
  if (!ENDPOINT) return { ok: false, code: 'ERROR', message: 'Form is not configured (missing VITE_APPS_SCRIPT_URL).' }
  try {
    // text/plain avoids a CORS preflight, which Apps Script cannot answer.
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(values),
    })
    return (await res.json()) as SubmitResult
  } catch {
    return { ok: false, code: 'ERROR', message: 'Could not reach the server. Please try again.' }
  }
}
