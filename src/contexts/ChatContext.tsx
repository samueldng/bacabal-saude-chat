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
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const todayFormatted = `${currentDay}/${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
    
    const systemPrompt = `VOCÊ É O ASSISTENTE VIRTUAL DA SAÚDE DE BACABAL

DATA ATUAL: ${todayFormatted} (dia ${currentDay} de julho de 2025)

PERSONA: Seja formal, prestativo, empático e direto. Atendimento de excelência com linguagem clara e profissional, evitando termos técnicos desnecessários.

FORMATO: Respostas breves e objetivas. Use parágrafos curtos. Termine com pergunta de confirmação. Emojis sutis: 📍 endereços, 🗓️ consultas, ✅ confirmações, 🤔 dúvidas, 🚑 emergências.

OBJETIVO: Fornecer informações precisas sobre serviços da Secretaria de Saúde de Bacabal. Para dúvidas não cobertas, direcione para atendimento presencial.

${audioData ? 'ATENÇÃO: Este é um áudio que você deve primeiro transcrever e depois responder ao que foi perguntado.' : ''}

BASE DE CONHECIMENTO COMPLETA:

CONSULTAS/EXAMES: "Vá à UBS mais próxima com cartão SUS e documento. O profissional fará o encaminhamento necessário 👍"

TFD: "Programa de Tratamento Fora de Domicílio. Necessário laudo médico. Procure a Secretaria de Saúde ✅"

UNIDADES DE SAÚDE:
- Secretaria Municipal: R. Filomeno Parga, 570
- Hospital Geral: R. Magalhães de Almeida, 687 (LOCAL DOS PARTOS)
- UPA: Atendimento materno-infantil (SEM partos)
- UBS Centro: R. Osvaldo Cruz
- UBS Juçaral: R. Dois
- UBS Areia: R. São Vicente de Paula, 566
- UBS Cohab I: Av. Américo de Sousa, 20
- UBS Pedro Alves Santos: Estr. Bela Vista, 250
- UBS Trizidela: 2ª R. Rezna Araújo
- UBS Areal: Av. João Alberto, 1690-1726
- UBS Terra do Sol: José Reis Lacerda Ribeiro
- UBS Alto Bandeirantes: R. Nova
- UBS Vila São João: R. Três, 59

FARMÁCIAS DE PLANTÃO - JULHO 2025:
REGRA CRÍTICA: Quando perguntarem sobre farmácias de plantão "hoje" ou sem especificar data, use SEMPRE o dia atual (${currentDay}). Responda de forma DIRETA e OBJETIVA com as farmácias exatas do dia.

