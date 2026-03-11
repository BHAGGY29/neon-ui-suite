import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, ArrowLeft, AlertTriangle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import FloatingSOS from "@/components/FloatingSOS";
import character6 from "@/assets/character-6.jpg";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  riskScore?: number;
}

interface SelectedCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  personality: string | null;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentRiskLevel, setCurrentRiskLevel] = useState<"safe" | "suspicious" | "emergency">("safe");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [character, setCharacter] = useState<SelectedCharacter>({
    id: "mahika",
    name: "Mahika",
    avatar_url: character6,
    personality: "Empathetic & Protective Safety AI",
  });

  // Load character from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedCharacter");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCharacter({
          id: parsed.id,
          name: parsed.name,
          avatar_url: parsed.avatar_url || character6,
          personality: parsed.personality || parsed.description || null,
        });
        sessionStorage.removeItem("selectedCharacter");
      } catch (e) {
        console.error("Failed to parse character", e);
      }
    }
  }, []);

  // Create or load conversation + welcome message
  useEffect(() => {
    const initConversation = async () => {
      if (!user) return;

      // Try to find existing conversation with this character
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("character_id", character.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setConversationId(existing.id);
        // Load existing messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", existing.id)
          .order("created_at", { ascending: true })
          .limit(50);

        if (msgs && msgs.length > 0) {
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              content: m.content,
              sender: m.sender === "user" ? "user" : "ai",
              timestamp: new Date(m.created_at),
              riskScore: m.risk_score || 0,
            }))
          );
          return;
        }
      }

      // Create new conversation if character ID is a valid UUID
      if (character.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: conv } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, character_id: character.id })
          .select()
          .single();
        if (conv) setConversationId(conv.id);
      }

      // Set welcome message
      setMessages([
        {
          id: "welcome",
          content: `Hey! I'm ${character.name}. ${character.personality ? `I'm known for being ${character.personality}.` : ""} How can I help you today?`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    };
    initConversation();
  }, [user, character.id, character.name, character.personality]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const triggerSOS = async (message: string, riskLevel: number) => {
    if (!user) return;
    try {
      let location = null;
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);
        if (position) {
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
        }
      }
      const { data, error } = await supabase.functions.invoke("send-sos", {
        body: { userId: user.id, message, riskLevel, location, sourceCharacter: character.name },
      });
      if (error) throw error;
      toast({
        title: "🚨 SOS Alert Sent",
        description: `${data.contactsNotified} trusted contacts notified.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("SOS error:", error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Save user message to DB
    if (conversationId && user) {
      supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          content: messageText,
          sender: "user",
          risk_score: 0,
        })
        .then(() => {
          // Update conversation timestamp
          supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
        });
    }

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          message: messageText,
          characterName: character.name,
          characterPersonality: character.personality,
          conversationHistory,
        },
      });

      if (error) throw error;
      const { botReply, riskScore, triggerAlert } = data;

      // Update risk level indicator
      if (riskScore >= 8) setCurrentRiskLevel("emergency");
      else if (riskScore >= 4) setCurrentRiskLevel("suspicious");
      else setCurrentRiskLevel("safe");

      if (triggerAlert) {
        setShowDangerAlert(true);
        if (user) await triggerSOS(messageText, riskScore);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: "ai",
        timestamp: new Date(),
        riskScore,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Save AI message to DB
      if (conversationId && user) {
        supabase.from("messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          content: botReply,
          sender: "ai",
          risk_score: riskScore || 0,
        });
        // Increment chat count
        if (character.id.match(/^[0-9a-f]{8}-/)) {
          supabase.rpc("has_role", { _user_id: user.id, _role: "user" }).then(() => {
            supabase.from("characters").select("chat_count").eq("id", character.id).single().then(({ data: c }) => {
              if (c) supabase.from("characters").update({ chat_count: (c.chat_count || 0) + 1 }).eq("id", character.id);
            });
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "I'm having trouble connecting. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const riskIndicator = {
    safe: { color: "text-neon-green", bg: "bg-neon-green/20", label: "🟢 Safe" },
    suspicious: { color: "text-neon-orange", bg: "bg-neon-orange/20", label: "🟡 Caution" },
    emergency: { color: "text-neon-red", bg: "bg-neon-red/20", label: "🔴 Alert" },
  };

  const risk = riskIndicator[currentRiskLevel];

  return (
    <div className="h-screen flex flex-col">
      {/* Danger Alert Modal */}
      <AnimatePresence>
        {showDangerAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDangerAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-destructive/20 border border-destructive rounded-2xl p-6 max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4 animate-pulse" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Safety Alert Triggered</h3>
              <p className="text-muted-foreground mb-4">
                A potential danger was detected. Your trusted contacts have been notified with your location.
              </p>
              <button
                onClick={() => setShowDangerAlert(false)}
                className="bg-destructive text-destructive-foreground px-6 py-2 rounded-xl font-medium"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="glass px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={character.avatar_url || character6}
            alt={character.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-cyan/50"
          />
          <div>
            <h3 className="font-semibold text-foreground">{character.name}</h3>
            <span className="text-xs text-neon-green">● Online</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Safety Indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
            {risk.label}
          </div>
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
            transition={{ delay: index * 0.03 }}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "ai" && (
              <img
                src={character.avatar_url || character6}
                alt={character.name}
                className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
              />
            )}
            <div
              className={`max-w-[75%] ${message.sender === "user" ? "bubble-user" : "bubble-ai"} ${
                message.riskScore && message.riskScore >= 8 ? "border-destructive border-2" : ""
              } animate-bubble-pop`}
            >
              <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <img src={character.avatar_url || character6} alt={character.name} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" />
            <div className="bubble-ai">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="input-neon flex-1"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading}
            className="btn-neon px-4 py-3 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <FloatingSOS />
    </div>
  );
};

export default Chat;
