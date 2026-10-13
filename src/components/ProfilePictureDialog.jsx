import React, { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Loader2, Upload, Trash2 } from "lucide-react";

export default function ProfilePictureDialog({ open, onOpenChange, currentUrl, onSaved }) {
  const { toast } = useToast();
  const [preview, setPreview] = useState(currentUrl || null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  React.useEffect(() => {
    if (open) {
      setPreview(currentUrl || null);
      setFile(null);
    }
  }, [open, currentUrl]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let profile_image_url = currentUrl;
      if (file) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        profile_image_url = res.file_url;
      }
      await base44.auth.updateMe({ profile_image_url });
      toast({ title: "Profile picture updated" });
      onSaved?.(profile_image_url);
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Couldn't update picture", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await base44.auth.updateMe({ profile_image_url: "" });
      toast({ title: "Profile picture removed" });
      onSaved?.(null);
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Couldn't remove picture", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm p-0">
        <div className="px-6 pt-6 pb-6 space-y-5 text-center">
          <h2 className="font-display text-xl font-bold text-gradient-pink">Profile picture</h2>

          <div className="w-28 h-28 rounded-full mx-auto overflow-hidden strawberry-gradient flex items-center justify-center shadow-lg shadow-pink-300/40">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-10 h-10 text-white/80" />
            )}
          </div>

          <input ref={inputRef} type="file" accept="image/*" onChange={pick} className="hidden" />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border-pink-300 text-pink-600"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Choose image
          </Button>

          <div className="flex gap-2">
            {currentUrl && (
              <Button
                onClick={remove}
                disabled={busy}
                variant="outline"
                className="flex-1 rounded-2xl border-pink-200 text-pink-500"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Remove
              </Button>
            )}
            <Button
              onClick={save}
              disabled={busy || !file}
              className="flex-1 strawberry-gradient text-white rounded-2xl h-11 font-semibold disabled:opacity-50"
            >
              {busy ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...</> : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}