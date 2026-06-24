"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { CrewRequest, Notification } from "@/lib/types";

export default function CrewDashboardPage() {
  const [requests, setRequests] = useState<CrewRequest[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const [processingNotifIds, setProcessingNotifIds] = useState<number[]>([]);

  const loadRequests = useCallback(async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData?.user?.email) {
      setRequests([]);
      setNotifications([]);
      setLoading(false);
      return;
    }

    const email = authData.user.email;

    // Notifications belong to the user, so they must load even when the user
    // does not own a crew.
    const [{ data: crews }, { data: notificationData }] = await Promise.all([
      supabase.from("crews").select("id").eq("owner_email", email),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false }),
    ]);

    setNotifications(notificationData || []);

    if (!crews || crews.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const crewIds = crews.map((crew) => crew.id);
    const { data: requestData } = await supabase
      .from("crew_requests")
      .select("*")
      .in("crew_id", crewIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setRequests(requestData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // This starts an asynchronous inbox refresh after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests();

    const interval = setInterval(loadRequests, 3000);

    return () => clearInterval(interval);
  }, [loadRequests]);

  const respondToWarNotification = async (
    notification: Notification,
    accepted: boolean,
  ) => {
    if (processingNotifIds.includes(notification.id)) return;

    setProcessingNotifIds((prev) => [...prev, notification.id]);

    try {
      const { error } = await supabase.rpc("respond_to_war_notification", {
        notification_id: notification.id,
        accepted,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notification.id),
      );
    } finally {
      setProcessingNotifIds((prev) =>
        prev.filter((id) => id !== notification.id),
      );
    }
  };

  const dismissNotification = async (notification: Notification) => {
    if (processingNotifIds.includes(notification.id)) return;

    setProcessingNotifIds((prev) => [...prev, notification.id]);

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notification.id);

      if (error) {
        alert(error.message);
        return;
      }

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notification.id),
      );
    } finally {
      setProcessingNotifIds((prev) =>
        prev.filter((id) => id !== notification.id),
      );
    }
  };

  const acceptRequest = async (request: CrewRequest) => {
    setProcessingIds((prev) => [...prev, request.id]);

    try {
      // Insert member and update request atomically; if the update fails,
      // roll back the member insert to avoid orphaned records.
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

        // Roll back the member insert to avoid orphaned records.
        await supabase
          .from("crew_members")
          .delete()
          .eq("crew_id", request.crew_id)
          .eq("member_email", request.applicant_email);

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
            {requests.map((request) => (
              <div
                key={request.id}
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
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
              >
                <h2 className="text-3xl font-black mb-3">{notif.title}</h2>

                <p className="text-zinc-300 text-lg mb-6">{notif.message}</p>

                <div className="flex gap-4">
                  {/\((.*?)\)/.test(notif.message) ? (
                    <>
                      <button
                        onClick={() => respondToWarNotification(notif, true)}
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

                      <button
                        onClick={() => respondToWarNotification(notif, false)}
                        disabled={processingNotifIds.includes(notif.id)}
                        className={`px-6 py-3 rounded-2xl font-bold transition ${
                          processingNotifIds.includes(notif.id)
                            ? "bg-red-500/50 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-400"
                        }`}
                      >
                        {processingNotifIds.includes(notif.id)
                          ? "..."
                          : "❌ Dodge"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => dismissNotification(notif)}
                      disabled={processingNotifIds.includes(notif.id)}
                      className="px-6 py-3 rounded-2xl font-bold bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                      {processingNotifIds.includes(notif.id)
                        ? "..."
                        : "Dismiss"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
