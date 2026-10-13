import React, { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Music2, ImageIcon, Mic, Upload, Loader2, Flame, Sparkles, X } from "lucide-react";
import { readId3Tags } from "@/lib/id3";

export default function UploadModal({ open, onOpenChange, onDone }) {
  const { toast } = useToast();
  const [type, setType] = useState("song");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [nsfw, setNsfw] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [aiCoverUrl, setAiCoverUrl] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const hasCover = !!(imageFile || aiCoverUrl);

  const reset = () => {
    setType("song"); setTitle(""); setCaption(""); setNsfw(false);
    setAudioFile(null); setImageFile(null); setAiCoverUrl(null);
    setAudioPreview(null); setImagePreview(null);
  };

  const pickAudio = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAudioFile(f);
    setAudioPreview(URL.createObjectURL(f));
    const baseName = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    if (type === "song") {
      const tags = await readId3Tags(f);
      if (tags.title) setTitle(tags.title);
      else if (baseName) setTitle(baseName);
      if (tags.pictureFile && !hasCover) {
        setImageFile(tags.pictureFile);
        setAiCoverUrl(null);
        setImagePreview(tags.pictureUrl);
      }
    }
  };

  const pickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setAiCoverUrl(null);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    setImageFile(null);
    setAiCoverUrl(null);
    setImagePreview(null);
  };

  const generateCover = async () => {
    if (generating) return;
    if (type === "song" && !title.trim()) {
      toast({ title: "Add a song title first", description: "We generate the art from your title and caption.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const prompt = `Glossy 3D album cover art for a song called "${title.trim()}".` +
        (caption.trim() ? ` Mood and theme: ${caption.trim()}.` : "") +
        " Strawberry pink and red color palette, dreamy, high-gloss, reflective, wet texture, sparkles, square album cover, no text, no words.";
      const res = await base44.integrations.Core.GenerateImage({ prompt });
      setAiCoverUrl(res.url);
      setImageFile(null);
      setImagePreview(res.url);
    } catch (err) {
      toast({ title: "Couldn't generate art", description: err?.message || "Try again or upload your own.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const submit = async () => {
    if (busy) return;
    if (type === "song" && !audioFile) { toast({ title: "Pick an audio file first", variant: "destructive" }); return; }
    if (type === "photo" && !imageFile) { toast({ title: "Pick an image first", variant: "destructive" }); return; }
    if (type === "voice" && !audioFile) { toast({ title: "Record or pick an audio file", variant: "destructive" }); return; }
    if (type === "song" && !title.trim()) { toast({ title: "Give your song a title", variant: "destructive" }); return; }
    if (type === "song" && !hasCover) { toast({ title: "Add cover art", description: "Upload one or let AI generate it.", variant: "destructive" }); return; }

    setBusy(true);
    try {
      let me;
      try { me = await base44.auth.me(); } catch { me = null; }
      const author_name = me?.full_name || me?.email?.split("@")[0] || "you";

      let audio_url = "";
      if (audioFile) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: audioFile });
        audio_url = res.file_url;
      }
      let image_url = "";
      let cover_image_url = "";
      if (type === "photo" && imageFile) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: imageFile });
        image_url = res.file_url;
      } else if (type === "song") {
        if (imageFile) {
          const res = await base44.integrations.Core.UploadPublicFile({ file: imageFile });
          cover_image_url = res.file_url;
        } else if (aiCoverUrl) {
          cover_image_url = aiCoverUrl;
        }
      }

      await base44.entities.Post.create({
        type,
        title: type === "song" ? title.trim() : undefined,
        caption: caption.trim() || undefined,
        audio_url: audio_url || undefined,
        image_url: image_url || undefined,
        cover_image_url: cover_image_url || undefined,
        nsfw,
        author_name,
      });

      toast({ title: "Posted to your feed! 🍓" });
      reset();
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-pink rounded-3xl max-w-lg p-0 max-h-[88vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-6 space-y-5">
          <Tabs value={type} onValueChange={setType}>
            <TabsList className="grid grid-cols-3 w-full bg-pink-100/50 rounded-2xl">
              <TabsTrigger value="song" className="rounded-2xl data-[state=active]:strawberry-gradient data-[state=active]:text-white">
                <Music2 className="w-4 h-4 mr-1.5" /> Song
              </TabsTrigger>
              <TabsTrigger value="photo" className="rounded-2xl data-[state=active]:strawberry-gradient data-[state=active]:text-white">
                <ImageIcon className="w-4 h-4 mr-1.5" /> Photo
              </TabsTrigger>
              <TabsTrigger value="voice" className="rounded-2xl data-[state=active]:strawberry-gradient data-[state=active]:text-white">
                <Mic className="w-4 h-4 mr-1.5" /> Voice
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {(type === "song" || type === "voice") && (
            <div>
              <Label className="text-pink-700 font-medium mb-2 block">Audio file</Label>
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={pickAudio} className="hidden" />
              <button
                onClick={() => audioInputRef.current?.click()}
                className="w-full glass-pink rounded-2xl py-6 flex flex-col items-center gap-2 text-pink-600 hover:bg-pink-100/70 transition-colors"
              >
                {audioPreview ? (
                  <>
                    <Music2 className="w-7 h-7 text-pink-500" />
                    <span className="text-sm font-medium truncate max-w-[80%]">{audioFile?.name}</span>
                    <span className="text-xs text-pink-400">Tap to change</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-pink-500" />
                    <span className="text-sm font-medium">Tap to choose audio</span>
                  </>
                )}
              </button>
              {audioPreview && <audio src={audioPreview} controls className="w-full mt-3 h-10" />}
            </div>
          )}

          {type === "photo" && (
            <div>
              <Label className="text-pink-700 font-medium mb-2 block">Image</Label>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full glass-pink rounded-2xl py-6 flex flex-col items-center gap-2 text-pink-600 hover:bg-pink-100/70 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <>
                    <ImageIcon className="w-7 h-7 text-pink-500" />
                    <span className="text-sm font-medium">Tap to choose image</span>
                  </>
                )}
              </button>
            </div>
          )}

          {type === "song" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-pink-700 font-medium">Cover art <span className="text-pink-400 font-normal">(required)</span></Label>
                {hasCover && (
                  <button onClick={clearImage} className="text-xs text-pink-500 hover:text-pink-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="cover" className="w-full aspect-square object-cover" />
                  <button onClick={clearImage} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="glass-pink rounded-2xl py-5 flex flex-col items-center gap-1.5 text-pink-600 hover:bg-pink-100/70 transition-colors"
                  >
                    <ImageIcon className="w-6 h-6 text-pink-500" />
                    <span className="text-xs font-medium">Upload</span>
                  </button>
                  <button
                    onClick={generateCover}
                    disabled={generating}
                    className="strawberry-gradient text-white rounded-2xl py-5 flex flex-col items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    <span className="text-xs font-medium">{generating ? "Making..." : "AI generate"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {type === "song" && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-pink-700 font-medium">Song title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My new track" className="rounded-xl bg-white/70 border-pink-200" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="caption" className="text-pink-700 font-medium">Caption</Label>
            <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Say something sweet..." rows={2} className="rounded-xl bg-white/70 border-pink-200 resize-none" />
          </div>

          <div className="flex items-center justify-between glass-pink rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-800">18+ / NSFW</span>
            </div>
            <Switch checked={nsfw} onCheckedChange={setNsfw} />
          </div>

          <Button
            onClick={submit}
            disabled={busy}
            className="w-full strawberry-gradient text-white rounded-2xl h-12 font-semibold text-base shadow-lg shadow-pink-300/40 hover:opacity-90"
          >
            {busy ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</> : "Post to feed 🍓"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}