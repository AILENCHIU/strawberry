import React from "react";
import { Image } from "@/components/ui/image";
import { usePlayer } from "@/lib/playerContext";
import { Play, Pause, SkipBack, SkipForward, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function NowPlayingBar() {
  const { current, isPlaying, shuffle, progress, duration, togglePlay, next, prev, seek, setShuffle } = usePlayer();

  if (!current) return null;
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-40 px-4">
      <div className="max-w-3xl mx-auto glass rounded-3xl px-3 py-2.5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-100 shrink-0">
          {current.cover_image_url || current.image_url ? (
            <Image src={current.cover_image_url || current.image_url} alt={current.title} className="w-full h-full object-cover" fittingType="fill" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🍓</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate text-foreground">{current.title || "Voice note"}</p>
          <p className="text-xs text-pink-500/70 truncate">{current.author_name || "strawberry friend"}</p>
          <div className="mt-1 h-1 bg-pink-200/60 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * duration);
          }}>
            <div className="h-full strawberry-gradient rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setShuffle(!shuffle)} className={cn("p-2 rounded-full transition-colors", shuffle ? "strawberry-gradient text-white" : "text-pink-500 hover:bg-pink-100")} title="Shuffle">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={prev} className="p-2 rounded-full text-pink-600 hover:bg-pink-100 transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={togglePlay} className="w-11 h-11 rounded-full strawberry-gradient text-white flex items-center justify-center shadow-md shadow-pink-300/40 active:scale-95 transition-transform">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={next} className="p-2 rounded-full text-pink-600 hover:bg-pink-100 transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}