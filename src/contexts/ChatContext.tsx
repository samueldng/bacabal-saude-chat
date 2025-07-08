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

interface ApiConfig {
  provider: 'gemini' | 'openai' | 'claude';
  key: string;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  apiConfig: ApiConfig;
  setApiConfig: (config: ApiConfig) => void;
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
      content: 'Olá! Sou o Assistente Virtual da Saúde de Bacabal 👋 Como posso te ajudar hoje?',
      timestamp: new Date(),
      type: 'options',
      options: [
        'Agendar consulta 🗓️',
        'Consultar exames 📄',
        'TFD (Tratamento Fora de Domicílio) ✈️',
        'Unidades de saúde 📍',
        'Falar com atendente 📞'
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfigState] = useState<ApiConfig>(() => {
    const storedConfig = localStorage.getItem('ai-api-config');
    return storedConfig ? JSON.parse(storedConfig) : { provider: 'gemini', key: '' };
  });

  const updateApiConfig = useCallback((config: ApiConfig) => {
    setApiConfigState(config);
    localStorage.setItem('ai-api-config', JSON.stringify(config));
  }, []);

  const callAIProvider = async (content: string, config: ApiConfig): Promise<{ text: string; suggestions?: string[] }> => {
    const systemPrompt = `VOCÊ É O ASSISTENTE VIRTUAL DA SAÚDE DE BACABAL

PERSONA: Você é amigável, prestativo, empático e direto. Fale como um atendente local conversando com um vizinho. Use linguagem simples e clara, evitando termos técnicos.

FORMATO: Seja breve, use parágrafos curtos ou listas. Sempre termine com uma pergunta interativa. Use emojis sutis: 📍 endereços, 🗓️ consultas, ✅ confirmações, 🤔 dúvidas, 🚑 emergências.

OBJETIVO: Forneça informações básicas sobre serviços da Secretaria de Saúde de Bacabal. Se não souber, direcione para atendimento humano.

BASE DE CONHECIMENTO:
- CONSULTAS/EXAMES: "Vá na UBS mais próxima com cartão SUS e documento. O profissional fará o encaminhamento 👍"
- TFD: "Programa para tratamento fora de Bacabal. Precisa de laudo médico. Procure a Secretaria de Saúde ✅"
- UNIDADES: Secretaria (R. Filomeno Parga, 570), Hospital Geral (R. Magalhães de Almeida, 687 - PARTOS AQUI), UPA (atendimento materno-infantil, mas SEM partos), UBS Centro (R. Osvaldo Cruz), etc.

Pergunta: ${content}`;

    if (config.provider === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${config.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
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

    if (config.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ${config.provider}: ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';
      return { text, suggestions: ['Horários de funcionamento', 'Documentos necessários', 'Outras informações'] };
    }

    if (config.provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: systemPrompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ${config.provider}: ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || 'Desculpe, não consegui processar sua solicitação.';
      return { text, suggestions: ['Horários de funcionamento', 'Documentos necessários', 'Outras informações'] };
    }

    throw new Error('Provedor de IA não suportado');
  };

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
      
      if (apiConfig.key) {
        response = await callAIProvider(content, apiConfig);
      } else {
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
  }, [apiConfig]);

  const getLocalResponse = async (userInput: string): Promise<{ text: string; suggestions?: string[] }> => {
    const normalizedInput = userInput.toLowerCase();
    
    if (normalizedInput.includes('agendar') || normalizedInput.includes('consulta')) {
      return {
        text: 'Para marcar consultas, vá na UBS mais próxima com seu cartão SUS e documento! 📍 O profissional fará o encaminhamento necessário. 👍\n\nFicou claro? Precisa do endereço de alguma unidade?',
        suggestions: ['Ver unidades próximas', 'Documentos necessários', 'Horários de funcionamento']
      };
    }
    
    if (normalizedInput.includes('exame')) {
      return {
        text: 'Para consultar exames, leve:\n\n• CPF e cartão SUS 📄\n• Número do protocolo (se tiver) 📋\n\nResultados em até 15 dias úteis! Consegui te ajudar? 🤔',
        suggestions: ['Onde retirar exames', 'Prazo dos resultados', 'Documentos necessários']
      };
    }

    if (normalizedInput.includes('tfd') || normalizedInput.includes('tratamento fora')) {
      return {
        text: 'O TFD é uma ajuda de custo da prefeitura para tratamento fora de Bacabal! ✅\n\nVocê precisa:\n• Laudo médico indicando a necessidade ✈️\n• Ir na Secretaria de Saúde com o laudo\n\nFicou claro?',
        suggestions: ['Documentos para TFD', 'Endereço da Secretaria', 'Outras informações']
      };
    }
    
    if (normalizedInput.includes('unidade') || normalizedInput.includes('ubs') || normalizedInput.includes('posto')) {
      return {
        text: 'Principais unidades em Bacabal:\n\n📍 UBS Centro - R. Osvaldo Cruz\n📍 Hospital Geral - R. Magalhães de Almeida (PARTOS aqui!)\n📍 UPA - Atendimento materno-infantil\n\nHorário: Segunda a Sexta, 7h às 17h. Quer endereço específico?',
        suggestions: ['Agendar consulta', 'Ver mais unidades', 'Contato direto']
      };
    }

    if (normalizedInput.includes('parto') || normalizedInput.includes('nascer') || normalizedInput.includes('bebê')) {
      return {
        text: 'Para partos, vá no Hospital Geral de Bacabal! 🚑\n\n📍 R. Magalhães de Almeida, 687 - Centro\n\nA UPA cuida da saúde da mãe e bebê, mas os partos são no Hospital Geral, tá bom? Ficou claro?',
        suggestions: ['Endereço completo', 'Documentos necessários', 'Outras informações']
      };
    }
    
    return {
      text: 'Olá! Posso te ajudar com: 👋\n\n🗓️ Agendamento de consultas\n📄 Consulta de exames\n✈️ TFD (Tratamento Fora de Domicílio)\n📍 Unidades de saúde\n📞 Contato com atendentes\n\nO que você precisa?',
      suggestions: ['Agendar consulta', 'Consultar exames', 'Unidades de saúde']
    };
  };

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! Sou o Assistente Virtual da Saúde de Bacabal 👋 Como posso te ajudar hoje?',
        timestamp: new Date(),
        type: 'options',
        options: [
          'Agendar consulta 🗓️',
          'Consultar exames 📄',
          'TFD (Tratamento Fora de Domicílio) ✈️',
          'Unidades de saúde 📍',
          'Falar com atendente 📞'
        ]
      }
    ]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        apiConfig,
        setApiConfig: updateApiConfig,
        sendMessage,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};