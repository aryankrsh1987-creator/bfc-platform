import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PlayerProfile({ params }: Props) {
  const { username } = await params;

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!player) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Player Not Found</h1>
          <p className="text-zinc-400 text-lg">
            No player found with username &quot;{username}&quot;.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          {player.avatar_url ? (
            <img
              src={player.avatar_url}
              alt={player.display_name || player.username}
              className="w-28 h-28 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-purple-600 flex items-center justify-center text-4xl font-bold">
              {(player.display_name || player.username || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          {/* Player Info */}
          <div>
            <h1 className="text-5xl font-bold mb-2">
              {player.display_name || player.username}
            </h1>

            <p className="text-zinc-400 text-lg">@{player.username}</p>

            {player.region && (
              <p className="text-zinc-500 text-sm mt-1">🌍 {player.region}</p>
            )}
          </div>
        </div>

        {/* Status */}
        {player.status && (
          <div className="mt-6 bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs tracking-widest mb-1">STATUS</p>
            <p className="text-xl font-semibold">{player.status}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-zinc-400 mb-2">Region</h2>
          <p className="text-4xl font-bold text-purple-400">
            {player.region || "N/A"}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-zinc-400 mb-2">Device</h2>
          <p className="text-4xl font-bold text-cyan-400">
            {player.device || "N/A"}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-zinc-400 mb-2">Rank</h2>
          <p className="text-4xl font-bold text-green-400">Competitive</p>
        </div>
      </section>
    </main>
  );
}
