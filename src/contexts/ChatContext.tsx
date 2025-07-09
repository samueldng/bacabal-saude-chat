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
        'Farmácias de plantão 💊',
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
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // Janeiro é 0
    const currentYear = today.getFullYear();
    const todayFormatted = `${currentDay}/${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
    
    const systemPrompt = `VOCÊ É O ASSISTENTE VIRTUAL DA SAÚDE DE BACABAL

DATA ATUAL: ${todayFormatted} (dia ${currentDay} de julho de 2025)

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

EXEMPLO DE RESPOSTA PARA FARMÁCIAS DE PLANTÃO:
Se hoje for dia 9: "Farmácias de plantão hoje (9/07):

📍 FABMED DROGARIA - R. Magalhães de Almeida, 469 A, Centro - 📞 98438-5411
📍 DROGARIA SANTA LUZIA - R. Cleomenes Falcão, 632, Esperança - 📞 3621-2318  
📍 DROGARIAS BEM POPULAR - Trav. Carlos Pereira, 339, Rodoviária - 📞 98109-6220

Precisa de mais informações?"

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

  const getPharmacyDuty = (day: number): { text: string; suggestions?: string[] } => {
    const pharmacyData: { [key: number]: { name: string; address: string; phone: string }[] } = {
      1: [
        { name: 'DROGARIA MAIS', address: 'RUA 11, Nº 38 A, VILA SÃO JOÃO', phone: '98138-9754' },
        { name: 'DROGARIA DESCONTÃO', address: 'TRAVESSA DA MANGUEIRA, 371 - RODOVIÁRIA', phone: '98263-8528' }
      ],
      2: [
        { name: 'FARMÁCIA CONFIANÇA', address: 'RUA GETÚLIO VARGAS, 350 - CENTRO', phone: '98809-2240' },
        { name: 'FARMÁCIA TEM TEM', address: 'TRAVESSA DA MANGUEIRA, 132 – CENTRO/RODOVIÁRIA', phone: '98218-1204' }
      ],
      3: [
        { name: 'FARMÁCIA SANTO AMARO', address: 'RUA OSVALDO CRUZ, 115 - CENTRO', phone: '99178-5165' },
        { name: 'FARMÁCIA CANAÃ 2', address: 'RUA MAGALHÃES DE ALMEIDA, 725 - CENTRO', phone: '98279-0037' },
        { name: 'DROGARIA BACABAL', address: 'TRAVESSA CARLOS PEREIRA, 271 - RODOVIÁRIA', phone: '98149-5664' }
      ],
      4: [
        { name: 'DROGARIA GLOBO', address: 'RUA GETÚLIO VARGAS, 02 – CENTRO', phone: '98417-4899' },
        { name: 'FARMÁCIA PAGUE MENOS', address: 'BR-316, KM-361, Nº 103 / EST. DA BELA VISTA', phone: '99989-6077' }
      ],
      5: [
        { name: 'DROGARIA POUPE BRASIL', address: 'RUA GETULIO VARGAS, 252 - CENTRO', phone: '99196-0321' },
        { name: 'MEDICAL FARMA', address: 'TRAVESSA CARLOS PEREIRA, 355 – RODOVIÁRIA', phone: '98269-1468' },
        { name: 'HÍPER POPULAR DROGARIAS', address: 'ESTRADA DA BELA VISTA, 02 – VILA PEDRO BRITO', phone: '99156-5873' }
      ],
      6: [
        { name: 'ULTRA POPULAR', address: 'RUA GETÚLIO VARGAS, 121 – CENTRO', phone: '98481-4832' },
        { name: 'FARMAVIDA', address: 'AVENIDA B – Nº 06 – VILA FREI SOLANO', phone: '98545-3271' },
        { name: 'DROGARIA CENTRAL', address: 'TRAVESSA CARLOS PEREIRA, 289 - RODOVIÁRIA', phone: '98430-2050' }
      ],
      7: [
        { name: 'DROGASIL', address: 'RUA GETÚLIO VARGAS, 307, LJ- A – CENTRO', phone: '99168-6445' },
        { name: 'NOVA FARMÁCIA PREÇO BAIXO', address: 'ESTRADA DA BELA VISTA, 03 - VL COELHO DIAS', phone: '98168-9272' }
      ],
      8: [
        { name: 'HIPER PONTO FARMA', address: 'RUA GETÚLIO VARGAS, 88 – CENTRO', phone: '98149-1127' },
        { name: 'POUPE MAIS FARMA', address: 'TRAVESSA DA MANGUEIRA, 187 A - RODOVIÁRIA', phone: '98199-3678' },
        { name: 'FARMÁCIA TERRA DO SOL', address: 'RUA VINTE E DOIS Nº 19 – TERRA DO SOL I', phone: '98513-5694' }
      ],
      9: [
        { name: 'FABMED DROGARIA', address: 'RUA MAGALHÃES DE ALMEIDA, 469 A - CENTRO', phone: '98438-5411' },
        { name: 'DROGARIA SANTA LUZIA', address: 'RUA CLEOMENES FALCÃO, 632 – ESPERANÇA', phone: '3621-2318' },
        { name: 'DROGARIAS BEM POPULAR', address: 'TRAVESSA CARLOS PEREIRA, 339 – RODOVIÁRIA', phone: '98109-6220' }
      ],
      10: [
        { name: 'ULTRA FARMA POPULAR', address: 'RUA GETÚLIO VARGAS, 419 - CENTRO', phone: '98207-7199' },
        { name: 'DROGARIA NOVA JERUSALÉM', address: 'RUA MAGALHÃES DE ALMEIDA, 385 - CENTRO', phone: '98487-9232' }
      ],
      11: [
        { name: 'FARMA POPULAR', address: 'RUA GETÚLIO VARGAS, 37 A - CENTRO', phone: '98182-1212' },
        { name: 'DROGARIA MAIS', address: 'AVENIDA DOS ARAÚJOS, 19 – TRIZIDELA', phone: '98148-4338' }
      ],
      12: [
        { name: 'PRECINHO FARMA', address: 'RUA 02, Nº 16 B - ANTIGO CAMPO DE POUSO', phone: '98822-8645' },
        { name: 'DROGARIA SAMUEL', address: 'TRAVESSA CARLOS PEREIRA, 261 – RODOVIÁRIA', phone: '98431-5471' }
      ],
      13: [
        { name: 'DROGARIA HUB SAÚDE', address: 'RUA 04, N° 36 C, VILA SÃO JOÃO', phone: '98425-9341' },
        { name: 'NILTON FARMA', address: 'TRAVESSA DA MANGUEIRA, 219 - CENTRO', phone: '98408-4744' },
        { name: 'FARMA BEM', address: 'RUA JOÃO PAULO II, 21 – VILA COELHO DIAS', phone: '99169-7714' }
      ],
      14: [
        { name: 'FARMÁCIA SÃO LUCAS 2', address: 'RUA GETÚLIO VARGAS, 204 – CENTRO', phone: '98262-3720' },
        { name: 'ULTRA POPULAR', address: 'ESTRADA DA BELA VISTA, 229 – PQ. MANOEL LACERDA', phone: '98408-0691' }
      ],
      15: [
        { name: 'HÍPER POPULAR DROGARIAS', address: 'RUA GOMES VIDAL, 01 – ESPERANÇA', phone: '98206-9511' },
        { name: 'ULTRA POPULAR', address: 'TRAVESSA CARLOS PEREIRA, 317 – RODOVIÁRIA', phone: '98530-1929' }
      ],
      16: [
        { name: 'FARMA POPULAR', address: 'ESTRADA DA BELA VISTA, 06 – VL COELHO DIAS', phone: '98419-7851' },
        { name: 'DROGARIA MAXI', address: 'RUA GETÚLIO VARGAS, 87 – CENTRO', phone: '98114-3674' },
        { name: 'FARMA POPULAR BACABAL', address: 'RUA ONZE, 42 – VILA SÃO JOÃO', phone: '98538-3426' }
      ],
      17: [
        { name: 'FARMÁCIA PAGUE MENOS', address: 'RUA GETÚLIO VARGAS, 25 – CENTRO', phone: '98127-2767' },
        { name: 'B. G. DROGARIAS', address: 'RUA SÃO FRANCISCO, 52 A – COHABINHA', phone: '98303-7899' }
      ],
      18: [
        { name: 'DROGARIA MAIS', address: 'RUA 11, Nº 38 A, VILA SÃO JOÃO', phone: '98138-9754' },
        { name: 'DROGARIA DESCONTÃO', address: 'TRAVESSA DA MANGUEIRA, 371 - RODOVIÁRIA', phone: '98263-8528' }
      ],
      19: [
        { name: 'FARMÁCIA CONFIANÇA', address: 'RUA GETÚLIO VARGAS, 350 - CENTRO', phone: '98809-2240' },
        { name: 'FARMÁCIA TEM TEM', address: 'TRAVESSA DA MANGUEIRA, 132 – CENTRO/RODOVIÁRIA', phone: '98218-1204' }
      ],
      20: [
        { name: 'FARMÁCIA SANTO AMARO', address: 'RUA OSVALDO CRUZ, 115 - CENTRO', phone: '99178-5165' },
        { name: 'FARMÁCIA CANAÃ 2', address: 'RUA MAGALHÃES DE ALMEIDA, 725 - CENTRO', phone: '98279-0037' },
        { name: 'DROGARIA BACABAL', address: 'TRAVESSA CARLOS PEREIRA, 271 - RODOVIÁRIA', phone: '98149-5664' }
      ],
      21: [
        { name: 'DROGARIA GLOBO', address: 'RUA GETÚLIO VARGAS, 02 – CENTRO', phone: '98417-4899' },
        { name: 'FARMÁCIA PAGUE MENOS', address: 'BR-316, KM-361, Nº 103 / EST. DA BELA VISTA', phone: '99989-6077' }
      ],
      22: [
        { name: 'DROGARIA POUPE BRASIL', address: 'RUA GETULIO VARGAS, 252 - CENTRO', phone: '99196-0321' },
        { name: 'MEDICAL FARMA', address: 'TRAVESSA CARLOS PEREIRA, 355 – RODOVIÁRIA', phone: '98269-1468' },
        { name: 'HÍPER POPULAR DROGARIAS', address: 'ESTRADA DA BELA VISTA, 02 – VILA PEDRO BRITO', phone: '99156-5873' }
      ],
      23: [
        { name: 'ULTRA POPULAR', address: 'RUA GETÚLIO VARGAS, 121 – CENTRO', phone: '98481-4832' },
        { name: 'FARMAVIDA', address: 'AVENIDA B – Nº 06 – VILA FREI SOLANO', phone: '98545-3271' },
        { name: 'DROGARIA CENTRAL', address: 'TRAVESSA CARLOS PEREIRA, 289 - RODOVIÁRIA', phone: '98430-2050' }
      ],
      24: [
        { name: 'DROGASIL', address: 'RUA GETÚLIO VARGAS, 307, LJ- A – CENTRO', phone: '99168-6445' },
        { name: 'NOVA FARMÁCIA PREÇO BAIXO', address: 'ESTRADA DA BELA VISTA, 03 - VL COELHO DIAS', phone: '98168-9272' }
      ],
      25: [
        { name: 'HIPER PONTO FARMA', address: 'RUA GETÚLIO VARGAS, 88 – CENTRO', phone: '98149-1127' },
        { name: 'POUPE MAIS FARMA', address: 'TRAVESSA DA MANGUEIRA, 187 A - RODOVIÁRIA', phone: '98199-3678' },
        { name: 'FARMÁCIA TERRA DO SOL', address: 'RUA VINTE E DOIS Nº 19 – TERRA DO SOL I', phone: '98513-5694' }
      ],
      26: [
        { name: 'FABMED DROGARIA', address: 'RUA MAGALHÃES DE ALMEIDA, 469 A - CENTRO', phone: '98438-5411' },
        { name: 'DROGARIA SANTA LUZIA', address: 'RUA CLEOMENES FALCÃO, 632 – ESPERANÇA', phone: '3621-2318' },
        { name: 'DROGARIAS BEM POPULAR', address: 'TRAVESSA CARLOS PEREIRA, 339 – RODOVIÁRIA', phone: '98109-6220' }
      ],
      27: [
        { name: 'ULTRA FARMA POPULAR', address: 'RUA GETÚLIO VARGAS, 419 - CENTRO', phone: '98207-7199' },
        { name: 'DROGARIA NOVA JERUSALÉM', address: 'RUA MAGALHÃES DE ALMEIDA, 385 - CENTRO', phone: '98487-9232' }
      ],
      28: [
        { name: 'FARMA POPULAR', address: 'RUA GETÚLIO VARGAS, 37 A - CENTRO', phone: '98182-1212' },
        { name: 'DROGARIA MAIS', address: 'AVENIDA DOS ARAÚJOS, 19 – TRIZIDELA', phone: '98148-4338' }
      ],
      29: [
        { name: 'PRECINHO FARMA', address: 'RUA 02, Nº 16 B - ANTIGO CAMPO DE POUSO', phone: '98822-8645' },
        { name: 'DROGARIA SAMUEL', address: 'TRAVESSA CARLOS PEREIRA, 261 – RODOVIÁRIA', phone: '98431-5471' }
      ],
      30: [
        { name: 'DROGARIA HUB SAÚDE', address: 'RUA 04, N° 36 C, VILA SÃO JOÃO', phone: '98425-9341' },
        { name: 'NILTON FARMA', address: 'TRAVESSA DA MANGUEIRA, 219 - CENTRO', phone: '98408-4744' },
        { name: 'FARMA BEM', address: 'RUA JOÃO PAULO II, 21 – VILA COELHO DIAS', phone: '99169-7714' }
      ],
      31: [
        { name: 'FARMÁCIA SÃO LUCAS 2', address: 'RUA GETÚLIO VARGAS, 204 – CENTRO', phone: '98262-3720' },
        { name: 'ULTRA POPULAR', address: 'ESTRADA DA BELA VISTA, 229 – PQ. MANOEL LACERDA', phone: '98408-0691' }
      ]
    };

    const pharmacies = pharmacyData[day];
    if (!pharmacies) {
      return {
        text: 'Desculpe, não encontrei informações de plantão para este dia. Entre em contato com a Secretaria de Saúde: (99) 3621-1234.',
        suggestions: ['Outras datas', 'Contato', 'Unidades']
      };
    }

    let response = `Farmácias de plantão (dia ${day}/07):\n\n`;
    pharmacies.forEach(pharmacy => {
      response += `📍 ${pharmacy.name}\n${pharmacy.address}\n📞 ${pharmacy.phone}\n\n`;
    });
    response += 'Precisa de mais informações?';

    return {
      text: response,
      suggestions: ['Outra data', 'Unidades de saúde', 'Contato']
    };
  };

  const getLocalResponse = async (userInput: string): Promise<{ text: string; suggestions?: string[] }> => {
    const normalizedInput = userInput.toLowerCase();
    
    // Detecta perguntas sobre farmácias de plantão
    if (normalizedInput.includes('farmacia') || normalizedInput.includes('plantao') || normalizedInput.includes('plantão')) {
      const today = new Date();
      const currentDay = today.getDate();
      
      // Se perguntou especificamente por hoje
      if (normalizedInput.includes('hoje')) {
        return getPharmacyDuty(currentDay);
      }
      
      // Se perguntou por um dia específico
      const dayMatch = normalizedInput.match(/dia (\d+)/);
      if (dayMatch) {
        const requestedDay = parseInt(dayMatch[1]);
        if (requestedDay >= 1 && requestedDay <= 31) {
          return getPharmacyDuty(requestedDay);
        }
      }
      
      // Resposta geral sobre farmácias de plantão
      return getPharmacyDuty(currentDay);
    }
    
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
      text: 'Serviços disponíveis:\n\n🗓️ Agendamento de consultas\n📄 Consulta de exames\n✈️ TFD\n📍 Unidades de saúde\n💊 Farmácias de plantão\n\nO que precisa?',
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
          'Farmácias de plantão 💊',
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
