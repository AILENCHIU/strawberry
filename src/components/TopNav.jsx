import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search as SearchIcon, Library, Plus, Send } from "lucide-react";
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

  const renderTab = ({ to, icon: Icon, size = "w-5 h-5" }) => {
    const active = location.pathname === to;
    return (
      <Link key={to} to={to} className="flex items-center justify-center px-2.5 py-1.5 min-w-0">
        <Icon className={cn(`${size} transition-colors`, active ? "text-pink-600" : "text-pink-400/70")} strokeWidth={active ? 2.5 : 2} />
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 pt-3 pb-2 bg-gradient-to-b from-pink-100/80 via-pink-50/40 to-transparent backdrop-blur-md">
      <nav className="glass-pink rounded-full px-2 py-1 flex items-center justify-between gap-1">
        <img src={LOGO} alt="Strawberry" className="h-9 w-9 rounded-full object-cover shrink-0 mx-1" />

        <div className="flex items-center justify-center flex-1">
          {renderTab(tabs[0])}
          {renderTab(tabs[1])}
          <button onClick={openUpload} className="flex items-center justify-center px-2.5 py-1.5 min-w-0" aria-label="Upload">
            <span className="w-8 h-8 rounded-full strawberry-gradient text-white flex items-center justify-center shadow-md shadow-pink-300/50">
              <Plus className="w-4 h-4" />
            </span>
          </button>
          {renderTab({ to: "/messages", icon: Send, size: "w-[18px] h-[18px]" })}
          {renderTab(tabs[2])}
        </div>

        <Link to="/profile" className="w-9 h-9 rounded-full bg-white/70 border border-pink-300/40 flex items-center justify-center text-pink-700 font-bold text-sm overflow-hidden shrink-0 mx-1 shadow-sm">
          {me?.profile_image_url ? (
            <img src={me.profile_image_url} alt={me?.full_name || "profile"} className="w-full h-full object-cover" />
          ) : (
            (me?.full_name || me?.email || "S").charAt(0).toUpperCase()
          )}
        </Link>
      </nav>
    </header>
  );
}