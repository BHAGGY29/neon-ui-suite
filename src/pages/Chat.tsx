import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import SafetyShield from "@/components/SafetyShield";
import AlertBanner from "@/components/AlertBanner";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [character, setCharacter] = useState<SelectedCharacter>({
    id: "mahika",
    name: "Mahika",
    avatar_url: character6,
    personality: "Empathetic & Protective Safety AI",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedCharacter');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCharacter({
          id: parsed.id,
          name: parsed.name,
          avatar_url: parsed.avatar_url || character6,
          personality: parsed.personality || parsed.description || null,
        });
        sessionStorage.removeItem('selectedCharacter');
      } catch (e) {
        console.error("Failed to parse character", e);
      }
    }
  }, []);

  useEffect(() => {
    setMessages([{
      id: "welcome",
      content: `Hey! I'm ${character.name}. ${character.personality ? `I'm known for being ${character.personality}.` : ''} How can I help you today?`,
      sender: "ai",
      timestamp: new Date(),
    }]);
  }, [character.name]);

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
          location = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
        }
      }
      const { data, error } = await supabase.functions.invoke('send-sos', {
        body: { userId: user.id, message, riskLevel, location, sourceCharacter: character.name },
      });
      if (error) throw error;
      toast({ title: "🚨 SOS Alert Sent", description: `${data.contactsNotified} trusted contacts notified.`, variant: "destructive" });
    } catch (error) { console.error('SOS error:', error); }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), content: inputValue, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: messageText, characterName: character.name, characterPersonality: character.personality, conversationHistory },
      });

      if (error) throw error;
      const { botReply, riskScore, triggerAlert } = data;

      if (triggerAlert) {
        setShowDangerAlert(true);
        if (user) await triggerSOS(messageText, riskScore);
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), content: botReply, sender: "ai", timestamp: new Date(), riskScore,
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), content: "I'm having trouble connecting. Please try again.", sender: "ai", timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <AlertBanner />

      <AnimatePresence>
        {showDangerAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDangerAlert(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-destructive/20 border border-destructive rounded-2xl p-6 max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}>
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4 animate-pulse" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Safety Alert Triggered</h3>
              <p className="text-muted-foreground mb-4">A potential danger detected. Your trusted contacts have been notified.</p>
              <button onClick={() => setShowDangerAlert(false)} className="bg-destructive text-destructive-foreground px-6 py-2 rounded-xl font-medium">I Understand</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-background/50">
          {/* Header */}
          <div className="glass px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={character.avatar_url || character6} alt={character.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-cyan/50" />
              <div>
                <h3 className="font-semibold text-foreground">{character.name}</h3>
                <span className="text-xs text-neon-green">● Online</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Phone className="w-5 h-5 text-muted-foreground" /></button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Video className="w-5 h-5 text-muted-foreground" /></button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="w-5 h-5 text-muted-foreground" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "ai" && (
                  <img src={character.avatar_url || character6} alt={character.name} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" />
                )}
                <div className={`max-w-[70%] ${message.sender === "user" ? "bubble-user" : "bubble-ai"} ${message.riskScore && message.riskScore >= 8 ? "border-destructive border-2" : ""} animate-bubble-pop`}>
                  <p className="text-foreground">{message.content}</p>
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
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="glass p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Paperclip className="w-5 h-5 text-muted-foreground" /></button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Smile className="w-5 h-5 text-muted-foreground" /></button>
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..." className="input-neon flex-1" disabled={isLoading} />
              <SafetyShield size="md" />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleSend} disabled={isLoading} className="btn-neon px-4 py-3 disabled:opacity-50">
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
