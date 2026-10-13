import React from "react";
import MediaCard from "@/components/MediaCard";

export default function CarouselRow({ title, items, queue, action }) {
  if (!items?.length) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
        {items.map((it) => (
          <MediaCard key={it.id} post={it} queue={queue} />
        ))}
      </div>
    </section>
  );
}