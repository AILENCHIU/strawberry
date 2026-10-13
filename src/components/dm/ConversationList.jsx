import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Edit, Loader2 } from "lucide-react";
import { formatTimestamp } from "@/lib/dmHelpers";

export default function ConversationList({ me, onOpen, onNew }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const page = await base44.entities.Conversation.filter(
          { participant_ids: me.id },
          { sort: "-last_message_at", limit: 50 }
        );
        setConversations(page.items || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [me.id]);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.Conversation.subscribe((event) => {
      if (event.type === "create" && event.data.participant_ids?.includes(me.id)) {
        setConversations(prev => [event.data, ...prev.filter(c => c.id !== event.data.id)]);
      } else if (event.type === "update" && event.data.participant_ids?.includes(me.id)) {
        setConversations(prev => {
          const updated = prev.map(c => c.id === event.data.id ? event.data : c);
          return updated.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
        });
      } else if (event.type === "delete") {
        setConversations(prev => prev.filter(c => c.id !== event.id));
      }
    });
    return unsub;
  }, [me.id]);

  const renderItem = (conv) => {
    const otherIdx = conv.participant_ids.indexOf(me.id) === 0 ? 1 : 0;
    const otherName = conv.participant_names?.[otherIdx] || "Strawberry friend";
    const otherAvatar = conv.participant_avatars?.[otherIdx];
    const isUnread = (conv.unread_for || []).includes(me.id);
    const isMine = conv.last_sender_id === me.id;
    const preview = conv.last_message_text ? `${isMine ? "You: " : ""}${conv.last_message_text}` : "No messages yet";

    return (
      <button key={conv.id} onClick={() => onOpen(conv)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-100/40 transition-colors text-left">
        <div className="shrink-0">
          {otherAvatar ? (
            <img src={otherAvatar} alt={otherName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full strawberry-gradient flex items-center justify-center text-white font-bold">
              {otherName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>{otherName}</span>
            <span className="text-[11px] text-muted-foreground shrink-0">{formatTimestamp(conv.last_message_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-sm truncate flex-1 ${isUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>{preview}</p>
            {isUnread && <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <button onClick={onNew} className="p-2.5 rounded-full glass-pink hover:bg-pink-100/60 transition-colors">
          <Edit className="w-5 h-5 text-pink-600" />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No conversations yet</p>
          <button onClick={onNew} className="px-5 py-2.5 rounded-full strawberry-gradient text-white font-semibold text-sm">Start a conversation</button>
        </div>
      ) : (
        <div className="space-y-1">{conversations.map(renderItem)}</div>
      )}
    </div>
  );
}