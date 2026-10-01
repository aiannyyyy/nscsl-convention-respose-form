import { useState, type FormEvent } from 'react'
import { submitRegistration } from '../lib/api'
import { emptyForm, validate, type FormErrors, type FormValues } from '../lib/validation'
import { Field, inputClass } from './Field'

export default function RegistrationForm() {
  const [values, setValues] = useState<FormValues>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [closed, setClosed] = useState(false)
  const [done, setDone] = useState<{ controlNumber: string; day: number } | null>(null)

  const set = (k: keyof FormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const errs = validate(values)
    setErrors(errs)
    setServerError('')
    if (Object.keys(errs).length) return

    setSubmitting(true)
    const res = await submitRegistration(values)
    setSubmitting(false)

    if (res.ok) setDone({ controlNumber: res.controlNumber, day: res.day })
    else if (res.code === 'CLOSED') setClosed(true)
    else setServerError(res.message)
  }

  if (closed)
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Registration is closed</h2>
        <p className="mt-2 text-slate-600">Registration is only open on October 5 and 6, 2026.</p>
      </div>
    )

  if (done)
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow sm:p-8">
        <h2 className="text-xl font-semibold text-green-700">Registration successful!</h2>
        <p className="mt-2 text-slate-600">{done.day === 0 ? 'Test registration' : `Day ${done.day}`} — your control number is</p>
        <p className="my-3 break-all text-2xl font-bold tracking-wider text-indigo-700 sm:text-3xl">{done.controlNumber}</p>
        <p className="text-sm text-slate-500">Please save or screenshot this number.</p>
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl bg-white p-5 shadow sm:p-6">
      <Field label="Email Address" error={errors.email}>
        <input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" className={inputClass} value={values.email} onChange={set('email')} disabled={submitting} />
      </Field>
      <Field label="Name" error={errors.name}>
        <input autoComplete="name" className={inputClass} value={values.name} onChange={set('name')} disabled={submitting} />
      </Field>
      <Field label="Gender" error={errors.gender}>
        <select className={inputClass} value={values.gender} onChange={set('gender')} disabled={submitting}>
          <option value="">Select…</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </Field>
      <Field label="Designation" error={errors.designation}>
        <input className={inputClass} value={values.designation} onChange={set('designation')} disabled={submitting} />
      </Field>
      <Field label="Place of Assignment" error={errors.placeOfAssignment}>
        <input className={inputClass} value={values.placeOfAssignment} onChange={set('placeOfAssignment')} disabled={submitting} />
      </Field>
      <Field label="Contact Number" error={errors.contactNumber}>
        <input type="tel" autoComplete="tel" inputMode="tel" placeholder="Enter you mobile number" className={inputClass} value={values.contactNumber} onChange={set('contactNumber')} disabled={submitting} />
      </Field>

      {serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-base font-semibold text-white active:bg-indigo-800 hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
