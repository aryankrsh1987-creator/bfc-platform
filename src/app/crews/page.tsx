"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CrewsPage() {

  const ADMIN_EMAIL =
    "aryan.kr.sh1987@gmail.com";

  const [user, setUser] =
    useState<any>(null);

  const [selectedRegion, setSelectedRegion] =
    useState("Global");

  const [search, setSearch] =
    useState("");

  const [crews, setCrews] =
    useState<any[]>([]);

  // FETCH USER + CREWS
  useEffect(() => {

    const loadData = async () => {

      const { data } =
        await supabase.auth.getUser();

      if (data.user) {

        setUser(data.user);

      }

      fetchCrews();

    };

    loadData();

  }, []);

  // FETCH CREWS
  const fetchCrews = async () => {

    const { data } =
      await supabase
        .from("crews")
        .select("*")
        .order("org_won", {
          ascending: false,
        });

    if (data) {

      setCrews(data);

    }

  };

  // APPLY TO CREW
  const applyToCrew = async (
    crew: any
  ) => {

    const { data: authData } =
      await supabase.auth.getUser();

    if (!authData.user) {

      alert("Login first.");

      return;

    }

    const { error } = await supabase
      .from("crew_requests")
      .insert([

        {

          crew_id: crew.id,

          crew_name: crew.crew_name,

          applicant_email:
            authData.user.email,

          applicant_username:
            authData.user.user_metadata
              ?.full_name ||

            authData.user.email,

          applicant_region:
            crew.region,

        },

      ]);

    if (error) {

      alert(error.message);

      return;

    }

    alert("Application sent!");

  };

  // DELETE CREW
  const deleteCrew = async (
    crewId: number
  ) => {

    const confirmDelete =
      confirm(
        "Delete this crew?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase
        .from("crews")
        .delete()
        .eq("id", crewId);

    if (error) {

      alert(error.message);

      return;

    }

    alert("Crew deleted!");

    fetchCrews();

  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-600/30 blur-[160px] rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl bg-black/20">

        <Link
          href="/"
          className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          BFC
        </Link>

        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="text-zinc-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            href="/rules"
            className="text-zinc-300 hover:text-red-400 transition"
          >
            Rules
          </Link>

        </div>

      </nav>

      {/* HEADER */}
      <section className="relative z-10 px-6 pt-20 pb-12 text-center">

        <p className="text-purple-400 font-bold tracking-[6px] mb-4">
          CREW RANKINGS
        </p>

        <h1 className="text-6xl md:text-7xl font-black mb-6">

          Organized War
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {" "}Leaderboard
          </span>

        </h1>

      </section>

      {/* SEARCH */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-12">

        <div className="max-w-2xl mx-auto mb-10">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search crews..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 outline-none"
          />

        </div>

        {/* REGIONS */}
        <div className="flex flex-wrap justify-center gap-4">

          {[
            "Global",
            "Asia",
            "Europe",
            "Middle East",
            "North America",
            "South America",
          ].map((region) => (

            <button
              key={region}
              onClick={() =>
                setSelectedRegion(region)
              }
              className={`px-6 py-3 rounded-2xl font-bold transition duration-300

              ${selectedRegion === region
                ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                : "bg-white/5 border border-white/10 hover:bg-white/10"}

              `}
            >
              {region}
            </button>

          ))}

        </div>

      </section>

      {/* BUTTONS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-12">

        <div className="flex flex-wrap justify-center gap-5">

          <Link
            href="/submit-war"
            className="bg-gradient-to-r from-red-500 to-purple-500 px-8 py-5 rounded-3xl font-black text-xl hover:scale-105 transition duration-300 shadow-[0_0_40px_rgba(239,68,68,0.35)]"
          >
            ⚔️ Upload War Logs
          </Link>

          <Link
            href="/create-crew"
            className="bg-white/[0.05] border border-white/10 px-8 py-5 rounded-3xl font-black text-xl hover:bg-white/[0.08] hover:scale-105 transition duration-300"
          >
            👑 Create Crew
          </Link>

        </div>

      </section>

      {/* CREWS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">

        <div className="space-y-6">

          {crews
            .filter((crew) => {

              const matchesRegion =

                selectedRegion === "Global"
                  ? true
                  : crew.region === selectedRegion;

              const matchesSearch =

                crew.crew_name
                  ?.toLowerCase()
                  .includes(search.toLowerCase());

              return (
                matchesRegion &&
                matchesSearch
              );

            })
            .map((crew, index) => (

            <div
              key={index}
              className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
            >

              {/* TOP */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-8">

                <div className="flex items-center gap-6">

                  <div className="text-5xl font-black text-zinc-700 min-w-[90px]">
                    #{index + 1}
                  </div>

                  <div>

                    <h2 className="text-4xl font-black mb-2">

                      {crew.crew_name}

                    </h2>

                    <div className="flex flex-wrap gap-5 text-zinc-400">

                      <p>
                        👑 Owner:
                        <span className="text-white ml-2">

                          {crew.owner_username}

                        </span>
                      </p>

                      <p>
                        🌍 {crew.region}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center">

                  <p className="text-zinc-500 text-sm mb-2">
                    Pub Wars Won
                  </p>

                  <p className="text-4xl font-black text-green-400">
                    {crew.pub_won || 0}
                  </p>

                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center">

                  <p className="text-zinc-500 text-sm mb-2">
                    Pub Wars Lost
                  </p>

                  <p className="text-4xl font-black text-red-400">
                    {crew.pub_lost || 0}
                  </p>

                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center">

                  <p className="text-zinc-500 text-sm mb-2">
                    Org Wars Won
                  </p>

                  <p className="text-4xl font-black text-cyan-400">
                    {crew.org_won || 0}
                  </p>

                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center">

                  <p className="text-zinc-500 text-sm mb-2">
                    Org Wars Lost
                  </p>

                  <p className="text-4xl font-black text-orange-400">
                    {crew.org_lost || 0}
                  </p>

                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4">

                <button
                  onClick={() =>
                    applyToCrew(crew)
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 py-4 rounded-2xl font-bold hover:scale-[1.02] transition duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                >
                  Apply To Join
                </button>

                <Link
                  href={`/request-war?crew=${encodeURIComponent(
                    crew.crew_name
                  )}`}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 py-4 rounded-2xl font-bold hover:scale-[1.02] transition duration-300 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.35)]"
                >
                  ⚔️ Request War
                </Link>

              </div>

              {/* ADMIN DELETE */}
              {user &&
                user.email === ADMIN_EMAIL && (

                <button
                  onClick={() =>
                    deleteCrew(crew.id)
                  }
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 transition duration-300 py-3 rounded-2xl font-black"
                >
                  🗑 Delete Crew
                </button>

              )}

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}