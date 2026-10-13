import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import FeedItem from "@/components/FeedItem";
import { usePlayer } from "@/lib/playerContext";
import { Loader2, ChevronLeft, Heart } from "lucide-react";

export default function Artist() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  const load = async () => {
    setLoading(true);
    try {
      const [postRes, me] = await Promise.all([
        base44.entities.Post.filter({ created_by_id: userId }, { sort: "-created_date", limit: 50 }),
        base44.auth.me().catch(() => null),
      ]);
      const items = postRes.items || [];
      setPosts(items);
      const name = items[0]?.author_name || (me?.id === userId ? me?.full_name : "Strawberry artist");
      setUser({ id: userId, name });
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const songs = posts.filter((p) => p.type === "song" && p.audio_url);
  const totalPlays = posts.reduce((s, p) => s + (p.plays || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-pink-600 text-sm font-medium hover:underline">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="glass rounded-3xl p-6 text-center">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-pink-300/40 mb-3 strawberry-gradient text-white text-3xl font-bold">
          {(user?.name || "S").charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-2xl font-bold">{user?.name || "Strawberry artist"}</h1>

        <div className="flex justify-center gap-8 mt-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient-pink">{posts.length}</p>
            <p className="text-xs text-pink-600/70 font-medium">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient-pink">{totalPlays}</p>
            <p className="text-xs text-pink-600/70 font-medium">Plays</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient-pink flex items-center gap-1 justify-center">{totalLikes}<Heart className="w-4 h-4 text-pink-400" /></p>
            <p className="text-xs text-pink-600/70 font-medium">Likes</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold mb-4 px-1">Posts</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-pink-400" /></div>
        ) : posts.length === 0 ? (
          <div className="glass-pink rounded-3xl p-10 text-center text-pink-600/70">
            <p className="font-medium">No posts yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map((p) => <FeedItem key={p.id} post={p} queue={songs} onChanged={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}