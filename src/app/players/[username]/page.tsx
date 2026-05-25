type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PlayerProfile({ params }: Props) {

  const { username } = await params;

  return (
    <main className="min-h-screen bg-black text-white p-8">

      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

        <div className="flex items-center gap-6">

          {/* Avatar */}
          <div className="w-28 h-28 rounded-full bg-purple-600 flex items-center justify-center text-4xl font-bold">
            {username.charAt(0).toUpperCase()}
          </div>

          {/* Player Info */}
          <div>

            <h1 className="text-5xl font-bold mb-2">
              {username}
            </h1>

            <p className="text-zinc-400 text-lg">
              Verified Competitive Player
            </p>

          </div>

        </div>

      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-zinc-400 mb-2">
            ELO
          </h2>

          <p className="text-4xl font-bold text-purple-400">
            2450
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-zinc-400 mb-2">
            Wins
          </h2>

          <p className="text-4xl font-bold text-green-400">
            120
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-zinc-400 mb-2">
            Losses
          </h2>

          <p className="text-4xl font-bold text-red-400">
            20
          </p>
        </div>

      </section>

    </main>
  );
}