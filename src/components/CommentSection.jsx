import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CommentSection({ post }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.Comment.filter({ post_id: post.id }, { sort: "created_date", limit: 100 });
      setComments(items || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) load(); }, [open, post.id]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      const author_name = me?.full_name || me?.email?.split("@")[0] || "strawberry friend";
      await base44.entities.Comment.create({ post_id: post.id, text: text.trim(), author_name });
      setText("");
      load();
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 group">
        <MessageCircle className="w-5 h-5 text-pink-400 group-hover:text-pink-600" />
        <span className="text-xs font-medium text-pink-600/70">{comments.length || ""}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-pink-400" /></div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-pink-500/50 text-center py-1">No comments yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full strawberry-gradient text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {(c.author_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">
                      <span className="font-semibold text-pink-700">{c.author_name || "strawberry friend"}</span>{" "}
                      <span className="text-foreground/80">{c.text}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Add a comment..."
              className="rounded-full bg-white/70 border-pink-200 h-9 text-sm"
            />
            <button onClick={submit} disabled={sending || !text.trim()} className="shrink-0 w-9 h-9 rounded-full strawberry-gradient text-white flex items-center justify-center disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}