import RegistrationForm from './components/RegistrationForm'

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-xl font-bold sm:text-2xl text-slate-900">NSCSL Convention 2026</h1>
        <p className="mb-6 mt-1 text-center text-slate-600">Registration Form</p>
        <RegistrationForm />
      </div>
    </main>
  )
}
