
import { User, Bot } from 'lucide-react';
const botIcon = '/lovable-uploads/5717a54e-e75d-4e85-9b28-5833401e8b64.png';
import { Button } from '@/components/ui/button';
import AudioPlayer from './AudioPlayer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'options';
  options?: string[];
  suggestions?: string[];
}

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

const ChatMessage = ({ message, onOptionClick, onSuggestionClick }: ChatMessageProps) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar com gradientes modernos */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
          isBot ? 'bg-white border-2 border-nova-bacabal-orange/20' : 'bg-gradient-orange'
        }`}>
          {isBot ? (
            <img src={botIcon} alt="Bot" className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5 text-white" />
          )}
        </div>
        
        {/* Message Bubble com gradientes e sombras modernas */}
        <div className={`relative rounded-2xl px-4 py-3 max-w-full shadow-lg ${
          isBot 
            ? 'bg-white border border-nova-bacabal-orange/10 rounded-bl-sm shadow-orange' 
            : 'bg-gradient-orange text-white rounded-br-sm shadow-orange-lg'
        }`}>
          {/* Tail moderno */}
          <div className={`absolute bottom-0 w-3 h-4 ${
            isBot 
              ? 'left-0 -ml-2 bg-white border-l border-b border-nova-bacabal-orange/10 rounded-bl-lg'
              : 'right-0 -mr-2 bg-gradient-orange rounded-br-lg'
          }`} style={{
            clipPath: isBot 
              ? 'polygon(0 0, 100% 100%, 0 100%)'
              : 'polygon(0 100%, 100% 0, 100% 100%)'
          }} />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm leading-relaxed whitespace-pre-line flex-1 ${
                isBot ? 'text-gray-800' : 'text-white'
              }`}>
                {message.content}
              </p>
              <AudioPlayer text={message.content} isBot={isBot} />
            </div>
            
            {/* Options com design moderno */}
            {message.type === 'options' && message.options && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-nova-bacabal-orange mb-3 font-medium">Como posso ajudar você?</p>
                {message.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onOptionClick?.(option)}
                    className="w-full justify-start text-left h-auto py-3 px-4 text-gray-700 border-nova-bacabal-orange/20 hover:bg-gradient-orange hover:text-white hover:border-nova-bacabal-orange/40 rounded-xl transition-all duration-200 shadow-sm"
                  >
                    <span className="text-sm">{option}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Suggestions com design moderno */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className={`text-xs mb-2 font-medium ${
                  isBot ? 'text-nova-bacabal-orange' : 'text-white/90'
                }`}>
                  Sugestões:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={`text-xs h-8 px-3 rounded-full transition-all duration-200 shadow-sm ${
                        isBot 
                          ? 'text-nova-bacabal-orange hover:text-white hover:bg-gradient-orange bg-nova-bacabal-orange/10 border border-nova-bacabal-orange/20'
                          : 'text-white hover:bg-white/20 bg-white/10 border border-white/30'
                      }`}
                      onClick={() => onSuggestionClick?.(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isBot ? 'text-gray-500' : 'text-white/80'
            }`}>
              {message.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
