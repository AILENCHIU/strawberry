import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MessageBubble from "@/components/dm/MessageBubble";
import { isOnline, formatPresence } from "@/lib/dmHelpers";

export default function ChatView({ conversation, me, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  const otherUserId = conversation.participant_ids.find(id => id !== me.id);
  const otherIdx = conversation.participant_ids.indexOf(otherUserId);

  // Load messages
  useEffect(() => {
    const load = async () => {
      try {
        const page = await base44.entities.Message.filter(
          { conversation_id: conversation.id },
          { sort: "created_date", limit: 200 }
        );
        setMessages(page.items || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [conversation.id]);

  // Mark seen on load
  useEffect(() => {
    const markSeen = async () => {
      try {
        await base44.entities.Message.updateMany(
          { conversation_id: conversation.id, sender_id: { $ne: me.id }, seen: false },
          { $set: { seen: true } }
        );
        await base44.entities.Conversation.update(conversation.id, { unread_for: [] });
      } catch (e) {}
    };
    markSeen();
  }, [conversation.id, me.id]);

  // Subscribe to messages (real-time)
  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.type === "create" && event.data.conversation_id === conversation.id) {
        setMessages(prev => prev.some(m => m.id === event.data.id) ? prev : [...prev, event.data]);
        if (event.data.sender_id !== me.id) {
          base44.entities.Message.update(event.data.id, { seen: true }).catch(() => {});
          base44.entities.Conversation.update(conversation.id, { unread_for: [] }).catch(() => {});
        }
      } else if (event.type === "update" && event.data.conversation_id === conversation.id) {
        setMessages(prev => prev.map(m => m.id === event.data.id ? event.data : m));
      } else if (event.type === "delete") {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });
    return unsub;
  }, [conversation.id, me.id]);

  // Fetch other user (presence polling)
  useEffect(() => {
    const fetchOther = async () => {
      try {
        const u = await base44.entities.User.get(otherUserId);
        setOtherUser(u);
      } catch (e) {}
    };
    fetchOther();
    const interval = setInterval(fetchOther, 15000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        conversation_key: conversation.key,
        sender_id: me.id,
        sender_name: me.full_name || me.email || "User",
        text,
        seen: false
      });
      await base44.entities.Conversation.update(conversation.id, {
        last_message_text: text,
        last_message_at: new Date().toISOString(),
        last_sender_id: me.id,
        unread_for: [otherUserId]
      });
    } catch (e) {
      toast({ title: "Failed to send message", variant: "destructive" });
      setInput(text);
    }
  };

  const handleUnsend = async (messageId) => {
    try {
      await base44.entities.Message.delete(messageId);
    } catch (e) {
      toast({ title: "Failed to unsend", variant: "destructive" });
    }
  };

  const otherName = otherUser?.full_name || conversation.participant_names?.[otherIdx] || "Strawberry friend";
  const otherAvatar = otherUser?.profile_image_url || conversation.participant_avatars?.[otherIdx];
  const online = isOnline(otherUser?.last_active);
  const presenceText = formatPresence(otherUser?.last_active);

  const lastSentIdx = messages.reduce((acc, m, i) => m.sender_id === me.id ? i : acc, -1);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 glass-pink rounded-2xl mb-3 shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-pink-100/60 transition-colors">
          <ChevronLeft className="w-5 h-5 text-pink-600" />
        </button>
        <div className="relative shrink-0">
          {otherAvatar ? (
            <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full strawberry-gradient flex items-center justify-center text-white font-bold">
              {otherName.charAt(0).toUpperCase()}
            </div>
          )}
          {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-foreground truncate">{otherName}</h3>
          <p className="text-xs text-muted-foreground">{presenceText}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-1">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 text-sm">Say hello!</div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.sender_id === me.id}
              isLastSent={i === lastSentIdx}
              onUnsend={handleUnsend}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 glass-pink rounded-2xl mt-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message..."
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
        <button onClick={handleSend} disabled={!input.trim()} className="p-2 rounded-full strawberry-gradient text-white disabled:opacity-40 transition-opacity">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}