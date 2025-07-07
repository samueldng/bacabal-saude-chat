
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ArrowLeft, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import { useChatContext } from '../contexts/ChatContext';

const ChatInterface = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const { messages, isLoading, apiKey, setApiKey, sendMessage, clearChat } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || inputValue;
    if (!messageToSend.trim()) return;

    await sendMessage(messageToSend);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setShowSettings(false);
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
              <p className="text-xs text-blue-100">
                {apiKey ? 'IA Conectada' : 'Modo Local'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-blue-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Chave da API Gemini (opcional):
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Cole sua API key do Google Gemini aqui"
                    className="pr-10 bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveApiKey} className="flex-1">
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={clearChat}>
                  Limpar Chat
                </Button>
              </div>
              {!apiKey && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  O chat funciona sem API key, mas com a chave do Gemini as respostas serão mais inteligentes
                </p>
              )}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onOptionClick={handleSendMessage}
                onSuggestionClick={handleSendMessage}
              />
            ))}
            {isLoading && (
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

        <QuickActions onActionClick={handleSendMessage} />

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
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
