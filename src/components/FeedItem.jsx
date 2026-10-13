import React from "react";
import { Image } from "@/components/ui/image";
import { Play, Pause, Heart, Music2, Mic, ImageIcon, Flame } from "lucide-react";
import { usePlayer } from "@/lib/playerContext";
import { cn } from "@/lib/utils";

export default function FeedItem({ post, queue }) {
  const { current, isPlaying, playTrack, togglePlay } = usePlayer();
  const isCurrent = current?.id === post.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playTrack(post, queue);
  };

  const hasAudio = post.type === "song" || post.type === "voice";

  return (
    <article className="glass-pink rounded-3xl overflow-hidden">
      {/* media */}
      {(post.image_url || post.cover_image_url) && (
        <div className="relative aspect-square sm:aspect-[4/3]">
          <Image
            src={post.image_url || post.cover_image_url}
            alt={post.title || post.caption || "post"}
            className="w-full h-full object-cover"
            fittingType="fill"
          />
          {post.nsfw && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-600/80 backdrop-blur text-white text-xs font-semibold">
              <Flame className="w-3 h-3" /> 18+
            </span>
          )}
          {hasAudio && (
            <button
              onClick={handlePlay}
              className="absolute bottom-3 left-3 w-14 h-14 rounded-full strawberry-gradient text-white flex items-center justify-center shadow-xl shadow-pink-400/40 hover:scale-105 active:scale-95 transition-transform"
            >
              {isThisPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                post.type === "song" && "bg-pink-100 text-pink-700",
                post.type === "photo" && "bg-rose-100 text-rose-700",
                post.type === "voice" && "bg-fuchsia-100 text-fuchsia-700"
              )}>
                {post.type === "song" && <Music2 className="w-3 h-3" />}
                {post.type === "photo" && <ImageIcon className="w-3 h-3" />}
                {post.type === "voice" && <Mic className="w-3 h-3" />}
                {post.type}
              </span>
              {post.genre && post.type === "song" && (
                <span className="text-xs text-pink-500/70 font-medium">{post.genre}</span>
              )}
            </div>
            {post.title && <h3 className="font-bold text-lg leading-tight text-foreground truncate">{post.title}</h3>}
            {post.caption && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.caption}</p>}
          </div>
          <button className="shrink-0 flex flex-col items-center gap-0.5 text-pink-400 hover:text-pink-600 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-[11px] font-medium">{post.likes || 0}</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-200/50">
          <span className="text-xs text-pink-600/60 font-medium">by {post.author_name || "strawberry friend"}</span>
          {hasAudio && !post.image_url && !post.cover_image_url && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-full strawberry-gradient text-white text-sm font-semibold shadow-md shadow-pink-300/40"
            >
              {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              {isThisPlaying ? "Pause" : "Play"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}