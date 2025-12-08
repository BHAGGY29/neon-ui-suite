import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SafetyShield from "@/components/SafetyShield";
import AlertBanner from "@/components/AlertBanner";
import character1 from "@/assets/character-1.jpg";
import character2 from "@/assets/character-2.jpg";
import character3 from "@/assets/character-3.jpg";
import character4 from "@/assets/character-4.jpg";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const chatContacts: ChatContact[] = [
  { id: "1", name: "Nova", avatar: character1, lastMessage: "The digital realm awaits...", time: "2m", unread: 3, online: true },
  { id: "2", name: "Shadow Lord", avatar: character2, lastMessage: "Darkness consumes all.", time: "15m", unread: 0, online: true },
  { id: "3", name: "Jae-Min", avatar: character3, lastMessage: "See you at the concert! 💜", time: "1h", unread: 1, online: false },
  { id: "4", name: "Celestia", avatar: character4, lastMessage: "The stars have spoken...", time: "3h", unread: 0, online: true },
];

const initialMessages: Message[] = [
  { id: "1", content: "Hey! Welcome to the cyber realm. I'm Nova, your guide through the digital underground.", sender: "ai", timestamp: new Date(Date.now() - 300000) },
  { id: "2", content: "Hey Nova! I've heard a lot about you.", sender: "user", timestamp: new Date(Date.now() - 240000) },
  { id: "3", content: "All good things, I hope? 😏 The matrix can be... overwhelming at first. But don't worry, I'll show you the ropes.", sender: "ai", timestamp: new Date(Date.now() - 180000) },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatContact>(chatContacts[0]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Interesting... Let me process that through my neural networks. The cyber world is vast, but together we can navigate it.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col">
      <AlertBanner />

      <div className="flex flex-1 pt-12 pb-20 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 flex-shrink-0 border-r border-border glass-card rounded-none hidden md:flex flex-col"
            >
              <div className="p-4 border-b border-border">
                <h2 className="heading-cyber text-lg text-glow-cyan">Chats</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {chatContacts.map((contact) => (
                  <motion.button
                    key={contact.id}
                    whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                    onClick={() => setSelectedChat(contact)}
                    className={`w-full p-4 flex items-center gap-3 transition-colors ${
                      selectedChat.id === contact.id ? "bg-muted border-l-2 border-neon-cyan" : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                      />
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{contact.name}</span>
                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-neon-pink text-xs flex items-center justify-center text-background font-bold">
                        {contact.unread}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-background/50">
          {/* Chat Header */}
          <div className="glass px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-cyan/50"
              />
              <div>
                <h3 className="font-semibold text-foreground">{selectedChat.name}</h3>
                <span className="text-xs text-neon-green">● Online</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Video className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[70%] ${
                    message.sender === "user" ? "bubble-user" : "bubble-ai"
                  } animate-bubble-pop`}
                >
                  <p className="text-foreground">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="glass p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="input-neon flex-1"
              />
              
              <SafetyShield size="md" />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="btn-neon px-4 py-3"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
