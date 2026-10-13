import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search as SearchIcon, Library, Plus } from "lucide-react";
import { useUpload } from "@/lib/uploadContext";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const location = useLocation();
  const { openUpload } = useUpload();

  const tabs = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/search", label: "Search", icon: SearchIcon },
    { to: "/library", label: "Library", icon: Library },
  ];

  const renderTab = ({ to, label, icon: Icon }) => {
    const active = location.pathname === to;
    return (
      <Link key={to} to={to} className="flex flex-col items-center justify-center gap-1 py-2.5 flex-1 min-w-0">
        <Icon className={cn("w-6 h-6 transition-colors", active ? "text-pink-600" : "text-pink-400/70")} strokeWidth={active ? 2.5 : 2} />
        <span className={cn("text-[10px] font-medium transition-colors", active ? "text-pink-600" : "text-pink-400/70")}>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
      <div className="max-w-3xl mx-auto glass rounded-3xl px-2 flex items-stretch justify-around">
        {renderTab(tabs[0])}
        {renderTab(tabs[1])}
        <button onClick={openUpload} className="flex flex-col items-center justify-center gap-1 py-2.5 flex-1 min-w-0" aria-label="Upload">
          <span className="w-10 h-10 rounded-2xl strawberry-gradient text-white flex items-center justify-center shadow-lg shadow-pink-300/50">
            <Plus className="w-5 h-5" />
          </span>
          <span className="text-[10px] font-medium text-pink-500/70">Upload</span>
        </button>
        {renderTab(tabs[2])}
      </div>
    </nav>
  );
}