import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, ListMusic, User, Disc3 } from "lucide-react";
import NowPlayingBar from "@/components/NowPlayingBar";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen relative">
      {/* ambient pink blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-pink-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-rose-300/30 blur-3xl" />
      </div>

      {/* top glass nav */}
      <header className="sticky top-0 z-40 px-4 pt-4">
        <nav className="max-w-3xl mx-auto glass rounded-3xl px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl strawberry-gradient flex items-center justify-center shadow-lg shadow-pink-300/40">
              <Disc3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-gradient-pink">Strawberry</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-medium transition-all",
                    active
                      ? "strawberry-gradient text-white shadow-md shadow-pink-300/40"
                      : "text-pink-700/70 hover:bg-pink-100/60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-40">
        <Outlet />
      </main>

      <NowPlayingBar />
    </div>
  );
}