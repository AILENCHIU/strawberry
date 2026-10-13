import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, ListMusic, User, Plus } from "lucide-react";
import { useUpload } from "@/lib/uploadContext";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const location = useLocation();
  const { openUpload } = useUpload();

  const items = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/playlists", label: "Playlists", icon: ListMusic },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const renderTab = ({ to, label, icon: Icon }) => {
    const active = location.pathname === to;
    return (
      <Link
        key={to}
        to={to}
        className="flex flex-col items-center justify-center gap-1 py-1.5 flex-1 min-w-0"
      >
        <Icon className={cn("w-6 h-6 transition-colors", active ? "text-pink-600" : "text-pink-400/70")} />
        <span className={cn("text-[10px] font-medium transition-colors", active ? "text-pink-600" : "text-pink-400/70")}>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
      <div className="max-w-3xl mx-auto glass rounded-3xl px-2 py-1.5 flex items-stretch justify-around">
        {renderTab(items[0])}
        {renderTab(items[1])}
        <button
          onClick={openUpload}
          className="flex flex-col items-center justify-center gap-1 py-1.5 flex-1 min-w-0"
          aria-label="Upload"
        >
          <span className="w-11 h-11 rounded-2xl strawberry-gradient text-white flex items-center justify-center shadow-lg shadow-pink-300/50 -mt-3 ring-2 ring-white/60">
            <Plus className="w-6 h-6" />
          </span>
          <span className="text-[10px] font-medium text-pink-500/70">Upload</span>
        </button>
        {renderTab(items[2])}
      </div>
    </nav>
  );
}