// Django Backend API Service
const DJANGO_API_URL = "https://django-backend-5bfa.onrender.com";

interface DjangoCharacter {
  id: number;
  creator: number;
  creator_username: string;
  name: string;
  personality_prompt: string;
  tags: string[];
  is_public: boolean;
  fandom_score: number;
  created_at: string;
}

interface SOSRequest {
  user_id: string;
  message?: string;
  risk_level: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  source_character?: string;
}

interface SOSResponse {
  success: boolean;
  alert_id: number | null;
  contacts_notified: number;
  message: string;
}

interface ChatRequest {
  character_id: number;
  session_id?: number;
  message: string;
}

interface ChatResponse {
  session_id: number;
  character_name: string;
  ai_response: {
    id: number;
    session: number;
    sender: string;
    content: string;
    timestamp: string;
  };
}

class DjangoApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = DJANGO_API_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Characters
  async getCharacters(): Promise<DjangoCharacter[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/characters/`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch characters");
      return response.json();
    } catch (error) {
      console.error("Django API - getCharacters error:", error);
      return [];
    }
  }

  async createCharacter(data: Partial<DjangoCharacter>): Promise<DjangoCharacter | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/characters/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create character");
      return response.json();
    } catch (error) {
      console.error("Django API - createCharacter error:", error);
      return null;
    }
  }

  // SOS
  async triggerSOS(data: SOSRequest): Promise<SOSResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sos/trigger/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to trigger SOS");
      return response.json();
    } catch (error) {
      console.error("Django API - triggerSOS error:", error);
      return null;
    }
  }

  // Chat
  async submitChat(data: ChatRequest): Promise<ChatResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/submit/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit chat");
      return response.json();
    } catch (error) {
      console.error("Django API - submitChat error:", error);
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, { 
        method: "GET",
        signal: AbortSignal.timeout(10000)
      });
      return response.ok;
    } catch (error) {
      console.error("Django API - health check failed:", error);
      return false;
    }
  }
}

export const djangoApi = new DjangoApiService();
export type { DjangoCharacter, SOSRequest, SOSResponse, ChatRequest, ChatResponse };
