import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ListMusic, Loader2, Search as SearchIcon, Music2 } from "lucide-react";

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.Playlist.filter({}, { sort: "-created_date", limit: 100 });
      setPlaylists(items || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const createPlaylist = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await base44.entities.Playlist.create({ title: title.trim(), description: description.trim() });
      setTitle(""); setDescription(""); setCreateOpen(false); load();
    } finally {
      setBusy(false);
    }
  };

  const filtered = playlists.filter((p) => (p.title || "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gradient-pink">Your Library</h1>
        <Link to="/profile" className="w-9 h-9 rounded-full glass-pink flex items-center justify-center text-pink-600 font-bold text-sm">S</Link>
      </header>

      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search in your library"
          className="pl-9 rounded-full bg-white/70 border-pink-200 h-10"
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-pink-700">Playlists</span>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="rounded-full strawberry-gradient text-white">
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-pink rounded-3xl p-10 text-center text-pink-600/70">
          <ListMusic className="w-10 h-10 mx-auto mb-3 text-pink-400" />
          <p className="font-medium">{filter ? "No playlists match." : "No playlists yet. Create one!"}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((pl) => (
            <Link key={pl.id} to={`/playlist/${pl.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-pink-100/50 transition-colors">
              <div className="w-14 h-14 rounded-xl overflow-hidden strawberry-gradient flex items-center justify-center shrink-0 shadow-sm">
                {pl.cover_image_url ? <Image src={pl.cover_image_url} alt={pl.title} className="w-full h-full object-cover" fittingType="fill" /> : <Music2 className="w-6 h-6 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground">{pl.title}</p>
                <p className="text-xs text-pink-500/70 truncate">Playlist • {(pl.track_ids || []).length} songs</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-gradient-pink">Create playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-pink-700 font-medium">Name</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Playlist name" className="rounded-xl bg-white/70 border-pink-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-pink-700 font-medium">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-xl bg-white/70 border-pink-200 resize-none" />
            </div>
            <Button onClick={createPlaylist} disabled={busy} className="w-full strawberry-gradient text-white rounded-2xl">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}