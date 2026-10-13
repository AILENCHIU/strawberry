import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { usePlayer } from "@/lib/playerContext";
import { useUpload } from "@/lib/uploadContext";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import CarouselRow from "@/components/CarouselRow";
import { Loader2, Play, Pause, ListMusic, Music2 } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const { playTrack, current, isPlaying, togglePlay } = usePlayer();
  const { refreshKey } = useUpload();

  const load = async () => {
    setLoading(true);
    try {
      const [postRes, plRes, user] = await Promise.all([
        base44.entities.Post.filter({}, { sort: "-created_date", limit: 50 }),
        base44.entities.Playlist.filter({}, { sort: "-created_date", limit: 20 }),
        base44.auth.me().catch(() => null),
      ]);
      setPosts(postRes.items || []);
      setPlaylists(plRes.items || []);
      setMe(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  const songs = posts.filter((p) => p.audio_url);
  const trending = [...posts].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 20);
  const recent = posts.slice(0, 6);
  const fresh = posts.slice(0, 20);

  const playPost = (post) => {
    if (current?.id === post.id) togglePlay();
    else playTrack(post, songs);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>;

  return (
    <div className="space-y-7">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gradient-pink">{greeting()}</h1>
        <Link to="/profile" className="w-9 h-9 rounded-full glass-pink flex items-center justify-center text-pink-600 font-bold text-sm overflow-hidden">
          {me?.profile_image_url ? (
            <img src={me.profile_image_url} alt={me?.full_name || "profile"} className="w-full h-full object-cover" />
          ) : (
            (me?.full_name || me?.email || "S").charAt(0).toUpperCase()
          )}
        </Link>
      </header>

      {recent.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {recent.map((p) => {
            const cover = p.cover_image_url || p.image_url;
            const isCurrent = current?.id === p.id;
            const hasAudio = !!p.audio_url;
            return (
              <button
                key={p.id}
                onClick={() => hasAudio && playPost(p)}
                className="glass rounded-xl overflow-hidden flex items-center gap-3 pr-2 text-left hover:bg-white/70 transition-colors"
              >
                <div className="w-12 h-12 shrink-0 bg-pink-100">
                  {cover ? <Image src={cover} alt={p.title || ""} className="w-full h-full object-cover" fittingType="fill" /> : <div className="w-full h-full strawberry-gradient" />}
                </div>
                <span className="text-xs font-semibold truncate flex-1 leading-tight">{p.title || p.caption || p.type}</span>
                {hasAudio && (
                  <span className="w-8 h-8 rounded-full strawberry-gradient text-white flex items-center justify-center shrink-0">
                    {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <CarouselRow title="Fresh uploads" items={fresh} queue={songs} />
      <CarouselRow title="Trending now" items={trending} queue={songs} />

      {playlists.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3 px-1">Your playlists</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {playlists.map((pl) => (
              <Link key={pl.id} to={`/playlist/${pl.id}`} className="w-40 shrink-0 group">
                <div className="aspect-square rounded-2xl overflow-hidden mb-2 strawberry-gradient flex items-center justify-center shadow-md shadow-pink-200/40">
                  {pl.cover_image_url ? <Image src={pl.cover_image_url} alt={pl.title} className="w-full h-full object-cover" fittingType="fill" /> : <ListMusic className="w-10 h-10 text-white" />}
                </div>
                <p className="font-semibold text-sm truncate">{pl.title}</p>
                <p className="text-xs text-pink-500/70">{(pl.track_ids || []).length} songs</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="glass-pink rounded-3xl p-10 text-center text-pink-600/70">
          <div className="flex justify-center mb-3"><Music2 className="w-10 h-10 text-pink-400" /></div>
          <p className="font-medium">Nothing here yet. Tap upload to share your first sound or snap!</p>
        </div>
      )}
    </div>
  );
}