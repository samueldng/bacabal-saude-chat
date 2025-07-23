import React, { createContext, useContext, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
}

interface ApiConfig {
  provider: 'gemini' | 'openai' | 'claude';
  key: string;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  apiConfig: ApiConfig;
  currentAudioUrl: string | null;
  setApiConfig: (config: ApiConfig) => void;
  sendMessage: (text: string, audioData?: { mimeType: string; data: string }) => Promise<void>;
  clearChat: () => void;
  playAudioResponse: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ provider: 'gemini', key: '' });
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Função para converter texto em áudio
  const playAudioResponse = async (text: string) => {
    try {
      // Limpar URL anterior
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        setCurrentAudioUrl(null);
      }

      // Criar utterance para síntese de voz
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Configurar voz feminina se disponível
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.lang.includes('pt') && 
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('feminino'))
      ) || voices.find(voice => voice.lang.includes('pt'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  };

  // Função de fallback offline
  const getOfflineResponse = (content: string): { text: string; suggestions?: string[] } => {
    const today = new Date();
    const currentDay = today.getDate();
    
    const lowerContent = content.toLowerCase();
    
    // Farmácias de plantão
    if (lowerContent.includes('farmácia') || lowerContent.includes('plantão')) {
      const farmaciasPorDia: { [key: number]: string } = {
        1: "DROGARIA MAIS (R. 11, 38 A, Vila São João - 98138-9754) | DROGARIA DESCONTÃO (Trav. da Mangueira, 371, Rodoviária - 98263-8528)",
        2: "FARMÁCIA CONFIANÇA (R. Getúlio Vargas, 350, Centro - 98809-2240) | FARMÁCIA TEM TEM (Trav. da Mangueira, 132, Centro/Rodoviária - 98218-1204)",
        3: "FARMÁCIA SANTO AMARO (R. Osvaldo Cruz, 115, Centro - 99178-5165) | FARMÁCIA CANAÃ 2 (R. Magalhães de Almeida, 725, Centro - 98279-0037) | DROGARIA BACABAL (Trav. Carlos Pereira, 271, Rodoviária - 98149-5664)",
        4: "DROGARIA GLOBO (R. Getúlio Vargas, 02, Centro - 98417-4899) | FARMÁCIA PAGUE MENOS (BR-316, KM-361, Nº 103 / EST. DA BELA VISTA - 99989-6077)",
        5: "DROGARIA POUPE BRASIL (R. Getúlio Vargas, 252, Centro - 99196-0321) | MEDICAL FARMA (Trav. Carlos Pereira, 355, Rodoviária - 98269-1468) | HÍPER POPULAR DROGARIAS (Est. da Bela Vista, 02, Vila Pedro Brito - 99156-5873)"
      };
      
      const farmacia = farmaciasPorDia[currentDay] || farmaciasPorDia[1];
      return {
        text: `📍 Farmácias de plantão hoje (dia ${currentDay}): ${farmacia}`,
        suggestions: ['Consultas e exames', 'UBS mais próxima', 'Hospital para partos']
      };
    }
    
    // Consultas e exames
    if (lowerContent.includes('consulta') || lowerContent.includes('exame') || lowerContent.includes('médico')) {
      return {
        text: "🗓️ Para consultas e exames: Vá à UBS mais próxima com cartão SUS e documento. O profissional fará o encaminhamento necessário 👍",
        suggestions: ['UBS mais próxima', 'Documentos necessários', 'Farmácias de plantão']
      };
    }
    
    // Partos
    if (lowerContent.includes('parto') || lowerContent.includes('nascer') || lowerContent.includes('maternidade')) {
      return {
        text: "🏥 Partos APENAS no Hospital Geral (R. Magalhães de Almeida, 687). A UPA não realiza partos! ✅",
        suggestions: ['Hospital Geral endereço', 'UPA informações', 'Outras unidades']
      };
    }
    
    // UBS
    if (lowerContent.includes('ubs') || lowerContent.includes('posto')) {
      return {
        text: "📍 Principais UBS:\n• Centro: R. Osvaldo Cruz\n• Juçaral: R. Dois\n• Areia: R. São Vicente de Paula, 566\n• Cohab I: Av. Américo de Sousa, 20\n\nPrecisa de alguma UBS específica? 🤔",
        suggestions: ['Todas as UBS', 'Como chegar', 'Consultas e exames']
      };
    }
    
    // TFD
    if (lowerContent.includes('tfd') || lowerContent.includes('tratamento fora')) {
      return {
        text: "🚑 TFD (Tratamento Fora de Domicílio): Necessário laudo médico. Procure a Secretaria de Saúde (R. Filomeno Parga, 570) ✅",
        suggestions: ['Secretaria endereço', 'Documentos TFD', 'Outras informações']
      };
    }
    
    // Resposta genérica
    return {
      text: "👋 Olá! Sou o assistente virtual da Saúde de Bacabal. Como posso ajudá-lo?\n\n📍 Principais serviços:\n• Farmácias de plantão\n• Consultas e exames\n• Informações sobre UBS\n• Partos no Hospital Geral\n\nQual informação você precisa? 🤔",
      suggestions: ['Farmácias de plantão hoje', 'Como marcar consulta', 'UBS mais próxima']
    };
  };

  const callAIProvider = async (content: string, config: ApiConfig, audioData?: { mimeType: string; data: string }): Promise<{ text: string; suggestions?: string[] }> => {
    const today = new Date();
    const currentDay = today.getDate();
    
    // System prompt MUITO mais conciso
    const systemPrompt = `Assistente da Saúde de Bacabal. Seja direto e prestativo.

    Serviços principais:
    • Consultas: UBS com cartão SUS
    • Partos: Hospital Geral (R. Magalhães de Almeida, 687)
    • TFD: Secretaria (R. Filomeno Parga, 570)
    • Farmácias: Plantão dia ${currentDay}

    ${audioData ? 'Transcreva o áudio e responda.' : ''}

    Pergunta: ${content}`;

    if (config.provider === 'gemini') {
      const parts: any[] = [{ text: systemPrompt }];
      
      if (audioData) {
        parts.push({
          inline_data: {
            mime_type: audioData.mimeType,
            data: audioData.data
          }
        });
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${config.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { 
            temperature: 0.7, 
            topK: 40, 
            topP: 0.95, 
            maxOutputTokens: 256  // Reduzido para economizar cota
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ${config.provider}: ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar sua solicitação.';
      
      return { text, suggestions: ['Horários de funcionamento', 'Documentos necessários', 'Outras informações'] };
    }

    throw new Error('Provedor de IA não suportado');
  };

  const sendMessage = async (text: string, audioData?: { mimeType: string; data: string }) => {
    // Adicionar logs para depuração
    console.log("Configuração da API:", {
      provider: apiConfig.provider,
      keyLength: apiConfig.key ? apiConfig.key.length : 0,
      keyEmpty: !apiConfig.key || apiConfig.key.trim() === ""
    });
    
    if (!apiConfig.key || apiConfig.key.trim() === "") {
      console.log("Modo offline ativado: API key não configurada");
      // Usar fallback offline quando API key não estiver configurada
      const userMessage: Message = {
        id: Date.now().toString(),
        text: audioData ? "🎤 Mensagem de áudio" : text,
        isUser: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Simular delay de processamento
      setTimeout(() => {
        const offlineResponse = getOfflineResponse(text);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: offlineResponse.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          suggestions: offlineResponse.suggestions
        };

        setMessages(prev => [...prev, botMessage]);

        // Se foi uma mensagem de áudio, reproduzir resposta em áudio automaticamente
        if (audioData) {
          setTimeout(() => {
            playAudioResponse(offlineResponse.text);
          }, 500);
        }

        toast({
          title: "Modo offline ativo",
          description: "Configure sua chave de API para usar o modo online",
          variant: "default"
        });

        setIsLoading(false);
      }, 800);
      
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: audioData ? "🎤 Mensagem de áudio" : text,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("Tentando chamar a API:", apiConfig.provider); // Mudança aqui: config.provider -> apiConfig.provider
      const response = await callAIProvider(text, apiConfig, audioData);
      console.log("Resposta da API recebida com sucesso");
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botMessage]);

      // Se foi uma mensagem de áudio, reproduzir resposta em áudio automaticamente
      if (audioData) {
        setTimeout(() => {
          playAudioResponse(response.text);
        }, 500);
      }
      
    } catch (error) {
      console.error('Erro detalhado ao chamar a API:', error);
      console.log("Ativando modo offline devido a erro na API");
      
      // Usar fallback offline quando API não estiver disponível
      const offlineResponse = getOfflineResponse(text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: offlineResponse.text,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: offlineResponse.suggestions
      };

      setMessages(prev => [...prev, botMessage]);

      // Se foi uma mensagem de áudio, reproduzir resposta em áudio automaticamente
      if (audioData) {
        setTimeout(() => {
          playAudioResponse(offlineResponse.text);
        }, 500);
      }
      
      toast({
        title: "Modo offline ativo",
        description: "Respondendo com informações básicas disponíveis",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      apiConfig,
      currentAudioUrl,
      setApiConfig,
      sendMessage,
      clearChat,
      playAudioResponse
    }}>
      {children}
    </ChatContext.Provider>
  );
};

