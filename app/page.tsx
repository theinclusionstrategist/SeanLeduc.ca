import InclusyWidget from '@/components/InclusyWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto my-auto text-center space-y-6">
        <p className="text-blue-400 font-semibold tracking-wider uppercase text-sm">
          Carleton Place, Ontario
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Sean Leduc
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 font-light">
          The Inclusion Strategist &bull; Speaker &bull; U.N.I.T.E. Charity
        </p>
        <blockquote className="italic text-slate-400 border-l-2 border-blue-500 pl-4 py-2 my-6 max-w-2xl mx-auto">
          "Transforming challenges into purpose through the power of perspective."
        </blockquote>
      </div>

      {/* Inclusy Floating AI Assistant Widget */}
      <InclusyWidget />
    </main>
  );
}
