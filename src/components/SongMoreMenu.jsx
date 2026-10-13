import React, { useState } from "react";
import { MoreHorizontal, ListPlus, ListMusic } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";
import { usePlayer } from "@/lib/playerContext";
import { useToast } from "@/components/ui/use-toast";

export default function SongMoreMenu({ post }) {
  const { addToQueue } = usePlayer();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState([]);

  const loadPlaylists = async (open) => {
    if (!open) return;
    try {
      const { items } = await base44.entities.Playlist.filter({}, { sort: "-created_date", limit: 50 });
      setPlaylists(items || []);
    } catch {}
  };

  const addToPlaylist = async (pl) => {
    const ids = pl.track_ids || [];
    if (ids.includes(post.id)) {
      toast({ title: "Already in this playlist" });
      return;
    }
    try {
      await base44.entities.Playlist.update(pl.id, { track_ids: [...ids, post.id] });
      toast({ title: `Added to "${pl.title}" 🍓` });
    } catch (err) {
      toast({ title: "Couldn't add", description: err?.message, variant: "destructive" });
    }
  };

  return (
    <DropdownMenu onOpenChange={loadPlaylists}>
      <DropdownMenuTrigger asChild>
        <button
          className="shrink-0 p-2 rounded-full text-pink-500 hover:bg-pink-100 hover:text-pink-700 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-pink-200">
        <DropdownMenuItem
          onClick={() => {
            addToQueue(post);
            toast({ title: "Added to queue" });
          }}
          className="rounded-xl gap-2"
        >
          <ListPlus className="w-4 h-4" /> Add to queue
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl gap-2">
            <ListMusic className="w-4 h-4" /> Add to playlist
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-2xl border-pink-200">
            {playlists.length === 0 && (
              <DropdownMenuItem disabled className="text-pink-400">No playlists yet</DropdownMenuItem>
            )}
            {playlists.map((pl) => (
              <DropdownMenuItem
                key={pl.id}
                onClick={() => addToPlaylist(pl)}
                className="rounded-xl"
              >
                {pl.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}