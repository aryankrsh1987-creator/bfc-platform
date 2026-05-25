const players = [
  {
    rank: 1,
    username: "Shadow",
    elo: 2450,
    wins: 120,
    losses: 20,
    region: "Asia",
  },
  {
    rank: 2,
    username: "Void",
    elo: 2380,
    wins: 110,
    losses: 25,
    region: "EU",
  },
  {
    rank: 3,
    username: "Exotic",
    elo: 2290,
    wins: 98,
    losses: 18,
    region: "NA",
  },
  {
    rank: 4,
    username: "Raven",
    elo: 2200,
    wins: 87,
    losses: 30,
    region: "Asia",
  },
];

export default function LeaderboardsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">

      {/* Title */}
      <div className="mb-10">
        <h1 className="text-6xl font-bold mb-4">
          Global Rankings
        </h1>

        <p className="text-zinc-400 text-lg">
          Top verified competitive players.
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

        <table className="w-full">

          <thead className="border-b border-white/10">

            <tr className="text-left text-zinc-400">

              <th className="p-6">Rank</th>
              <th className="p-6">Player</th>
              <th className="p-6">ELO</th>
              <th className="p-6">Wins</th>
              <th className="p-6">Losses</th>
              <th className="p-6">Region</th>

            </tr>

          </thead>

          <tbody>

            {players.map((player) => (
              <tr
                key={player.rank}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >

                <td className="p-6 font-bold">
                  #{player.rank}
                </td>

                <td className="p-6">
                  <a
                    href={`/players/${player.username.toLowerCase()}`}
                    className="hover:text-purple-400 transition"
                  >
                    {player.username}
                  </a>
                </td>

                <td className="p-6 text-purple-400 font-semibold">
                  {player.elo}
                </td>

                <td className="p-6 text-green-400">
                  {player.wins}
                </td>

                <td className="p-6 text-red-400">
                  {player.losses}
                </td>

                <td className="p-6">
                  {player.region}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}