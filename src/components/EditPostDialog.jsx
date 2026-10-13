import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Flame } from "lucide-react";

export default function EditPostDialog({ post, open, onOpenChange, onUpdated, onDeleted }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [nsfw, setNsfw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open && post) {
      setTitle(post.title || "");
      setCaption(post.caption || "");
      setNsfw(!!post.nsfw);
      setConfirmDelete(false);
    }
  }, [open, post]);

  if (!post) return null;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updates = { caption: caption.trim() || undefined, nsfw };
      if (post.type === "song") updates.title = title.trim();
      const updated = await base44.entities.Post.update(post.id, updates);
      toast({ title: "Post updated" });
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Couldn't update", description: err?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await base44.entities.Post.delete(post.id);
      toast({ title: "Post deleted" });
      onDeleted?.(post.id);
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Couldn't delete", description: err?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-pink rounded-3xl max-w-lg p-0 max-h-[88vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-gradient-pink">Edit post</DialogTitle>
          </DialogHeader>

          {post.type === "song" && (
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-pink-700 font-medium">Song title</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl bg-white/70 border-pink-200" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-caption" className="text-pink-700 font-medium">Caption</Label>
            <Textarea id="edit-caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className="rounded-xl bg-white/70 border-pink-200 resize-none" />
          </div>

          <div className="flex items-center justify-between glass-pink rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-800">18+ / NSFW</span>
            </div>
            <Switch checked={nsfw} onCheckedChange={setNsfw} />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={save} disabled={busy} className="w-full strawberry-gradient text-white rounded-2xl h-11 font-semibold shadow-lg shadow-pink-300/40">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save changes"}
            </Button>

            {confirmDelete ? (
              <div className="w-full space-y-2">
                <p className="text-sm text-center text-pink-700 font-medium">Delete this post permanently?</p>
                <div className="flex gap-2">
                  <Button onClick={() => setConfirmDelete(false)} variant="outline" className="flex-1 rounded-2xl border-pink-300 text-pink-600">Cancel</Button>
                  <Button onClick={remove} disabled={busy} variant="destructive" className="flex-1 rounded-2xl">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setConfirmDelete(true)} variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl">
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete post
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}