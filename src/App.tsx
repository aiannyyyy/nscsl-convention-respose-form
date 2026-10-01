import RegistrationForm from './components/RegistrationForm'

// Label for today's (Asia/Manila) registration day. Display only; the server decides the real day.
function dayLabel(): string {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date()) // yyyy-mm-dd
  if (today === '2026-10-05') return 'October 5, 2026 — Day 1'
  if (today === '2026-10-06') return 'October 6, 2026 — Day 2'
  if (today >= '2026-10-01' && today <= '2026-10-04') return 'Testing'
  return 'October 5 – 6, 2026'
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-xl font-bold sm:text-2xl text-slate-900">NSCSL Convention 2026</h1>
        <p className="mt-1 text-center font-semibold text-indigo-700">{dayLabel()}</p>
        <p className="mb-6 text-center text-slate-600">Registration Form</p>
        <RegistrationForm />
      </div>
    </main>
  )
}
