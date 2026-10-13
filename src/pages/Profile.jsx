import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FeedItem from "@/components/FeedItem";
import ProfilePictureDialog from "@/components/ProfilePictureDialog";
import { usePlayer } from "@/lib/playerContext";
import { Loader2, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picOpen, setPicOpen] = useState(false);
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
        <button
          onClick={() => setPicOpen(true)}
          className="relative w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-pink-300/40 mb-3 overflow-hidden group"
        >
          {me?.profile_image_url ? (
            <img src={me.profile_image_url} alt={me?.full_name || "profile"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full strawberry-gradient flex items-center justify-center text-white text-3xl font-bold">
              {(me?.full_name || me?.email || "S").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </span>
        </button>
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
            <p className="text-2xl font-bold text-gradient-pink">{totalLikes}</p>
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
            <p className="font-medium">You haven't posted yet. Go share something!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map((p) => <FeedItem key={p.id} post={p} queue={songs} onChanged={load} />)}
          </div>
        )}
      </div>

      <ProfilePictureDialog
        open={picOpen}
        onOpenChange={setPicOpen}
        currentUrl={me?.profile_image_url}
        onSaved={(url) => setMe((m) => ({ ...m, profile_image_url: url || "" }))}
      />
    </div>
  );
}