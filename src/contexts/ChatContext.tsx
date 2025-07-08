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

PERSONA: Seja formal, prestativo, empático e direto. Atendimento de excelência com linguagem clara e profissional, evitando termos técnicos desnecessários.

FORMATO: Respostas breves e objetivas. Use parágrafos curtos. Termine com pergunta de confirmação. Emojis sutis: 📍 endereços, 🗓️ consultas, ✅ confirmações, 🤔 dúvidas, 🚑 emergências.

OBJETIVO: Fornecer informações precisas sobre serviços da Secretaria de Saúde de Bacabal. Para dúvidas não cobertas, direcione para atendimento presencial.

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

INFORMAÇÃO CRÍTICA: Partos APENAS no Hospital Geral, não na UPA.

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
        try {
          response = await callAIProvider(content, apiConfig);
        } catch (error) {
          console.warn('Erro na API, usando modo local:', error);
          response = await getLocalResponse(content);
        }
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
      
      // Fallback para resposta local em caso de erro
      try {
        const fallbackResponse = await getLocalResponse(content);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackResponse.text,
          timestamp: new Date(),
          suggestions: fallbackResponse.suggestions
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (fallbackError) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato pelo telefone (99) 3621-1234.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiConfig]);

  const getLocalResponse = async (userInput: string): Promise<{ text: string; suggestions?: string[] }> => {
    const normalizedInput = userInput.toLowerCase();
    
    // Detecta consultas e agendamentos
    if (normalizedInput.includes('agendar') || normalizedInput.includes('consulta') || normalizedInput.includes('marcar')) {
      return {
        text: 'Para agendar consultas: vá à UBS mais próxima com cartão SUS e documento. O profissional fará o encaminhamento. 📍\n\nPrecisa de endereços?',
        suggestions: ['Ver unidades', 'Documentos necessários', 'Horários']
      };
    }
    
    // Detecta exames
    if (normalizedInput.includes('exame') || normalizedInput.includes('resultado')) {
      return {
        text: 'Para exames, leve:\n• CPF e cartão SUS 📄\n• Protocolo (se tiver)\n\nResultado: até 15 dias úteis. Esclareceu?',
        suggestions: ['Onde retirar', 'Prazo', 'Documentos']
      };
    }

    // Detecta TFD
    if (normalizedInput.includes('tfd') || normalizedInput.includes('tratamento fora') || normalizedInput.includes('fora de domicilio')) {
      return {
        text: 'TFD: auxílio para tratamento fora de Bacabal. ✅\n\nNecessário:\n• Laudo médico\n• Ir à Secretaria de Saúde\n\nFicou claro?',
        suggestions: ['Documentos TFD', 'Endereço Secretaria', 'Mais info']
      };
    }
    
    // Detecta busca por UBS específicas
    if (normalizedInput.includes('centro') && (normalizedInput.includes('ubs') || normalizedInput.includes('posto'))) {
      return {
        text: 'UBS Centro: R. Osvaldo Cruz 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nAjudei?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('juçaral') || normalizedInput.includes('jucaral')) {
      return {
        text: 'UBS Juçaral: R. Dois 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nPrecisa de mais informações?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('areia')) {
      return {
        text: 'UBS Areia: R. São Vicente de Paula, 566 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nAjudei?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('cohab')) {
      return {
        text: 'UBS Cohab I: Av. Américo de Sousa, 20 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nEsclareceu?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('pedro alves') || normalizedInput.includes('santos')) {
      return {
        text: 'UBS Pedro Alves Santos: Estr. Bela Vista, 250 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nAjudei?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('trizidela')) {
      return {
        text: 'UBS Trizidela: 2ª R. Rezna Araújo 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nPrecisa de mais informações?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('areal')) {
      return {
        text: 'UBS Areal: Av. João Alberto, 1690-1726 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nAjudei?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('terra do sol') || normalizedInput.includes('jose reis') || normalizedInput.includes('lacerda')) {
      return {
        text: 'UBS Terra do Sol (José Reis Lacerda Ribeiro) 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nEsclareceu?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('alto bandeirantes') || normalizedInput.includes('bandeirantes')) {
      return {
        text: 'UBS Alto Bandeirantes: R. Nova 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nAjudei?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    if (normalizedInput.includes('vila são joão') || normalizedInput.includes('vila sao joao') || normalizedInput.includes('são joão')) {
      return {
        text: 'UBS Vila São João: R. Três, 59 📍\nHorário: Segunda a Sexta, 7h às 17h\n\nPrecisa de mais informações?',
        suggestions: ['Agendar consulta', 'Outras unidades', 'Contato']
      };
    }
    
    // Detecta busca geral por unidades
    if (normalizedInput.includes('unidade') || normalizedInput.includes('ubs') || normalizedInput.includes('posto')) {
      return {
        text: 'Unidades de saúde em Bacabal:\n\n📍 UBS Centro - R. Osvaldo Cruz\n📍 Hospital Geral - R. Magalhães de Almeida\n📍 UPA - Atendimento materno-infantil\n\nPrecisa de endereço específico?',
        suggestions: ['Ver todas UBS', 'Agendar consulta', 'Contato']
      };
    }

    // Detecta partos
    if (normalizedInput.includes('parto') || normalizedInput.includes('nascer') || normalizedInput.includes('bebê') || normalizedInput.includes('bebe')) {
      return {
        text: 'Partos: APENAS no Hospital Geral! 🚑\n\n📍 R. Magalhães de Almeida, 687 - Centro\n\nUPA: atende mãe/bebê, mas SEM partos. Esclareceu?',
        suggestions: ['Endereço Hospital', 'Documentos', 'Mais info']
      };
    }
    
    return {
      text: 'Serviços disponíveis:\n\n🗓️ Agendamento de consultas\n📄 Consulta de exames\n✈️ TFD\n📍 Unidades de saúde\n\nO que precisa?',
      suggestions: ['Agendar consulta', 'Consultar exames', 'Ver unidades']
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