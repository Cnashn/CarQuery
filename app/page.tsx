import { Car } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0c111c] text-white flex items-center justify-center p-8">
      <div className="max-w-3xl space-y-4 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#1a1f2b] text-amber-400 mx-auto shadow-lg">
          <Car className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-bold">Welcome to CarQuery</h1>
        <p className="text-lg text-zinc-300">
          Search used cars and compare prices across multiple sites. Pick your make, model, and color, and you’ll get the lowest-mileage matches.
        </p>
        <a
          href="/search"
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-amber-400 text-slate-950 font-semibold hover:bg-amber-500 transition-colors"
        >
          Start searching
        </a>
      </div>
    </main>
  )
}
