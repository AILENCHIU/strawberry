import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Play, Shuffle, Loader2, ListMusic, ChevronLeft, Plus } from "lucide-react";
import { usePlayer } from "@/lib/playerContext";
import TrackRow from "@/components/TrackRow";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, setShuffle } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pl, songRes] = await Promise.all([
        base44.entities.Playlist.get(id),
        base44.entities.Post.filter({ type: "song" }, { sort: "-created_date", limit: 200 }),
      ]);
      setPlaylist(pl);
      setSongs(songRes.items || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>;
  if (!playlist) return <p className="text-center text-pink-500/60 py-20">Playlist not found</p>;

  const ids = playlist.track_ids || [];
  const tracks = ids.map((tid) => songs.find((s) => s.id === tid)).filter(Boolean);

  const playAll = (withShuffle) => {
    if (!tracks.length) return;
    setShuffle(withShuffle);
    playTrack(withShuffle ? tracks[Math.floor(Math.random() * tracks.length)] : tracks[0], tracks);
  };

  const removeSong = async (songId) => {
    const newIds = ids.filter((x) => x !== songId);
    await base44.entities.Playlist.update(id, { track_ids: newIds });
    setPlaylist({ ...playlist, track_ids: newIds });
  };

  const addSong = async (song) => {
    if (ids.includes(song.id)) return;
    const newIds = [...ids, song.id];
    await base44.entities.Playlist.update(id, { track_ids: newIds });
    setPlaylist({ ...playlist, track_ids: newIds });
  };

  const available = songs.filter((s) => !ids.includes(s.id));

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-pink-600 text-sm font-medium hover:underline">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-40 h-40 rounded-2xl overflow-hidden strawberry-gradient flex items-center justify-center shadow-xl shadow-pink-300/40">
          {playlist.cover_image_url ? <Image src={playlist.cover_image_url} alt={playlist.title} className="w-full h-full object-cover" fittingType="fill" /> : <ListMusic className="w-16 h-16 text-white" />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pink-500/70">Playlist</p>
          <h1 className="font-display text-2xl font-bold text-foreground">{playlist.title}</h1>
          <p className="text-sm text-pink-600/70 mt-1">{tracks.length} songs</p>
          {playlist.description && <p className="text-sm text-muted-foreground mt-2 max-w-md">{playlist.description}</p>}
        </div>
        <div className="flex gap-3">
          <Button onClick={() => playAll(false)} className="strawberry-gradient text-white rounded-full px-6"><Play className="w-4 h-4 mr-1.5" /> Play</Button>
          <Button onClick={() => playAll(true)} variant="outline" className="rounded-full border-pink-300 text-pink-600"><Shuffle className="w-4 h-4 mr-1.5" /> Shuffle</Button>
        </div>
      </div>

      <div className="space-y-0.5">
        {tracks.length === 0 ? (
          <div className="glass-pink rounded-3xl p-8 text-center text-pink-600/70">
            <p className="font-medium mb-3">No songs yet.</p>
            <Button onClick={() => setShowAdd(true)} className="strawberry-gradient text-white rounded-full"><Plus className="w-4 h-4 mr-1.5" /> Add songs</Button>
          </div>
        ) : (
          tracks.map((t) => <TrackRow key={t.id} post={t} queue={tracks} onRemove={removeSong} />)
        )}
      </div>

      {tracks.length > 0 && (
        <Button onClick={() => setShowAdd(!showAdd)} variant="ghost" className="text-pink-600 rounded-full">
          <Plus className="w-4 h-4 mr-1.5" /> {showAdd ? "Hide add songs" : "Add more songs"}
        </Button>
      )}

      {showAdd && (
        <div className="glass rounded-3xl p-4">
          <h3 className="font-bold text-pink-800 mb-3">Add songs</h3>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {available.length === 0 ? (
              <p className="text-sm text-pink-600/60 text-center py-3">All songs added</p>
            ) : available.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-pink-100/50">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-100 shrink-0">
                  {s.cover_image_url && <Image src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover" fittingType="fill" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-pink-500/70 truncate">{s.author_name}</p>
                </div>
                <button onClick={() => addSong(s)} className="p-2 rounded-full strawberry-gradient text-white"><Plus className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}