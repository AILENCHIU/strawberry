import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Heart, Loader2, Flame } from "lucide-react";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    base44.entities.Post.get(id)
      .then((p) => { if (active) setPost(p); })
      .catch(() => { if (active) setPost(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>;
  if (!post) return <p className="text-center text-pink-500/60 py-20">Post not found</p>;

  const img = post.image_url || post.cover_image_url;

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-pink-600 text-sm font-medium hover:underline mb-3">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex-1 flex items-center justify-center">
        {img ? (
          <Image src={img} alt={post.title || post.caption || "post"} className="max-w-full max-h-[70vh] rounded-2xl object-contain" fittingType="fit" />
        ) : (
          <p className="text-pink-500/60">No image</p>
        )}
      </div>

      <div className="mt-4 glass-pink rounded-3xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {post.title && <h1 className="font-display text-lg font-bold text-foreground">{post.title}</h1>}
            <p className="text-xs text-pink-600/70 font-medium">by {post.author_name || "strawberry friend"}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-pink-400">
            <Heart className="w-5 h-5" />
            <span className="text-[11px] font-medium">{post.likes || 0}</span>
          </div>
        </div>
        {post.caption && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.caption}</p>}
        {post.nsfw && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-600/80 text-white text-xs font-semibold w-fit">
            <Flame className="w-3 h-3" /> 18+
          </span>
        )}
      </div>
    </div>
  );
}