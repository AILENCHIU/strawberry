import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";
import { makeConversationKey } from "@/lib/dmHelpers";
import { useToast } from "@/components/ui/use-toast";

export default function NewMessageDialog({ open, onOpenChange, me, onStart }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const all = await base44.entities.User.list();
        setUsers((all || []).filter(u => u.id !== me.id));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [open, me.id]);

  const filtered = users.filter(u => {
    const name = (u.full_name || u.email || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleSelect = async (user) => {
    setStarting(user.id);
    try {
      const key = makeConversationKey(me.id, user.id);
      const existing = await base44.entities.Conversation.filter({ key });
      if (existing.length > 0) {
        onStart(existing[0]);
      } else {
        const conv = await base44.entities.Conversation.create({
          participant_ids: [me.id, user.id],
          participant_names: [me.full_name || me.email || "User", user.full_name || user.email || "User"],
          participant_avatars: [me.profile_image_url || "", user.profile_image_url || ""],
          key,
          last_message_text: "",
          last_message_at: new Date().toISOString(),
          last_sender_id: "",
          unread_for: []
        });
        onStart(conv);
      }
      onOpenChange(false);
      setSearch("");
    } catch (e) {
      toast({ title: "Failed to start conversation", variant: "destructive" });
    }
    setStarting(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-pink rounded-3xl">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white/60 border border-pink-200/50 outline-none text-sm"
          />
        </div>
        <div className="max-h-72 overflow-y-auto space-y-1">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-pink-400" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No people found</p>
          ) : (
            filtered.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                disabled={starting === user.id}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-pink-100/40 transition-colors text-left disabled:opacity-50"
              >
                {user.profile_image_url ? (
                  <img src={user.profile_image_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full strawberry-gradient flex items-center justify-center text-white font-bold">
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-foreground text-sm">{user.full_name || user.email}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}