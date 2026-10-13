export const makeConversationKey = (id1, id2) => [id1, id2].sort().join("_");

export const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 60 * 1000;
};

export const formatPresence = (lastActive) => {
  if (!lastActive) return "Offline";
  const diff = Date.now() - new Date(lastActive).getTime();
  if (diff < 60 * 1000) return "Active now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Active ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  return `Active ${Math.floor(hours / 24)}d ago`;
};

export const formatTimestamp = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};