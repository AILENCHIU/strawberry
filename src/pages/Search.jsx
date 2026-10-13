import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Image } from "@/components/ui/image";
import { Search as SearchIcon, Loader2, Music2, ImageIcon, Mic, ListMusic, TrendingUp, Sparkles } from "lucide-react";
import TrackRow from "@/components/TrackRow";
import MediaCard from "@/components/MediaCard";

const categories = [
  { key: "song", label: "Songs", icon: Music2, from: "#f1558c", to: "#e33a6b" },
  { key: "photo", label: "Photos", icon: ImageIcon, from: "#f093b0", to: "#f1558c" },
  { key: "voice", label: "Voice notes", icon: Mic, from: "#d86aa0", to: "#b04a8a" },
  { key: "playlist", label: "Playlists", icon: ListMusic, from: "#e33a6b", to: "#c0285a" },
  { key: "trending", label: "Trending", icon: TrendingUp, from: "#f1558c", to: "#ff7ea0" },
  { key: "new", label: "New uploads", icon: Sparkles, from: "#ffb3c9", to: "#f1558c" },
];

export default function Search() {
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, plr] = await Promise.all([
        base44.entities.Post.filter({}, { sort: "-created_date", limit: 100 }),
        base44.entities.Playlist.filter({}, { sort: "-created_date", limit: 50 }),
      ]);
      setPosts(pr.items || []);
      setPlaylists(plr.items || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const songs = posts.filter((p) => p.type === "song" && p.audio_url);
  const photos = posts.filter((p) => p.type === "photo");
  const voice = posts.filter((p) => p.type === "voice" && p.audio_url);

  const ql = q.toLowerCase();
  const matchPost = (p) => !q || (p.title || "").toLowerCase().includes(ql) || (p.author_name || "").toLowerCase().includes(ql) || (p.caption || "").toLowerCase().includes(ql);
  const matchPl = (p) => !q || (p.title || "").toLowerCase().includes(ql) || (p.description || "").toLowerCase().includes(ql);

  let rSongs = songs.filter(matchPost);
  let rPhotos = photos.filter(matchPost);
  let rVoice = voice.filter(matchPost);
  let rPlaylists = playlists.filter(matchPl);

  if (cat === "song") { rPhotos = []; rVoice = []; rPlaylists = []; }
  if (cat === "photo") { rSongs = []; rVoice = []; rPlaylists = []; }
  if (cat === "voice") { rSongs = []; rPhotos = []; rPlaylists = []; }
  if (cat === "playlist") { rSongs = []; rPhotos = []; rVoice = []; }
  if (cat === "trending") {
    const t = [...posts].sort((a, b) => (b.plays || 0) - (a.plays || 0));
    rSongs = t.filter((p) => p.audio_url && p.type === "song");
    rPhotos = t.filter((p) => p.type === "photo");
    rVoice = []; rPlaylists = [];
  }
  if (cat === "new") { /* recent already */ }

  const empty = rSongs.length === 0 && rPhotos.length === 0 && rVoice.length === 0 && rPlaylists.length === 0;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gradient-pink">Search</h1>
      </header>

      <div className="relative">
        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setCat(null); }}
          placeholder="What do you want to play?"
          className="pl-10 rounded-full bg-white/70 border-pink-200 h-11"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>
      ) : !q && !cat ? (
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-3 px-1">Browse all</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className="relative h-28 rounded-2xl overflow-hidden p-3 text-left shadow-md"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              >
                <span className="text-white font-bold text-base drop-shadow">{c.label}</span>
                <c.icon className="w-12 h-12 text-white/80 absolute -bottom-2 -right-2 rotate-12" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {rPlaylists.length > 0 && (
            <section>
              <h2 className="font-display text-base font-bold text-foreground mb-2 px-1">Playlists</h2>
              <div className="space-y-1">
                {rPlaylists.map((pl) => (
                  <Link key={pl.id} to={`/playlist/${pl.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-pink-100/50">
                    <div className="w-12 h-12 rounded-lg overflow-hidden strawberry-gradient flex items-center justify-center shrink-0">
                      {pl.cover_image_url ? <Image src={pl.cover_image_url} alt={pl.title} className="w-full h-full object-cover" fittingType="fill" /> : <ListMusic className="w-6 h-6 text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{pl.title}</p>
                      <p className="text-xs text-pink-500/70 truncate">Playlist • {(pl.track_ids || []).length} songs</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {rSongs.length > 0 && (
            <section>
              <h2 className="font-display text-base font-bold text-foreground mb-2 px-1">Songs</h2>
              <div className="space-y-0.5">
                {rSongs.map((s) => <TrackRow key={s.id} post={s} queue={rSongs} />)}
              </div>
            </section>
          )}
          {rVoice.length > 0 && (
            <section>
              <h2 className="font-display text-base font-bold text-foreground mb-2 px-1">Voice notes</h2>
              <div className="space-y-0.5">
                {rVoice.map((s) => <TrackRow key={s.id} post={s} queue={rVoice} />)}
              </div>
            </section>
          )}
          {rPhotos.length > 0 && (
            <section>
              <h2 className="font-display text-base font-bold text-foreground mb-2 px-1">Photos</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {rPhotos.map((p) => <MediaCard key={p.id} post={p} />)}
              </div>
            </section>
          )}
          {empty && <p className="text-center text-pink-500/60 py-12">No results for "{q}"</p>}
        </div>
      )}
    </div>
  );
}