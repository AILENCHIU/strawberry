import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LikeButton({ post }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likes || 0);
  const [myLikeId, setMyLikeId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const me = await base44.auth.me().catch(() => null);
      if (!me) return;
      const [likeRes, countRes] = await Promise.all([
        base44.entities.Like.filter({ post_id: post.id, created_by_id: me.id }, { limit: 1 }),
        base44.entities.Like.count({ post_id: post.id }),
      ]);
      const myLike = likeRes.items?.[0];
      setLiked(!!myLike);
      setMyLikeId(myLike?.id || null);
      setCount(countRes);
    } catch {}
  };

  useEffect(() => { load(); }, [post.id]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked && myLikeId) {
        await base44.entities.Like.delete(myLikeId);
        setMyLikeId(null);
      } else {
        const created = await base44.entities.Like.create({ post_id: post.id });
        setMyLikeId(created.id);
        await base44.entities.Post.update(post.id, { likes: (post.likes || 0) + 1 });
      }
    } catch {
      setLiked(wasLiked);
      setCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={toggle} disabled={busy} className="flex items-center gap-1.5 group">
      <Heart className={cn("w-5 h-5 transition-all", liked ? "fill-pink-500 text-pink-500 scale-110" : "text-pink-400 group-hover:text-pink-600")} />
      <span className="text-xs font-medium text-pink-600/70">{count}</span>
    </button>
  );
}