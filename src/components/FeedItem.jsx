import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Play, Pause, Music2, Mic, ImageIcon, Flame, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { usePlayer } from "@/lib/playerContext";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import SongMoreMenu from "@/components/SongMoreMenu";
import EditPostDialog from "@/components/EditPostDialog";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export default function FeedItem({ post, queue, onChanged }) {
  const navigate = useNavigate();
  const { current, isPlaying, playTrack, togglePlay } = usePlayer();
  const isCurrent = current?.id === post.id;
  const isThisPlaying = isCurrent && isPlaying;
  const [isOwner, setIsOwner] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let active = true;
    base44.auth.me().then((me) => { if (active) setIsOwner(me?.id === post.created_by_id); }).catch(() => {});
    return () => { active = false; };
  }, [post.created_by_id]);

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playTrack(post, queue);
  };

  const hasAudio = post.type === "song" || post.type === "voice";

  return (
    <article className="glass-pink rounded-3xl overflow-hidden">
      {/* media */}
      {(post.image_url || post.cover_image_url) && (
        <div
          onClick={() => post.type === "photo" && navigate(`/post/${post.id}`)}
          className={`relative aspect-square sm:aspect-[4/3] ${post.type === "photo" ? "cursor-pointer" : ""}`}
        >
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
            </div>
            {post.title && <h3 className="font-bold text-lg leading-tight text-foreground truncate">{post.title}</h3>}
            {post.caption && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.caption}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-200/50">
          <button onClick={() => navigate(`/artist/${post.created_by_id}`)} className="text-xs text-pink-600/60 font-medium hover:text-pink-700 hover:underline">by {post.author_name || "strawberry friend"}</button>
          <div className="flex items-center gap-1">
            {hasAudio && !post.image_url && !post.cover_image_url && (
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-4 py-2 rounded-full strawberry-gradient text-white text-sm font-semibold shadow-md shadow-pink-300/40"
              >
                {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                {isThisPlaying ? "Pause" : "Play"}
              </button>
            )}
            {post.type === "song" && <SongMoreMenu post={post} onChanged={onChanged} />}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full text-pink-500 hover:bg-pink-100/60">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-pink rounded-2xl border-pink-200">
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="rounded-xl cursor-pointer">Edit post</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="rounded-xl cursor-pointer text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-pink-200/50">
          <LikeButton post={post} />
          <CommentSection post={post} />
        </div>
      </div>

      {isOwner && (
        <EditPostDialog post={post} open={editOpen} onOpenChange={setEditOpen} onUpdated={onChanged} onDeleted={onChanged} />
      )}
    </article>
  );
}