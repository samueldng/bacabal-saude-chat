
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
    <div className="flex flex-col h-screen max-h-screen bg-chat-surface">
      {/* Header com as cores da Nova Bacabal */}
      <div className="flex items-center justify-between px-4 py-3 bg-nova-bacabal-purple text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToWelcome}
            className="text-white hover:bg-white/20 p-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nova-bacabal-orange rounded-full flex items-center justify-center shadow-md">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nova Bacabal</h3>
              <p className="text-xs text-white/80">
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
            className="text-white hover:bg-white/20 p-2 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings Panel com nova paleta */}
      {showSettings && (
        <div className="p-4 border-b bg-gradient-to-r from-nova-bacabal-cyan/5 to-nova-bacabal-purple/5 shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-nova-bacabal-purple mb-2 block">
                Chave da API Gemini (opcional):
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Cole sua API key do Google Gemini aqui"
                    className="pr-10 bg-white border-gray-200 focus:border-nova-bacabal-orange focus:ring-nova-bacabal-orange/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-nova-bacabal-purple"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveApiKey} className="flex-1 bg-nova-bacabal-orange hover:bg-nova-bacabal-orange/90">
                Salvar Configurações
              </Button>
              <Button size="sm" variant="outline" onClick={clearChat} className="border-nova-bacabal-purple/20 text-nova-bacabal-purple hover:bg-nova-bacabal-purple/5">
                Limpar Chat
              </Button>
            </div>
            {!apiKey && (
              <div className="bg-nova-bacabal-cyan/10 border border-nova-bacabal-cyan/20 rounded-lg p-3">
                <p className="text-xs text-nova-bacabal-purple">
                  💡 O chat funciona sem API key, mas com a chave do Gemini as respostas serão mais inteligentes
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area com fundo personalizado */}
      <div className="flex-1 overflow-hidden bg-chat-surface relative">
        {/* Background pattern sutil */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234527A0' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15-15zm15 0c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
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
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs border">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Bot className="h-4 w-4 text-nova-bacabal-purple" />
                    <span className="text-sm">Digitando</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-nova-bacabal-orange rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-nova-bacabal-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-nova-bacabal-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Quick Actions com novas cores */}
      <div className="px-4 py-2 bg-white border-t border-gray-200">
        <QuickActions onActionClick={handleSendMessage} />
      </div>

      {/* Input Area com nova paleta */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-nova-bacabal-orange transition-colors">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma mensagem"
                disabled={isLoading}
                className="flex-1 border-none bg-transparent focus:ring-0 focus:border-none text-foreground placeholder-muted-foreground"
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
              className="bg-nova-bacabal-orange hover:bg-nova-bacabal-orange/90 h-12 w-12 rounded-full shadow-lg flex-shrink-0 transition-all duration-200 hover:shadow-xl"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          🚨 Em caso de emergência, ligue 192 (SAMU) ou procure a unidade mais próxima
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
