import React from "react";
import { Image } from "@/components/ui/image";
import { Play, Pause, Music2, Mic, ImageIcon, Flame } from "lucide-react";
import { usePlayer } from "@/lib/playerContext";
import { cn } from "@/lib/utils";

export default function MediaCard({ post, queue, className }) {
  const { current, isPlaying, playTrack, togglePlay } = usePlayer();
  const isCurrent = current?.id === post.id;
  const isThisPlaying = isCurrent && isPlaying;
  const hasAudio = (post.type === "song" || post.type === "voice") && !!post.audio_url;
  const cover = post.cover_image_url || post.image_url;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playTrack(post, queue);
  };

  return (
    <div className={cn("group relative w-40 shrink-0", className)}>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-100 shadow-md shadow-pink-200/40">
        {cover ? (
          <Image src={cover} alt={post.title || post.caption || ""} className="w-full h-full object-cover" fittingType="fill" />
        ) : (
          <div className="w-full h-full flex items-center justify-center strawberry-gradient text-white">
            {post.type === "song" ? <Music2 className="w-10 h-10" /> : post.type === "voice" ? <Mic className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
          </div>
        )}
        {hasAudio && (
          <button
            onClick={handlePlay}
            className="absolute bottom-2 right-2 w-11 h-11 rounded-full strawberry-gradient text-white flex items-center justify-center shadow-lg shadow-pink-400/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0 transition-all"
          >
            {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        )}
        {post.nsfw && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-pink-600/80 text-white text-[10px] font-semibold">18+</span>
        )}
      </div>
      <p className="font-semibold text-sm mt-2 truncate text-foreground">{post.title || post.caption || (post.type === "photo" ? "Photo" : "Untitled")}</p>
      <p className="text-xs text-pink-500/70 truncate">{post.author_name || "strawberry friend"}</p>
    </div>
  );
}