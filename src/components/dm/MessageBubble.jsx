import React from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatMessageTime } from "@/lib/dmHelpers";

export default function MessageBubble({ message, isMine, isLastSent, onUnsend }) {
  if (!isMine) {
    return (
      <div className="flex justify-start mb-1.5">
        <div className="max-w-[78%]">
          <div className="px-3.5 py-2 rounded-2xl rounded-bl-md glass-pink text-foreground">
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          </div>
          <span className="text-[10px] text-muted-foreground/70 px-1.5">{formatMessageTime(message.created_date)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="max-w-[78%] text-left">
            <div className="px-3.5 py-2 rounded-2xl rounded-br-md strawberry-gradient text-white shadow-sm">
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            </div>
            <div className="flex items-center gap-1.5 px-1.5 justify-end">
              <span className="text-[10px] text-muted-foreground/70">{formatMessageTime(message.created_date)}</span>
              {isLastSent && message.seen && <span className="text-[10px] text-pink-500 font-medium">Seen</span>}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-pink rounded-2xl">
          <DropdownMenuItem onClick={() => onUnsend(message.id)} className="rounded-xl cursor-pointer text-destructive focus:text-destructive">
            Unsend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}