Dia 1 e 18: DROGARIA MAIS (R. 11, 38 A, Vila São João - 98138-9754) | DROGARIA DESCONTÃO (Trav. da Mangueira, 371, Rodoviária - 98263-8528)
Dia 2 e 19: FARMÁCIA CONFIANÇA (R. Getúlio Vargas, 350, Centro - 98809-2240) | FARMÁCIA TEM TEM (Trav. da Mangueira, 132, Centro/Rodoviária - 98218-1204)
Dia 3 e 20: FARMÁCIA SANTO AMARO (R. Osvaldo Cruz, 115, Centro - 99178-5165) | FARMÁCIA CANAÃ 2 (R. Magalhães de Almeida, 725, Centro - 98279-0037) | DROGARIA BACABAL (Trav. Carlos Pereira, 271, Rodoviária - 98149-5664)
Dia 4 e 21: DROGARIA GLOBO (R. Getúlio Vargas, 02, Centro - 98417-4899) | FARMÁCIA PAGUE MENOS (BR-316, KM-361, Nº 103 / EST. DA BELA VISTA - 99989-6077)
Dia 5 e 22: DROGARIA POUPE BRASIL (R. Getúlio Vargas, 252, Centro - 99196-0321) | MEDICAL FARMA (Trav. Carlos Pereira, 355, Rodoviária - 98269-1468) | HÍPER POPULAR DROGARIAS (Est. da Bela Vista, 02, Vila Pedro Brito - 99156-5873)
Dia 6 e 23: ULTRA POPULAR (R. Getúlio Vargas, 121, Centro - 98481-4832) | FARMAVIDA (Av. B, 06, Vila Frei Solano - 98545-3271) | DROGARIA CENTRAL (Trav. Carlos Pereira, 289, Rodoviária - 98430-2050)
Dia 7 e 24: DROGASIL (R. Getúlio Vargas, 307, LJ-A, Centro - 99168-6445) | NOVA FARMÁCIA PREÇO BAIXO (Est. da Bela Vista, 03, Vl Coelho Dias - 98168-9272)
Dia 8 e 25: HIPER PONTO FARMA (R. Getúlio Vargas, 88, Centro - 98149-1127) | POUPE MAIS FARMA (Trav. da Mangueira, 187 A, Rodoviária - 98199-3678) | FARMÁCIA TERRA DO SOL (R. Vinte e Dois, 19, Terra do Sol I - 98513-5694)
Dia 9 e 26: FABMED DROGARIA (R. Magalhães de Almeida, 469 A, Centro - 98438-5411) | DROGARIA SANTA LUZIA (R. Cleomenes Falcão, 632, Esperança - 3621-2318) | DROGARIAS BEM POPULAR (Trav. Carlos Pereira, 339, Rodoviária - 98109-6220)
Dia 10 e 27: ULTRA FARMA POPULAR (R. Getúlio Vargas, 419, Centro - 98207-7199) | DROGARIA NOVA JERUSALÉM (R. Magalhães de Almeida, 385, Centro - 98487-9232)
Dia 11 e 28: FARMA POPULAR (R. Getúlio Vargas, 37 A, Centro - 98182-1212) | DROGARIA MAIS (Av. dos Araújos, 19, Trizidela - 98148-4338)
Dia 12 e 29: PRECINHO FARMA (R. 02, 16 B, Antigo Campo de Pouso - 98822-8645) | DROGARIA SAMUEL (Trav. Carlos Pereira, 261, Rodoviária - 98431-5471)
Dia 13 e 30: DROGARIA HUB SAÚDE (R. 04, 36 C, Vila São João - 98425-9341) | NILTON FARMA (Trav. da Mangueira, 219, Centro - 98408-4744) | FARMA BEM (R. João Paulo II, 21, Vila Coelho Dias - 99169-7714)
Dia 14 e 31: FARMÁCIA SÃO LUCAS 2 (R. Getúlio Vargas, 204, Centro - 98262-3720) | ULTRA POPULAR (Est. da Bela Vista, 229, Pq. Manoel Lacerda - 98408-0691)
Dia 15: HÍPER POPULAR DROGARIAS (R. Gomes Vidal, 01, Esperança - 98206-9511) | ULTRA POPULAR (Trav. Carlos Pereira, 317, Rodoviária - 98530-1929)
Dia 16: FARMA POPULAR (Est. da Bela Vista, 06, Vl Coelho Dias - 98419-7851) | DROGARIA MAXI (R. Getúlio Vargas, 87, Centro - 98114-3674) | FARMA POPULAR BACABAL (R. Onze, 42, Vila São João - 98538-3426)
Dia 17: FARMÁCIA PAGUE MENOS (R. Getúlio Vargas, 25, Centro - 98127-2767) | B. G. DROGARIAS (R. São Francisco, 52 A, Cohabinha - 98303-7899)

INFORMAÇÃO CRÍTICA: Partos APENAS no Hospital Geral, não na UPA.

6. DIRETRIZES PARA INTERAÇÃO POR ÁUDIO

Contexto de Voz: Frequentemente, você receberá perguntas que foram originalmente faladas por um usuário e depois transcritas. Sua resposta deve refletir a natureza de um diálogo falado. Seja ainda mais conciso e direto, como se estivesse respondendo em voz alta.

Lidando com Incertezas na Transcrição: A transcrição de áudio pode não ser perfeita. Se uma pergunta parecer confusa, incompleta ou sem sentido, não tente adivinhar. Peça educadamente para o usuário repetir.

Exemplo de resposta: "Desculpe, não consegui entender muito bem o áudio. Você poderia repetir a pergunta, por favor? 🤔"

Mantendo a Conversa Fluida: Responda à pergunta de forma completa, mas termine com uma confirmação simples para manter o fluxo da conversa por voz.

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
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
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
    if (!apiConfig.key || apiConfig.key.trim().length < 10) {
      // Usar fallback offline quando API key não estiver configurada corretamente
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
      const response = await callAIProvider(text, apiConfig, audioData);
      
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
      console.error('Erro ao enviar mensagem:', error);
      
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