import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import NowPlayingBar from "@/components/NowPlayingBar";
import BottomNav from "@/components/BottomNav";
import { UploadProvider } from "@/lib/uploadContext";

const LOGO_URL = "https://media.base44.com/images/public/6acea8c53ba315332ee93348/ca2106e15_strawberry2.png";

export default function Layout() {
  return (
    <UploadProvider>
      <div className="min-h-screen relative">
        {/* ambient pink blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-pink-400/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-rose-300/30 blur-3xl" />
        </div>

        {/* slim top brand bar */}
        <header className="sticky top-0 z-30 px-4 pt-4">
          <div className="max-w-3xl mx-auto glass rounded-full px-4 py-2 flex items-center justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-md shadow-pink-300/40 ring-1 ring-pink-200/60">
                <Image src={LOGO_URL} alt="Strawberry" className="w-full h-full object-cover" fittingType="fill" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-gradient-pink">Strawberry</span>
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 pt-5 pb-44">
          <Outlet />
        </main>

        <NowPlayingBar />
        <BottomNav />
      </div>
    </UploadProvider>
  );
}