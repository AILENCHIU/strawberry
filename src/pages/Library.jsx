import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlayer } from "@/lib/playerContext";
import { Plus, ListMusic, Loader2, Search as SearchIcon, Music2, Image as ImageIcon, Play, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Library() {
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");
  const coverInputRef = useRef(null);
  const { playTrack, current, isPlaying, togglePlay } = usePlayer();

  const load = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const [plRes, postRes] = await Promise.all([
        base44.entities.Playlist.filter({}, { sort: "-created_date", limit: 100 }),
        user ? base44.entities.Post.filter({ created_by_id: user.id }, { sort: "-created_date", limit: 100 }) : Promise.resolve({ items: [] }),
      ]);
      setPlaylists(plRes.items || []);
      setPosts(postRes.items || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const pickCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const createPlaylist = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      let cover_image_url = "";
      if (coverFile) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: coverFile });
        cover_image_url = res.file_url;
      }
      await base44.entities.Playlist.create({ title: title.trim(), description: description.trim(), cover_image_url: cover_image_url || undefined });
      setTitle(""); setDescription(""); setCoverFile(null); setCoverPreview(null); setCreateOpen(false); load();
    } catch (err) {
      toast({ title: "Couldn't create playlist", description: err?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const filtered = playlists.filter((p) => (p.title || "").toLowerCase().includes(filter.toLowerCase()));
  const myUploads = posts.filter((p) => (p.title || p.caption || "").toLowerCase().includes(filter.toLowerCase()));
  const songs = posts.filter((p) => p.audio_url);

  const playPost = (post) => {
    if (current?.id === post.id) togglePlay();
    else playTrack(post, songs);
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gradient-pink">Your Library</h1>
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
        <span className="text-sm font-semibold text-pink-700">Uploads</span>
      </div>

      {loading ? null : myUploads.length === 0 ? (
        <div className="glass-pink rounded-2xl p-6 text-center text-pink-600/70">
          <p className="text-sm font-medium">{filter ? "No uploads match." : "No uploads yet."}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {myUploads.map((p) => {
            const active = current?.id === p.id;
            const cover = p.cover_image_url || p.image_url;
            return (
              <button key={p.id} onClick={() => playPost(p)} className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-pink-100/50 transition-colors text-left">
                <div className="w-14 h-14 rounded-xl overflow-hidden strawberry-gradient flex items-center justify-center shrink-0 shadow-sm relative">
                  {cover ? <img src={cover} alt={p.title || "upload"} className="w-full h-full object-cover" /> : p.type === "photo" ? <ImageIcon className="w-6 h-6 text-white" /> : <Music2 className="w-6 h-6 text-white" />}
                  <span className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${active && isPlaying ? "opacity-100" : "opacity-0"}`}>
                    <Play className="w-5 h-5 text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm truncate ${active ? "text-pink-600" : "text-foreground"}`}>{p.title || p.caption || "Untitled"}</p>
                  <p className="text-xs text-pink-500/70 truncate capitalize">{p.type} • {p.author_name || "you"}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between px-1 pt-2">
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
            <div className="flex justify-center">
              <button onClick={() => coverInputRef.current?.click()} className="w-28 h-28 rounded-2xl overflow-hidden strawberry-gradient flex items-center justify-center shadow-lg shadow-pink-300/40 relative group">
                {coverPreview ? (
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-white/90">
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Cover art</span>
                  </div>
                )}
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={pickCover} className="hidden" />
            </div>
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