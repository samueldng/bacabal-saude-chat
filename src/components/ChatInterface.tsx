
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import { chatService } from '../services/chatService';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'options' | 'form';
  options?: string[];
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente digital da SEMUS Bacabal. Como posso ajudá-lo hoje?',
      sender: 'bot',
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
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(async () => {
      const botResponse = await chatService.getResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        type: botResponse.type || 'text',
        options: botResponse.options
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleBackToWelcome = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToWelcome}
              className="text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Bot className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Assistente SEMUS</h3>
              <p className="text-xs text-blue-100">Online agora</p>
            </div>
          </div>
          <div className="text-xs text-blue-100">
            Atendimento Digital
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onOptionClick={handleQuickAction}
              />
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Bot className="h-4 w-4" />
                <span className="text-sm">Assistente está digitando...</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <QuickActions onActionClick={handleQuickAction} />

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Em caso de emergência, ligue 192 (SAMU) ou procure a unidade mais próxima
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
