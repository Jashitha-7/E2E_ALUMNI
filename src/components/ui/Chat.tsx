"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Video, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Avatar } from "./Badge";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ChatMessage {
  id: string;
  text: string;
  timestamp?: string;
  senderName?: string;
  senderAvatar?: string;
  isOwn?: boolean;
  status?: "sent" | "delivered" | "read";
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHAT WINDOW
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ChatWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  avatar?: string;
  online?: boolean;
  messages?: ChatMessage[];
  typing?: boolean;
  floating?: boolean;
  onSend?: (message: string) => void;
  placeholder?: string;
}

const ChatWindow = React.forwardRef<HTMLDivElement, ChatWindowProps>(
  (
    {
      title = "Alumni Support",
      subtitle = "Online now",
      avatar,
      online = true,
      messages = [],
      typing = false,
      floating = true,
      onSend,
      placeholder = "Type a message...",
      className,
      ...props
    },
    ref
  ) => {
    const [input, setInput] = React.useState("");
    const lastMessageRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, typing]);

    const handleSend = () => {
      const trimmed = input.trim();
      if (!trimmed) return;
      onSend?.(trimmed);
      setInput("");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-md",
          "rounded-3xl border border-white/20 dark:border-white/10",
          "bg-white/75 dark:bg-neutral-900/75 backdrop-blur-2xl",
          "shadow-glass-lg",
          floating && "fixed bottom-6 right-6 z-50",
          className
        )}
        {...props}
      >
        <ChatHeader
          title={title}
          subtitle={subtitle}
          avatar={avatar}
          online={online}
        />

        <ChatMessageList className="px-4 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {typing && <TypingIndicator />}
          <div ref={lastMessageRef} />
        </ChatMessageList>

        <ChatComposer
          value={input}
          placeholder={placeholder}
          onChange={setInput}
          onSend={handleSend}
        />
      </div>
    );
  }
);

ChatWindow.displayName = "ChatWindow";

/* ═══════════════════════════════════════════════════════════════════════════
   CHAT HEADER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  avatar?: string;
  online?: boolean;
}

const ChatHeader = ({ title, subtitle, avatar, online, className }: ChatHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "px-4 py-3",
        "border-b border-white/10 dark:border-white/5",
        "bg-white/40 dark:bg-neutral-900/40",
        "backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar src={avatar} name={title} size="md" />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2",
              online
                ? "bg-success-500 border-white dark:border-neutral-900"
                : "bg-neutral-400 border-white dark:border-neutral-900"
            )}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Start voice call">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Start video call">
          <Video className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More options">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE LIST
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ChatMessageListProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3",
          "h-[320px] overflow-y-auto",
          "pt-4",
          "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble = ({ message }: ChatMessageBubbleProps) => {
  const isOwn = message.isOwn;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5",
          "text-sm leading-relaxed",
          isOwn
            ? "bg-gradient-to-br from-brand-500/90 to-accent-500/80 text-white shadow-glow-brand"
            : "bg-white/70 dark:bg-neutral-900/70 text-neutral-800 dark:text-neutral-100 border border-white/10 dark:border-white/5",
          isOwn ? "rounded-br-md" : "rounded-bl-md"
        )}
      >
        {!isOwn && message.senderName && (
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            {message.senderName}
          </p>
        )}
        <p>{message.text}</p>
        {message.timestamp && (
          <div className="mt-1 flex justify-end">
            <span className="text-[10px] text-white/70 dark:text-white/60">
              {message.timestamp}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TYPING INDICATOR
   ═══════════════════════════════════════════════════════════════════════════ */
const TypingIndicator = () => {
  const dotTransition = {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-center gap-2"
    >
      <div className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-white/10 dark:border-white/5 px-4 py-2">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-2 w-2 rounded-full bg-brand-500/80"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                ...dotTransition,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSER
   ═══════════════════════════════════════════════════════════════════════════ */
export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
}

const ChatComposer = ({ value, onChange, onSend, placeholder }: ChatComposerProps) => {
  return (
    <div className="border-t border-white/10 dark:border-white/5 px-4 py-3">
      <div className="flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-white/10 dark:border-white/5 px-3 py-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
        />
        <Button
          size="icon-sm"
          variant="primary"
          onClick={onSend}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export {
  ChatHeader,
  ChatMessageList,
  ChatMessageBubble,
  TypingIndicator,
  ChatComposer,
  ChatWindow,
};
