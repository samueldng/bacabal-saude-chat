import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowLeft, Settings, Eye, EyeOff, MoreVertical, ChevronDown } from 'lucide-react';
const botIcon = '/lovable-uploads/5717a54e-e75d-4e85-9b28-5833401e8b64.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import VoiceInput from './VoiceInput';
import { useChatContext } from '../contexts/ChatContext';

const ChatInterface = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiConfig, setTempApiConfig] = useState<{ provider: 'gemini' | 'openai' | 'claude'; key: string }>({ provider: 'gemini', key: '' });
  const { messages, isLoading, apiConfig, setApiConfig, sendMessage, clearChat } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempApiConfig(apiConfig);
  }, [apiConfig]);

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

  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove data:audio/webm;base64, prefix
        
        // Send audio data directly to AI
        const audioPrompt = "Transcreva e responda a esta mensagem de áudio sobre os serviços de saúde de Bacabal.";
        await sendMessage(audioPrompt, {
          mimeType: 'audio/webm',
          data: base64Data
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      toast({
        title: "Erro no áudio",
        description: "Não foi possível processar sua mensagem de áudio.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveApiConfig = () => {
    console.log('Salvando config:', tempApiConfig);
    setApiConfig(tempApiConfig);
    setShowSettings(false);
  };

  const handleBackToWelcome = () => {
    window.location.reload();
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'gemini': return 'Google Gemini';
      case 'openai': return 'OpenAI ChatGPT';
      case 'claude': return 'Anthropic Claude';
      default: return provider;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-chat-surface">
      {/* Header com gradiente laranja moderno */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-orange text-white shadow-orange-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToWelcome}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/30">
              <img src={botIcon} alt="Bot" className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nova Bacabal</h3>
              <p className="text-xs text-white/90">
                {apiConfig.key ? `${getProviderName(apiConfig.provider)} • Online` : 'Modo Local • Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings Panel com gradiente sutil */}
      {showSettings && (
        <div className="p-4 border-b bg-gradient-orange-subtle shadow-sm backdrop-blur-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-nova-bacabal-orange block">
                Configuração de IA (opcional):
              </label>
              
              {/* Seletor de Provedor */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Provedor de IA:
                </label>
                <Select
                  value={tempApiConfig.provider}
                  onValueChange={(value: 'gemini' | 'openai' | 'claude') => 
                    setTempApiConfig(prev => ({ ...prev, provider: value }))
                  }
                >
                  <SelectTrigger className="bg-white border-nova-bacabal-orange/20 focus:border-nova-bacabal-orange rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">🔵 Google Gemini</SelectItem>
                    <SelectItem value="openai">🟢 OpenAI ChatGPT</SelectItem>
                    <SelectItem value="claude">🟣 Anthropic Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo de API Key */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Chave da API {getProviderName(tempApiConfig.provider)}:
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={tempApiConfig.key}
                    onChange={(e) => setTempApiConfig(prev => ({ ...prev, key: e.target.value }))}
                    placeholder={`Cole sua API key do ${getProviderName(tempApiConfig.provider)} aqui`}
                    className="pr-10 bg-white border-nova-bacabal-orange/20 focus:border-nova-bacabal-orange focus:ring-nova-bacabal-orange/20 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-nova-bacabal-orange"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveApiConfig} className="flex-1 bg-gradient-orange hover:bg-gradient-orange-dark shadow-orange rounded-xl">
                Salvar Configurações
              </Button>
              <Button size="sm" variant="outline" onClick={clearChat} className="border-nova-bacabal-orange/30 text-nova-bacabal-orange hover:bg-nova-bacabal-orange/5 rounded-xl">
                Limpar Chat
              </Button>
            </div>
            
            {!apiConfig.key && (
              <div className="bg-nova-bacabal-orange/10 border border-nova-bacabal-orange/30 rounded-xl p-3">
                <p className="text-xs text-nova-bacabal-orange">
                  💡 O chat funciona sem API key, mas com uma chave de IA as respostas serão mais inteligentes
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area com fundo gradiente sutil */}
      <div className="flex-1 overflow-hidden bg-chat-surface relative">
        {/* Background pattern sutil */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FF8C00' fill-opacity='0.05'%3E%3Cpath d='M40 40c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm20 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <ScrollArea className="h-full">
          <div className="px-4 py-6 space-y-4 relative z-10">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={{
                  id: message.id,
                  role: message.isUser ? 'user' : 'assistant',
                  content: message.text,
                  timestamp: new Date(message.timestamp),
                  suggestions: message.suggestions
                }}
                onOptionClick={handleSendMessage}
                onSuggestionClick={handleSendMessage}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-4 shadow-orange max-w-xs border border-nova-bacabal-orange/10">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <img src={botIcon} alt="Bot" className="h-4 w-4" />
                    <span className="text-sm">Digitando</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-nova-bacabal-orange rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-nova-bacabal-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-nova-bacabal-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Quick Actions com design moderno */}
      <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border-t border-nova-bacabal-orange/10">
        <QuickActions onActionClick={handleSendMessage} />
      </div>

      {/* Input Area com gradiente e sombra moderna */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-nova-bacabal-orange/10">
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="flex items-center bg-white rounded-full px-5 py-3 border-2 border-nova-bacabal-orange/20 focus-within:border-nova-bacabal-orange shadow-orange transition-all duration-200">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma mensagem"
                disabled={isLoading}
                className="flex-1 border-none bg-transparent focus:ring-0 focus:border-none text-foreground placeholder-muted-foreground"
              />
              {!inputValue.trim() && (
                <VoiceInput disabled={isLoading} onVoiceMessage={handleVoiceMessage} />
              )}
            </div>
          </div>
          
          {inputValue.trim() && (
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-orange hover:bg-gradient-orange-dark h-12 w-12 rounded-full shadow-orange-lg flex-shrink-0 transition-all duration-200 hover:shadow-xl hover:scale-105"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          🚨 Em caso de emergência, ligue 192 (SAMU) ou procure a unidade mais próxima
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;