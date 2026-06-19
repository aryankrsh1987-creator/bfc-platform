export default function LoadingFallback() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
      {/* Glows */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/20 blur-[160px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="w-12 h-12 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />

        <p className="text-zinc-500 text-sm tracking-[4px] font-bold animate-pulse">
          LOADING
        </p>
      </div>
    </main>
  );
}
