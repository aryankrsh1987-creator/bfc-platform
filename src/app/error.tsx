"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught by error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden relative">
      {/* Glows */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-red-600/20 blur-[160px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/20 blur-[160px] rounded-full" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 text-center max-w-lg">
        <div className="text-7xl mb-6">⚠️</div>

        <h1 className="text-5xl font-black mb-4">
          Something went
          <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
            {" "}
            wrong
          </span>
        </h1>

        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return home.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition duration-300 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="border border-white/10 bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition duration-300"
          >
            Go Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-zinc-600 text-xs">Error ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
