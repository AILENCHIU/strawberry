import React from "react";
import { Image } from "@/components/ui/image";
import { Play, Pause, Music2, Mic, X } from "lucide-react";
import { usePlayer } from "@/lib/playerContext";
import { cn } from "@/lib/utils";
import SongMoreMenu from "@/components/SongMoreMenu";

function fmt(s) {
  if (!s || isNaN(s)) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function TrackRow({ post, queue, onRemove }) {
  const { current, isPlaying, playTrack, togglePlay } = usePlayer();
  const isCurrent = current?.id === post.id;
  const isThisPlaying = isCurrent && isPlaying;
  const cover = post.cover_image_url || post.image_url;
  const hasAudio = !!post.audio_url;

  const handlePlay = () => {
    if (!hasAudio) return;
    if (isCurrent) togglePlay();
    else playTrack(post, queue);
  };

  return (
    <div className={cn("group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-pink-100/50 transition-colors", isCurrent && "bg-pink-100/60")}>
      <button onClick={handlePlay} className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-pink-100">
        {cover ? (
          <Image src={cover} alt={post.title || ""} className="w-full h-full object-cover" fittingType="fill" />
        ) : (
          <span className="w-full h-full flex items-center justify-center strawberry-gradient text-white">
            {post.type === "voice" ? <Mic className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
          </span>
        )}
        {hasAudio && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </span>
        )}
      </button>
      <button onClick={handlePlay} className="min-w-0 flex-1 text-left">
        <p className={cn("font-medium text-sm truncate", isCurrent ? "text-pink-600" : "text-foreground")}>{post.title || "Untitled"}</p>
        <p className="text-xs text-pink-500/70 truncate">{post.author_name || "strawberry friend"}</p>
      </button>
      <div className="flex items-center gap-1 shrink-0">
        {post.duration ? <span className="text-xs text-pink-400/70 mr-1">{fmt(post.duration)}</span> : null}
        {onRemove && (
          <button onClick={() => onRemove(post.id)} className="p-2 rounded-full text-pink-400 hover:bg-pink-100" aria-label="Remove">
            <X className="w-4 h-4" />
          </button>
        )}
        <SongMoreMenu post={post} />
      </div>
    </div>
  );
}