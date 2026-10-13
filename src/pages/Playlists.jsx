import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { usePlayer } from "@/lib/playerContext";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Play, Shuffle, Loader2, ListMusic, X, Music2 } from "lucide-react";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const { playTrack, setShuffle } = usePlayer();

  const load = async () => {
    setLoading(true);
    try {
      const [pl, songRes] = await Promise.all([
        base44.entities.Playlist.filter({}, { sort: "-created_date", limit: 50 }),
        base44.entities.Post.filter({ type: "song" }, { sort: "-created_date", limit: 100 }),
      ]);
      setPlaylists(pl.items || pl);
      setSongs(songRes.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolveTracks = (pl) => {
    const ids = pl.track_ids || [];
    return ids.map((id) => songs.find((s) => s.id === id)).filter(Boolean);
  };

  const playPlaylist = (pl, withShuffle) => {
    const tracks = resolveTracks(pl);
    if (!tracks.length) return;
    setShuffle(withShuffle);
    playTrack(withShuffle ? tracks[Math.floor(Math.random() * tracks.length)] : tracks[0], tracks);
  };

  const createPlaylist = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await base44.entities.Playlist.create({ title: title.trim(), description: description.trim() });
      setTitle(""); setDescription("");
      setCreateOpen(false);
      load();
    } finally {
      setBusy(false);
    }
  };

  const addSong = async (pl, song) => {
    const ids = pl.track_ids || [];
    if (ids.includes(song.id)) return;
    await base44.entities.Playlist.update(pl.id, { track_ids: [...ids, song.id] });
    load();
  };

  const removeSong = async (pl, songId) => {
    const ids = (pl.track_ids || []).filter((id) => id !== songId);
    await base44.entities.Playlist.update(pl.id, { track_ids: ids });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>;

  if (active) {
    const tracks = resolveTracks(active);
    return (
      <div className="space-y-5">
        <button onClick={() => setActive(null)} className="text-pink-600 text-sm font-medium hover:underline">← Back to playlists</button>
        <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="w-32 h-32 rounded-2xl overflow-hidden strawberry-gradient flex items-center justify-center shrink-0">
            {active.cover_image_url ? (
              <Image src={active.cover_image_url} alt={active.title} className="w-full h-full object-cover" fittingType="fill" />
            ) : (
              <ListMusic className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-2xl font-bold">{active.title}</h1>
            <p className="text-pink-600/70 text-sm mt-1">{tracks.length} songs</p>
            {active.description && <p className="text-muted-foreground text-sm mt-2">{active.description}</p>}
            <div className="flex gap-2 mt-4 justify-center sm:justify-start">
              <Button onClick={() => playPlaylist(active, false)} className="strawberry-gradient text-white rounded-full px-5">
                <Play className="w-4 h-4 mr-1.5" /> Play
              </Button>
              <Button onClick={() => playPlaylist(active, true)} variant="outline" className="rounded-full border-pink-300 text-pink-600">
                <Shuffle className="w-4 h-4 mr-1.5" /> Shuffle
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {tracks.length === 0 ? (
            <p className="text-center text-pink-600/60 py-8">No songs yet. Add some below!</p>
          ) : (
            tracks.map((t, i) => (
              <div key={t.id} className="glass-pink rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-pink-400 font-medium w-6">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-100 shrink-0">
                  {t.cover_image_url && <Image src={t.cover_image_url} alt={t.title} className="w-full h-full object-cover" fittingType="fill" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.title}</p>
                  <p className="text-xs text-pink-500/70 truncate">{t.author_name}</p>
                </div>
                <button onClick={() => playTrack(t, tracks)} className="p-2 rounded-full text-pink-600 hover:bg-pink-100"><Play className="w-4 h-4" /></button>
                <button onClick={() => removeSong(active, t.id)} className="p-2 rounded-full text-pink-400 hover:bg-pink-100"><X className="w-4 h-4" /></button>
              </div>
            ))
          )}
        </div>

        <div className="glass rounded-3xl p-5">
          <h3 className="font-bold text-pink-800 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Add songs</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {songs.filter((s) => !(active.track_ids || []).includes(s.id)).map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-pink-100 shrink-0">
                  {s.cover_image_url && <Image src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover" fittingType="fill" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-pink-500/70 truncate">{s.author_name}</p>
                </div>
                <button onClick={() => addSong(active, s)} className="p-2 rounded-full strawberry-gradient text-white"><Plus className="w-4 h-4" /></button>
              </div>
            ))}
            {songs.filter((s) => !(active.track_ids || []).includes(s.id)).length === 0 && (
              <p className="text-sm text-pink-600/60 text-center py-3">All songs added 🍓</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gradient-pink">Your playlists</h1>
        <Button onClick={() => setCreateOpen(true)} className="strawberry-gradient text-white rounded-full">
          <Plus className="w-4 h-4 mr-1.5" /> New
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="glass-pink rounded-3xl p-10 text-center text-pink-600/70">
          <ListMusic className="w-10 h-10 mx-auto mb-3 text-pink-400" />
          <p className="font-medium">No playlists yet. Create one and shuffle through it in the car!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {playlists.map((pl) => {
            const tracks = resolveTracks(pl);
            return (
              <div key={pl.id} className="glass-pink rounded-3xl p-4 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setActive(pl)}>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 strawberry-gradient flex items-center justify-center">
                  {pl.cover_image_url ? (
                    <Image src={pl.cover_image_url} alt={pl.title} className="w-full h-full object-cover" fittingType="fill" />
                  ) : (
                    <Music2 className="w-10 h-10 text-white" />
                  )}
                </div>
                <h3 className="font-bold text-lg truncate">{pl.title}</h3>
                <p className="text-sm text-pink-500/70">{tracks.length} songs</p>
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <Button onClick={() => playPlaylist(pl, false)} size="sm" className="strawberry-gradient text-white rounded-full flex-1">
                    <Play className="w-3.5 h-3.5 mr-1" /> Play
                  </Button>
                  <Button onClick={() => playPlaylist(pl, true)} size="sm" variant="outline" className="rounded-full border-pink-300 text-pink-600 flex-1">
                    <Shuffle className="w-3.5 h-3.5 mr-1" /> Shuffle
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-gradient-pink">New playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-pink-700 font-medium">Name</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer drives" className="rounded-xl bg-white/70 border-pink-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-pink-700 font-medium">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-xl bg-white/70 border-pink-200 resize-none" />
            </div>
            <Button onClick={createPlaylist} disabled={busy} className="w-full strawberry-gradient text-white rounded-2xl">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create playlist"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}