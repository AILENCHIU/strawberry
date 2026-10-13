import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search as SearchIcon, Library, Plus } from "lucide-react";
import { useUpload } from "@/lib/uploadContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const LOGO = "https://media.base44.com/images/public/6acea8c53ba315332ee93348/dec0a2986_logo.jpg";

export default function TopNav() {
  const location = useLocation();
  const { openUpload } = useUpload();
  const [me, setMe] = useState(null);

  useEffect(() => { base44.auth.me().catch(() => null).then(setMe); }, []);

  const tabs = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/search", label: "Search", icon: SearchIcon },
    { to: "/library", label: "Library", icon: Library },
  ];

  const renderTab = ({ to, label, icon: Icon }) => {
    const active = location.pathname === to;
    return (
      <Link key={to} to={to} className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-0">
        <Icon className={cn("w-5 h-5 transition-colors", active ? "text-pink-600" : "text-pink-400/70")} strokeWidth={active ? 2.5 : 2} />
        <span className={cn("text-[10px] font-medium transition-colors", active ? "text-pink-600" : "text-pink-400/70")}>{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 pt-3 pb-2 bg-background/60 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <img src={LOGO} alt="Strawberry" className="h-9 w-9 rounded-full object-cover shrink-0" />

        <nav className="flex-1 glass rounded-full px-1 flex items-center justify-around">
          {renderTab(tabs[0])}
          {renderTab(tabs[1])}
          <button onClick={openUpload} className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-0" aria-label="Upload">
            <span className="w-8 h-8 rounded-2xl strawberry-gradient text-white flex items-center justify-center shadow-md shadow-pink-300/50">
              <Plus className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-medium text-pink-500/70">Upload</span>
          </button>
          {renderTab(tabs[2])}
        </nav>

        <Link to="/profile" className="w-9 h-9 rounded-full glass-pink flex items-center justify-center text-pink-600 font-bold text-sm overflow-hidden shrink-0">
          {me?.profile_image_url ? (
            <img src={me.profile_image_url} alt={me?.full_name || "profile"} className="w-full h-full object-cover" />
          ) : (
            (me?.full_name || me?.email || "S").charAt(0).toUpperCase()
          )}
        </Link>
      </div>
    </header>
  );
}