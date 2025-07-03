
interface BotResponse {
  text: string;
  type?: 'text' | 'options' | 'form';
  options?: string[];
}

class ChatService {
  private responses: Record<string, BotResponse> = {
    // Agendamento
    'agendar consulta': {
      text: 'Para agendar uma consulta, você pode:\n\n• Ligar para (99) 3621-1234\n• Comparecer à UBS mais próxima\n• Usar o aplicativo ConecteSUS\n\nPrecisa do endereço de alguma unidade?',
      type: 'options',
      options: ['Ver unidades próximas', 'Documentos necessários', 'Horários de funcionamento']
    },
    
    // Exames
    'consultar exames': {
      text: 'Para consultar seus exames, você precisa:\n\n• CPF e cartão SUS\n• Número do protocolo (se tiver)\n\nOs resultados ficam disponíveis em até 15 dias úteis. Posso ajudar com mais alguma coisa?',
      type: 'options',
      options: ['Onde retirar exames', 'Prazo dos resultados', 'Documentos necessários']
    },
    
    // Programas de saúde
    'informações sobre programas': {
      text: 'A SEMUS Bacabal oferece diversos programas:\n\n• Programa Saúde da Família (PSF)\n• Programa de Imunização\n• Programa Hiperdia\n• Programa Saúde da Mulher\n• Programa Saúde Mental\n\nSobre qual programa você gostaria de saber mais?',
      type: 'options',
      options: ['Saúde da Família', 'Vacinação', 'Hiperdia', 'Saúde da Mulher']
    },
    
    // Unidades de saúde
    'unidades de saúde': {
      text: 'Bacabal possui as seguintes unidades de saúde:\n\n• UBS Centro - Rua Principal, 123\n• UBS Bacabinha - Av. das Flores, 456\n• UBS Vila Nova - Rua Santos, 789\n• Hospital Municipal - Av. Central, 321\n\nTodas funcionam de segunda a sexta, das 7h às 17h.',
      type: 'options',
      options: ['Ver no mapa', 'Horários especiais', 'Especialidades disponíveis']
    },
    
    // Atendente humano
    'falar com atendente': {
      text: 'Entendo que você precisa de um atendimento mais personalizado. Você pode:\n\n• Ligar para (99) 3621-1234\n• Ir pessoalmente à Secretaria de Saúde\n• Enviar WhatsApp para (99) 9 9999-9999\n\nO atendimento presencial é de segunda a sexta, das 7h às 13h.',
      type: 'text'
    }
  };

  async getResponse(userInput: string): Promise<BotResponse> {
    const normalizedInput = userInput.toLowerCase();
    
    // Busca por palavras-chave
    for (const [key, response] of Object.entries(this.responses)) {
      if (normalizedInput.includes(key) || this.containsKeywords(normalizedInput, key)) {
        return response;
      }
    }
    
    // Resposta padrão
    return {
      text: 'Desculpe, não entendi sua pergunta. Posso ajudar com:\n\n• Agendamento de consultas\n• Consulta de exames\n• Informações sobre programas de saúde\n• Localização de unidades\n• Contato com atendente\n\nPor favor, escolha uma das opções acima ou reformule sua pergunta.',
      type: 'options',
      options: [
        'Agendar consulta',
        'Consultar exames', 
        'Programas de saúde',
        'Unidades de saúde',
        'Falar com atendente'
      ]
    };
  }
  
  private containsKeywords(input: string, category: string): boolean {
    const keywords: Record<string, string[]> = {
      'agendar consulta': ['agendar', 'marcar', 'consulta', 'médico', 'appointment'],
      'consultar exames': ['exame', 'resultado', 'laboratorio', 'sangue', 'urina'],
      'informações sobre programas': ['programa', 'psf', 'saude da familia', 'vacinacao', 'hiperdia'],
      'unidades de saúde': ['unidade', 'ubs', 'hospital', 'posto', 'endereço', 'localizar'],
      'falar com atendente': ['atendente', 'humano', 'pessoa', 'funcionario', 'telefone']
    };
    
    const categoryKeywords = keywords[category] || [];
    return categoryKeywords.some(keyword => input.includes(keyword));
  }
}

export const chatService = new ChatService();
