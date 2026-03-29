import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { MoreVertical, Paperclip, Phone, Search, Send, Smile } from "lucide-react";

interface ApiUser {
  _id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface ApiMessage {
  _id: string;
  chat: string | { _id: string };
  sender: string | ApiUser;
  content: string;
  createdAt: string;
}

interface ApiChat {
  _id: string;
  participants: ApiUser[];
  lastMessage?: ApiMessage;
  unreadCount?: number;
}

interface UiMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isOwn: boolean;
  senderId: string;
}

const metaEnv = (import.meta as { env?: { VITE_API_URL?: string; VITE_SOCKET_URL?: string } }).env;
const apiBase = metaEnv?.VITE_API_URL ?? "/api/v1";
const socketBaseUrl = metaEnv?.VITE_SOCKET_URL ?? (apiBase.startsWith("http") ? new URL(apiBase).origin : "http://localhost:5000");

const getStoredAccessToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getAvatarFallback = (name: string) => {
  const firstLetter = name.trim().charAt(0).toUpperCase();
  return firstLetter || "👤";
};

const asUser = (sender: string | ApiUser) =>
  typeof sender === "string" ? { _id: sender, name: "User" } : sender;

const extractChatId = (chat: string | { _id: string }) =>
  typeof chat === "string" ? chat : chat?._id;

