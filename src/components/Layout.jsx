import React from "react";
import { Outlet } from "react-router-dom";
import NowPlayingBar from "@/components/NowPlayingBar";
import TopNav from "@/components/TopNav";
import { UploadProvider } from "@/lib/uploadContext";

export default function Layout() {
  return (
    <UploadProvider>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-pink-400/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-rose-300/30 blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <TopNav />
          <main className="pt-2 pb-40">
            <Outlet />
          </main>
        </div>

        <NowPlayingBar />
      </div>
    </UploadProvider>
  );
}