import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FeedItem from "@/components/FeedItem";
import { usePlayer } from "@/lib/playerContext";
import { Loader2, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  const load = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setMe(user);
      const { items } = await base44.entities.Post.filter({ created_by_id: user.id }, { sort: "-created_date", limit: 50 });
      setPosts(items);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const songs = posts.filter((p) => p.type === "song" && p.audio_url);
  const totalPlays = posts.reduce((s, p) => s + (p.plays || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 text-center">
        <div className="w-20 h-20 rounded-full strawberry-gradient mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-pink-300/40 mb-3">
          {(me?.full_name || me?.email || "🍓").charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-2xl font-bold">{me?.full_name || me?.email || "Strawberry friend"}</h1>
        <p className="text-pink-500/70 text-sm">{me?.email}</p>

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

        <Button
          onClick={() => base44.auth.logout()}
          variant="outline"
          className="mt-5 rounded-full border-pink-300 text-pink-600"
        >
          <LogOut className="w-4 h-4 mr-1.5" /> Sign out
        </Button>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold mb-4 px-1">Your posts</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-pink-400" /></div>
        ) : posts.length === 0 ? (
          <div className="glass-pink rounded-3xl p-10 text-center text-pink-600/70">
            <p className="font-medium">You haven't posted yet. Go share something! 🍓</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map((p) => <FeedItem key={p.id} post={p} queue={songs} />)}
          </div>
        )}
      </div>
    </div>
  );
}