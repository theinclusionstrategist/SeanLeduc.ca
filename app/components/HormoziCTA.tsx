export default function HormoziCTA() {
  return (
    <section className="bg-slate-900 border-y border-slate-800 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
          Free Executive Resource
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          Keep More Of What You Earn. <br />
          <span className="text-blue-500">Scale Without The CRA Drain.</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Get the exact IPP & Corporate Insurance checklist Sean uses to optimize executive compensation for Ontario business owners.
        </p>
        
        {/* Value Stack Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-300 py-2">
          <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">✓ 100% Free Strategy Guide</span>
          <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">✓ 5-Minute Read</span>
          <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">✓ No Obligation</span>
        </div>

        {/* Lead Capture Form */}
        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-4">
          <input
            type="email"
            placeholder="Enter your corporate email..."
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-blue-600/25 whitespace-nowrap"
          >
            Claim Free Blueprint →
          </button>
        </form>
      </div>
    </section>
  );
}
