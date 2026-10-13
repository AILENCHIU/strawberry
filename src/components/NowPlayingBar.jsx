import React from "react";
import { Image } from "@/components/ui/image";
import { usePlayer } from "@/lib/playerContext";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Car, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function NowPlayingBar() {
  const { current, isPlaying, shuffle, progress, duration, togglePlay, next, prev, seek, setShuffle, carMode, setCarMode } = usePlayer();

  if (!current) return null;
  const pct = duration ? (progress / duration) * 100 : 0;

  if (carMode) {
    return (
      <div className="fixed inset-0 z-50 strawberry-gradient flex flex-col items-center justify-between p-8 text-white">
        <button onClick={() => setCarMode(false)} className="self-end glass rounded-full p-2.5 text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl shadow-pink-900/40 bg-white/20">
            {current.cover_image_url || current.image_url ? (
              <Image src={current.cover_image_url || current.image_url} alt={current.title} className="w-full h-full object-cover" fittingType="fill" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60 text-6xl">🍓</div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold">{current.title || "Voice note"}</h2>
            <p className="text-white/80 text-lg">{current.author_name || "strawberry friend"}</p>
          </div>
        </div>
        <div className="w-full max-w-md">
          <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-white/80 text-sm mb-6">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
          <div className="flex items-center justify-center gap-8">
            <button onClick={() => setShuffle(!shuffle)} className={cn("p-3 rounded-full transition-colors", shuffle ? "bg-white text-pink-600" : "text-white/80")}>
              <Shuffle className="w-7 h-7" />
            </button>
            <button onClick={prev} className="p-4 glass rounded-full text-white">
              <SkipBack className="w-9 h-9" />
            </button>
            <button onClick={togglePlay} className="w-24 h-24 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
              {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
            </button>
            <button onClick={next} className="p-4 glass rounded-full text-white">
              <SkipForward className="w-9 h-9" />
            </button>
            <div className="w-13 h-13" />
          </div>
        </div>
      </div>
    );
  }

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
          <button onClick={() => setCarMode(true)} className="p-2 rounded-full text-pink-600 hover:bg-pink-100 transition-colors" title="Car mode">
            <Car className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}