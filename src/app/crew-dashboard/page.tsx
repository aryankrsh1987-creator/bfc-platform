"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { CrewRequest, Notification } from "@/lib/types";

export default function CrewDashboardPage() {
  const [requests, setRequests] = useState<CrewRequest[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const [processingNotifIds, setProcessingNotifIds] = useState<number[]>([]);

  useEffect(() => {
    loadRequests();

    const interval = setInterval(() => {
      loadRequests();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) return;

    // GET OWNER CREWS
    const { data: crews } = await supabase
      .from("crews")
      .select("*")
      .eq("owner_email", authData.user.email);

    if (!crews || crews.length === 0) {
      setLoading(false);

      return;
    }

    const crewNames = crews.map((crew) => crew.crew_name);

    // GET APPLICATIONS
    const { data: requestData } = await supabase
      .from("crew_requests")
      .select("*")
      .in("crew_name", crewNames)
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    setRequests(requestData || []);

    // GET NOTIFICATIONS
    const { data: notificationData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_email", authData.user.email)
      .order("created_at", {
        ascending: false,
      });

    setNotifications(notificationData || []);

    setLoading(false);
  };

  const acceptRequest = async (request: CrewRequest) => {
    setProcessingIds((prev) => [...prev, request.id]);

    try {
      const { error: memberError } = await supabase.from("crew_members").insert([
        {
          crew_id: request.crew_id,

          crew_name: request.crew_name,

          member_email: request.applicant_email,

          member_username: request.applicant_username,
        },
      ]);

      if (memberError) {
        alert(`Failed to add member: ${memberError.message}`);

        return;
      }

      const { error: updateError } = await supabase
        .from("crew_requests")
        .update({
          status: "accepted",
        })
        .eq("id", request.id);

      if (updateError) {
        alert(`Failed to update request: ${updateError.message}`);

        return;
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== request.id));
    }

    loadRequests();
  };

  const rejectRequest = async (request: CrewRequest) => {
    setProcessingIds((prev) => [...prev, request.id]);

    try {
      const { error } = await supabase
        .from("crew_requests")
        .update({
          status: "rejected",
        })
        .eq("id", request.id);

      if (error) {
        alert(`Failed to reject request: ${error.message}`);

        return;
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== request.id));
    }

    loadRequests();
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* GLOW */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/30 blur-[160px] rounded-full" />

      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full" />

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
            href="/crews"
            className="text-zinc-300 hover:text-white transition"
          >
            Crews
          </Link>

          <Link
            href="/chat"
            className="text-zinc-300 hover:text-cyan-400 transition"
          >
            Chat
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="relative z-10 px-6 pt-20 pb-10">
        <h1 className="text-6xl font-black mb-4">
          Crew
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {" "}
            Inbox
          </span>
        </h1>

        <p className="text-zinc-400 text-xl">
          Manage applications and notifications.
        </p>
      </section>

      {/* APPLICATIONS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-3xl font-black mb-6">Applications</h2>

        {loading ? (
          <div className="text-center text-zinc-400 text-xl">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center text-zinc-400 text-xl">
            No pending applications.
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request, index) => (
              <div
                key={index}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                  <div>
                    <h2 className="text-4xl font-black mb-3">
                      {request.applicant_username}
                    </h2>

                    <div className="space-y-2 text-zinc-400">
                      <p>
                        📥 Applied To:
                        <span className="text-white ml-2">
                          {request.crew_name}
                        </span>
                      </p>

                      <p>
                        🌍 Region:
                        <span className="text-white ml-2">
                          {request.applicant_region}
                        </span>
                      </p>

                      <p>
                        📧 Email:
                        <span className="text-white ml-2">
                          {request.applicant_email}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => acceptRequest(request)}
                      disabled={processingIds.includes(request.id)}
                      className={`px-8 py-4 rounded-2xl font-bold transition ${
                        processingIds.includes(request.id)
                          ? "bg-green-500/50 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-400"
                      }`}
                    >
                      {processingIds.includes(request.id) ? "..." : "Accept"}
                    </button>

                    <button
                      onClick={() => rejectRequest(request)}
                      disabled={processingIds.includes(request.id)}
                      className={`px-8 py-4 rounded-2xl font-bold transition ${
                        processingIds.includes(request.id)
                          ? "bg-red-500/50 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-400"
                      }`}
                    >
                      {processingIds.includes(request.id) ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NOTIFICATIONS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-black mb-6">Notifications</h2>

        {notifications.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center text-zinc-400 text-xl">
            No notifications.
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((notif, index) => (
              <div
                key={index}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
              >
                <h2 className="text-3xl font-black mb-3">{notif.title}</h2>

                <p className="text-zinc-300 text-lg mb-6">{notif.message}</p>

                <div className="flex gap-4">
                  {/* ACCEPT */}
                  <button
                    onClick={async () => {
                      if (processingNotifIds.includes(notif.id)) return;

                      setProcessingNotifIds((prev) => [...prev, notif.id]);

                      try {
                        const { data: authData } =
                          await supabase.auth.getUser();

                        const match = notif.message.match(/\((.*?)\)/);

                        if (match?.[1]) {
                          // CREATE PRIVATE WAR CHAT
                          const { error: chatError } = await supabase
                            .from("war_chats")
                            .insert([
                              {
                                requester_email: match[1],

                                opponent_email:
                                  authData?.user?.email ?? null,
                              },
                            ]);

                          if (chatError) {
                            alert(
                              `Failed to create war chat: ${chatError.message}`,
                            );

                            return;
                          }

                          // SEND ACCEPT NOTIFICATION
                          const { error: notifSendError } = await supabase
                            .from("notifications")
                            .insert([
                              {
                                user_email: match[1],

                                title: "⚔️ War Accepted",

                                message:
                                  "Your war request was accepted. Open war chat now.",
                              },
                            ]);

                          if (notifSendError) {
                            alert(
                              `Failed to send notification: ${notifSendError.message}`,
                            );

                            return;
                          }
                        }

                        // DELETE CURRENT NOTIFICATION
                        const { error: deleteError } = await supabase
                          .from("notifications")
                          .delete()
                          .eq("id", notif.id);

                        if (deleteError) {
                          alert(
                            `Failed to clear notification: ${deleteError.message}`,
                          );

                          return;
                        }

                        setNotifications(
                          notifications.filter((n) => n.id !== notif.id),
                        );
                      } finally {
                        setProcessingNotifIds((prev) =>
                          prev.filter((id) => id !== notif.id),
                        );
                      }
                    }}
                    disabled={processingNotifIds.includes(notif.id)}
                    className={`px-6 py-3 rounded-2xl font-bold transition ${
                      processingNotifIds.includes(notif.id)
                        ? "bg-green-500/50 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-400"
                    }`}
                  >
                    {processingNotifIds.includes(notif.id)
                      ? "..."
                      : "✅ Accept War"}
                  </button>

                  {/* DODGE */}
                  <button
                    onClick={async () => {
                      if (processingNotifIds.includes(notif.id)) return;

                      setProcessingNotifIds((prev) => [...prev, notif.id]);

                      try {
                        const match = notif.message.match(/\((.*?)\)/);

                        if (match?.[1]) {
                          const { error: notifSendError } = await supabase
                            .from("notifications")
                            .insert([
                              {
                                user_email: match[1],

                                title: "❌ War Dodged",

                                message: "Your war request was dodged.",
                              },
                            ]);

                          if (notifSendError) {
                            alert(
                              `Failed to send dodge notification: ${notifSendError.message}`,
                            );

                            return;
                          }
                        }

                        const { error: deleteError } = await supabase
                          .from("notifications")
                          .delete()
                          .eq("id", notif.id);

                        if (deleteError) {
                          alert(
                            `Failed to clear notification: ${deleteError.message}`,
                          );

                          return;
                        }

                        setNotifications(
                          notifications.filter((n) => n.id !== notif.id),
                        );
                      } finally {
                        setProcessingNotifIds((prev) =>
                          prev.filter((id) => id !== notif.id),
                        );
                      }
                    }}
                    disabled={processingNotifIds.includes(notif.id)}
                    className={`px-6 py-3 rounded-2xl font-bold transition ${
                      processingNotifIds.includes(notif.id)
                        ? "bg-red-500/50 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-400"
                    }`}
                  >
                    {processingNotifIds.includes(notif.id) ? "..." : "❌ Dodge"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
