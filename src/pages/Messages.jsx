import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import ConversationList from "@/components/dm/ConversationList";
import ChatView from "@/components/dm/ChatView";
import NewMessageDialog from "@/components/dm/NewMessageDialog";

export default function Messages() {
  const [me, setMe] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  if (!me) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
    </div>
  );

  if (activeConversation) {
    return <ChatView conversation={activeConversation} me={me} onBack={() => setActiveConversation(null)} />;
  }

  return (
    <>
      <ConversationList me={me} onOpen={setActiveConversation} onNew={() => setShowNew(true)} />
      <NewMessageDialog open={showNew} onOpenChange={setShowNew} me={me} onStart={setActiveConversation} />
    </>
  );
}