
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowLeft, Settings, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import VoiceInput from './VoiceInput';
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
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header similar ao WhatsApp */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shadow-md">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToWelcome}
            className="text-white hover:bg-blue-700 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">SEMUS Bacabal</h3>
              <p className="text-xs text-blue-100">
                {apiKey ? 'IA Conectada • Online' : 'Modo Local • Online'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-blue-700 p-2"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b bg-blue-50 shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chave da API Gemini (opcional):
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Cole sua API key do Google Gemini aqui"
                    className="pr-10 bg-white border-gray-200"
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
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveApiKey} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Salvar Configurações
              </Button>
              <Button size="sm" variant="outline" onClick={clearChat} className="border-gray-300">
                Limpar Chat
              </Button>
            </div>
            {!apiKey && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 O chat funciona sem API key, mas com a chave do Gemini as respostas serão mais inteligentes
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 relative">
        {/* Background pattern similar ao WhatsApp */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <ScrollArea className="h-full">
          <div className="px-4 py-6 space-y-4 relative z-10">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onOptionClick={handleSendMessage}
                onSuggestionClick={handleSendMessage}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Digitando</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-white border-t border-gray-200">
        <QuickActions onActionClick={handleSendMessage} />
      </div>

      {/* Input Area similar ao WhatsApp */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma mensagem"
                disabled={isLoading}
                className="flex-1 border-none bg-transparent focus:ring-0 focus:border-none text-gray-700 placeholder-gray-500"
              />
              {!inputValue.trim() && (
                <VoiceInput disabled={isLoading} />
              )}
            </div>
          </div>
          
          {inputValue.trim() && (
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-full shadow-lg flex-shrink-0"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          🚨 Em caso de emergência, ligue 192 (SAMU) ou procure a unidade mais próxima
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
