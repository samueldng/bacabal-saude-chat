
import React, { createContext, useContext, useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'options';
  options?: string[];
  suggestions?: string[];
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente digital da SEMUS Bacabal. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      type: 'options',
      options: [
        'Agendar consulta',
        'Consultar exames',
        'Informações sobre programas',
        'Unidades de saúde',
        'Falar com atendente'
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');

  const updateApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response;
      
      if (apiKey) {
        // Usar API do Gemini com modelo atualizado
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Você é um assistente digital da SEMUS (Secretaria Municipal de Saúde) de Bacabal - MA. 
                Responda de forma educada, profissional e focada em questões de saúde pública.
                
                Contexto: O usuário está perguntando sobre serviços de saúde pública em Bacabal.
                
                Pergunta do usuário: ${content}
                
                Forneça uma resposta útil e, quando apropriado, sugira ações específicas que o usuário pode tomar.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        });

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json();
          console.error('Erro na API do Gemini:', errorData);
          throw new Error(`Erro na API do Gemini: ${errorData.error?.message || 'Erro desconhecido'}`);
        }

        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar sua solicitação.';
        
        response = {
          text,
          suggestions: [
            'Horários de funcionamento',
            'Documentos necessários',
            'Outras informações'
          ]
        };
      } else {
        // Fallback para respostas locais
        response = await getLocalResponse(content);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato pelo telefone (99) 3621-1234.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const getLocalResponse = async (userInput: string): Promise<{ text: string; suggestions?: string[] }> => {
    const normalizedInput = userInput.toLowerCase();
    
    if (normalizedInput.includes('agendar') || normalizedInput.includes('consulta')) {
      return {
        text: 'Para agendar uma consulta, você pode:\n\n• Ligar para (99) 3621-1234\n• Comparecer à UBS mais próxima\n• Usar o aplicativo ConecteSUS\n\nPrecisa do endereço de alguma unidade?',
        suggestions: ['Ver unidades próximas', 'Documentos necessários', 'Horários de funcionamento']
      };
    }
    
    if (normalizedInput.includes('exame')) {
      return {
        text: 'Para consultar seus exames, você precisa:\n\n• CPF e cartão SUS\n• Número do protocolo (se tiver)\n\nOs resultados ficam disponíveis em até 15 dias úteis.',
        suggestions: ['Onde retirar exames', 'Prazo dos resultados', 'Documentos necessários']
      };
    }
    
    if (normalizedInput.includes('unidade') || normalizedInput.includes('ubs')) {
      return {
        text: 'Principais unidades de saúde em Bacabal:\n\n• UBS Centro - Rua 7 de Setembro\n• UBS São Francisco - Bairro São Francisco\n• UBS Vila Nova - Bairro Vila Nova\n\nHorário: Segunda a Sexta, 7h às 17h',
        suggestions: ['Agendar consulta', 'Ver outros serviços', 'Contato direto']
      };
    }
    
    return {
      text: 'Posso ajudar com informações sobre:\n\n• Agendamento de consultas\n• Consulta de exames\n• Programas de saúde\n• Unidades de saúde\n• Contato com atendentes',
      suggestions: ['Agendar consulta', 'Consultar exames', 'Unidades de saúde']
    };
  };

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! Sou o assistente digital da SEMUS Bacabal. Como posso ajudá-lo hoje?',
        timestamp: new Date(),
        type: 'options',
        options: [
          'Agendar consulta',
          'Consultar exames',
          'Informações sobre programas',
          'Unidades de saúde',
          'Falar com atendente'
        ]
      }
    ]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        apiKey,
        setApiKey: updateApiKey,
        sendMessage,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