const readJsonSafe = async <T,>(response: Response): Promise<T | null> => {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

interface RealtimeChatPanelProps {
  initialChatId?: string;
}

const RealtimeChatPanel = ({ initialChatId }: RealtimeChatPanelProps) => {
  const [currentUser, setCurrentUser] = React.useState<ApiUser | null>(null);
  const [chats, setChats] = React.useState<ApiChat[]>([]);
  const [messagesByChat, setMessagesByChat] = React.useState<Record<string, UiMessage[]>>({});
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newMessage, setNewMessage] = React.useState("");
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [typingByChat, setTypingByChat] = React.useState<Record<string, boolean>>({});
  const [onlineByUserId, setOnlineByUserId] = React.useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const emojiPickerRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);

  const emojis = {
    Smileys: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "🙂", "😉"],
    Gestures: ["👍", "👌", "✌️", "🤝", "👏", "🙌", "💪", "🙏", "👋", "👊"],
    Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "💕", "💖", "💘"],
    Objects: ["🎉", "🎊", "🏆", "📚", "💻", "💡", "🔥", "⭐", "🚀", "✅"],
  };

  const mapMessage = React.useCallback(
    (message: ApiMessage): UiMessage => {
      const sender = asUser(message.sender);
      const isOwn = sender._id === currentUser?._id;
      return {
        id: message._id,
        sender: sender.name,
        avatar: getAvatarFallback(sender.name),
        content: message.content,
        time: formatTime(message.createdAt),
        isOwn,
        senderId: sender._id,
      };
    },
    [currentUser?._id]
  );

  const getOtherParticipant = React.useCallback(
    (chat: ApiChat) => {
      if (!currentUser?._id) return chat.participants[0] ?? null;
      return chat.participants.find((participant) => participant._id !== currentUser._id) ?? chat.participants[0] ?? null;
    },
    [currentUser?._id]
  );

  const selectedChat = React.useMemo(
    () => chats.find((chat) => chat._id === selectedChatId) ?? null,
    [chats, selectedChatId]
  );

  const selectedParticipant = React.useMemo(
    () => (selectedChat ? getOtherParticipant(selectedChat) : null),
    [getOtherParticipant, selectedChat]
  );

  const currentMessages = React.useMemo(
    () => (selectedChatId ? messagesByChat[selectedChatId] ?? [] : []),
    [messagesByChat, selectedChatId]
  );

  const filteredChats = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chats;

    return chats.filter((chat) => {
      const participant = getOtherParticipant(chat);
      return participant?.name.toLowerCase().includes(query);
    });
  }, [chats, getOtherParticipant, searchQuery]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, selectedChatId]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setErrorMessage("Please login again to use chat.");
      return;
    }

    const loadInitialData = async () => {
      try {
        setErrorMessage(null);

        const meResponse = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mePayload = await readJsonSafe<ApiUser>(meResponse);
        if (meResponse.ok && mePayload?._id) {
          setCurrentUser(mePayload);
        }

        const chatsResponse = await fetch(`${apiBase}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chatsPayload = await readJsonSafe<{ success: boolean; data: ApiChat[]; message?: string }>(chatsResponse);
        if (!chatsResponse.ok || !chatsPayload?.data) {
          throw new Error(chatsPayload?.message || "Unable to load chats");
        }

        setChats(chatsPayload.data);

        if (chatsPayload.data.length > 0) {
          const preferredChat =
            initialChatId && chatsPayload.data.some((chat) => chat._id === initialChatId)
              ? initialChatId
              : chatsPayload.data[0]._id;

          setSelectedChatId((prev) => prev ?? preferredChat);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load chats");
      }
    };

    void loadInitialData();
  }, [initialChatId]);

  const refreshChats = React.useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) return;

    const chatsResponse = await fetch(`${apiBase}/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const chatsPayload = await readJsonSafe<{ success: boolean; data: ApiChat[] }>(chatsResponse);

    if (!chatsResponse.ok || !chatsPayload?.data) return;
    setChats(chatsPayload.data);
  }, []);

  React.useEffect(() => {
    if (!initialChatId) return;
    if (!chats.some((chat) => chat._id === initialChatId)) return;

    setSelectedChatId(initialChatId);
    socketRef.current?.emit("join", { chatId: initialChatId });
    socketRef.current?.emit("mark_read", { chatId: initialChatId });
  }, [chats, initialChatId]);

  React.useEffect(() => {
    const token = getStoredAccessToken();
    if (!token || !selectedChatId) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`${apiBase}/chats/${selectedChatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = await readJsonSafe<{ success: boolean; data: ApiMessage[]; message?: string }>(response);
        if (!response.ok || !payload?.data) {
          throw new Error(payload?.message || "Unable to load messages");
        }

        setMessagesByChat((prev) => ({
          ...prev,
          [selectedChatId]: payload.data.map(mapMessage),
        }));

        setChats((prev) =>
          prev.map((chat) => (chat._id === selectedChatId ? { ...chat, unreadCount: 0 } : chat))
        );

        socketRef.current?.emit("mark_read", { chatId: selectedChatId });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load messages");
      }
    };

    void loadMessages();
  }, [mapMessage, selectedChatId]);

  React.useEffect(() => {
    const token = getStoredAccessToken();
    if (!token || !currentUser?._id) return;

    const socket = io(socketBaseUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const handleIncomingMessage = (incoming: ApiMessage) => {
      const chatId = extractChatId(incoming.chat);
      if (!chatId) return;

      setMessagesByChat((prev) => {
        const existing = prev[chatId] ?? [];
        if (existing.some((message) => message.id === incoming._id)) return prev;

        return {
          ...prev,
          [chatId]: [...existing, mapMessage(incoming)],
        };
      });

      setChats((prev) =>
        prev.map((chat) => {
          if (chat._id !== chatId) return chat;
          return {
            ...chat,
            lastMessage: incoming,
            unreadCount:
              selectedChatId === chatId
                ? 0
                : (chat.unreadCount ?? 0) + (asUser(incoming.sender)._id === currentUser._id ? 0 : 1),
          };
        })
      );
    };

    socket.on("connect", () => {
      chats.forEach((chat) => {
        socket.emit("join", { chatId: chat._id });
      });
    });

    socket.on("message", handleIncomingMessage);

    socket.on("new_message", (payload: { chatId: string; message: ApiMessage }) => {
      if (!payload?.message) return;
      handleIncomingMessage(payload.message);
    });

    socket.on("presence", (payload: { userId: string; status: "online" | "offline" }) => {
      if (!payload?.userId) return;
      setOnlineByUserId((prev) => ({
        ...prev,
        [payload.userId]: payload.status === "online",
      }));
    });

    socket.on("typing", (payload: { chatId: string; userId: string; isTyping: boolean }) => {
      if (!payload?.chatId || payload.userId === currentUser._id) return;
      setTypingByChat((prev) => ({
        ...prev,
        [payload.chatId]: payload.isTyping,
      }));
    });

    socket.on("disconnect", () => {
      setTypingByChat({});
    });

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chats, currentUser?._id, mapMessage, refreshChats, selectedChatId]);

  React.useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    chats.forEach((chat) => {
      socket.emit("join", { chatId: chat._id });
    });
  }, [chats]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setChats((prev) => prev.map((chat) => (chat._id === chatId ? { ...chat, unreadCount: 0 } : chat)));
    socketRef.current?.emit("join", { chatId });
    socketRef.current?.emit("mark_read", { chatId });
  };

  const handleSendMessage = () => {
    const chatId = selectedChatId;
    const text = newMessage.trim();
    if (!chatId || !text) return;

    const socket = socketRef.current;
    if (!socket) {
      setErrorMessage("Socket is disconnected. Refresh and try again.");
      return;
    }

    socket.emit("message", { chatId, content: text, messageType: "text" }, (ack: { ok: boolean; message?: string }) => {
      if (!ack?.ok) {
        setErrorMessage(ack?.message || "Unable to send message");
      }
    });

    setNewMessage("");
    socket.emit("typing", { chatId, isTyping: false });
  };

  const onInputChange = (value: string) => {
    setNewMessage(value);
    if (!selectedChatId) return;
    socketRef.current?.emit("typing", { chatId: selectedChatId, isTyping: value.trim().length > 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-[calc(100vh-180px)]"
    >
      <div className="h-full flex overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full !pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => {
              const participant = getOtherParticipant(chat);
              const participantName = participant?.name || "Unknown user";
              const lastMessage = chat.lastMessage?.content || "No messages yet";
              const unreadCount = chat.unreadCount ?? 0;
              const isOnline = participant?._id ? onlineByUserId[participant._id] : false;

              return (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat._id)}
                  className={`w-full p-4 flex items-center gap-3 transition-all cursor-pointer hover:bg-white/5 ${
                    selectedChatId === chat._id ? "bg-white/10 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="relative">
                    <div className="text-3xl">{getAvatarFallback(participantName)}</div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${unreadCount > 0 ? "text-white" : "text-white/90"}`}>{participantName}</p>
                      <span className="text-xs text-white/40">{formatTime(chat.lastMessage?.createdAt)}</span>
                    </div>
                    <p className={`text-sm truncate ${unreadCount > 0 ? "text-white/80 font-medium" : "text-white/60"}`}>{lastMessage}</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="p-4 text-center text-white/40 text-sm">No conversations found</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="text-3xl">{getAvatarFallback(selectedParticipant?.name || "User")}</div>
                {selectedParticipant?._id && onlineByUserId[selectedParticipant._id] && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedParticipant?.name || "Select a conversation"}</p>
                <p className={`text-xs ${selectedParticipant?._id && onlineByUserId[selectedParticipant._id] ? "text-emerald-400" : "text-white/40"}`}>
                  {selectedParticipant?._id && onlineByUserId[selectedParticipant._id] ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChatId ?? "empty"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {currentMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-end gap-2 ${message.isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div className="text-2xl shrink-0">{message.avatar}</div>
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        message.isOwn
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 rounded-br-sm"
                          : "bg-white/10 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? "text-white/70" : "text-white/40"}`}>{message.time}</p>
                    </div>
                  </motion.div>
                ))}

                {selectedChatId && typingByChat[selectedChatId] && (
                  <div className="text-xs text-white/50 px-2">Typing...</div>
                )}
              </motion.div>
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 relative">
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
              />

              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60 hover:text-white"}`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-12 right-0 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white/80">Pick an emoji</p>
                      </div>
                      <div className="p-3 max-h-64 overflow-y-auto">
                        {Object.entries(emojis).map(([category, emojiList]) => (
                          <div key={category} className="mb-3">
                            <p className="text-xs text-white/40 mb-2">{category}</p>
                            <div className="flex flex-wrap gap-1">
                              {emojiList.map((emoji) => (
                                <button
                                  key={`${category}-${emoji}`}
                                  onClick={() => {
                                    onInputChange(newMessage + emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !selectedChatId}
                className={`p-3 rounded-xl transition-all ${
                  newMessage.trim() && selectedChatId
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 cursor-pointer"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {errorMessage && <p className="mt-3 text-xs text-rose-300">{errorMessage}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RealtimeChatPanel;
