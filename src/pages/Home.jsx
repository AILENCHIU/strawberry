import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { usePlayer } from "@/lib/playerContext";
import FeedItem from "@/components/FeedItem";
import UploadModal from "@/components/UploadModal";
import { Plus, Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { playTrack } = usePlayer();

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.Post.filter({}, { sort: "-created_date", limit: 50 });
      setPosts(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const songs = posts.filter((p) => p.type === "song" && p.audio_url);
  const handlePlay = (post) => playTrack(post, songs);

  return (
    <div className="space-y-6">
      {/* hero + upload */}
      <section className="glass rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-pink-300/40 blur-2xl" />
        <div className="relative">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-gradient-pink">Share your sound.</span>
          </h1>
          <p className="text-pink-600/70 mt-1 mb-5">Songs, snaps, and voice notes from your friends.</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="strawberry-gradient text-white rounded-full px-7 py-3.5 font-semibold text-lg shadow-lg shadow-pink-300/40 hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Upload
          </button>
        </div>
      </section>

      {/* feed */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="font-display text-xl font-bold text-foreground">Fresh feed</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>
        ) : posts.length === 0 ? (
          <div className="glass-pink rounded-3xl p-10 text-center text-pink-600/70">
            <div className="text-5xl mb-3">🍓</div>
            <p className="font-medium">Nothing here yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map((p) => (
              <FeedItem key={p.id} post={p} queue={songs} />
            ))}
          </div>
        )}
      </section>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} onDone={load} />
    </div>
  );
}