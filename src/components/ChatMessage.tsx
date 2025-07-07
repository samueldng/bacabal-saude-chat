
import { User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`flex items-end space-x-2 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar com cores Nova Bacabal */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isBot ? 'bg-nova-bacabal-purple' : 'bg-nova-bacabal-orange'
        }`}>
          {isBot ? (
            <Bot className="h-4 w-4 text-white" />
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
        </div>
        
        {/* Message Bubble com nova paleta */}
        <div className={`relative rounded-2xl px-4 py-3 shadow-sm max-w-full ${
          isBot 
            ? 'bg-white border border-gray-100 rounded-bl-sm' 
            : 'bg-nova-bacabal-orange text-white rounded-br-sm shadow-md'
        }`}>
          {/* Tail melhorado */}
          <div className={`absolute bottom-0 w-3 h-4 ${
            isBot 
              ? 'left-0 -ml-2 bg-white border-l border-b border-gray-100 rounded-bl-lg'
              : 'right-0 -mr-2 bg-nova-bacabal-orange rounded-br-lg'
          }`} style={{
            clipPath: isBot 
              ? 'polygon(0 0, 100% 100%, 0 100%)'
              : 'polygon(0 100%, 100% 0, 100% 100%)'
          }} />
          
          <div className="relative z-10">
            <p className={`text-sm leading-relaxed whitespace-pre-line ${
              isBot ? 'text-nova-bacabal-purple' : 'text-white'
            }`}>
              {message.content}
            </p>
            
            {/* Options com nova paleta */}
            {message.type === 'options' && message.options && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-nova-bacabal-cyan mb-3 font-medium">Como posso ajudar você?</p>
                {message.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onOptionClick?.(option)}
                    className="w-full justify-start text-left h-auto py-3 px-4 text-nova-bacabal-purple border-nova-bacabal-orange/20 hover:bg-nova-bacabal-orange/5 hover:border-nova-bacabal-orange/40 rounded-lg transition-all duration-200"
                  >
                    <span className="text-sm">{option}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Suggestions com nova paleta */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className={`text-xs mb-2 font-medium ${
                  isBot ? 'text-nova-bacabal-cyan' : 'text-white/80'
                }`}>
                  Sugestões:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={`text-xs h-8 px-3 rounded-full transition-all duration-200 ${
                        isBot 
                          ? 'text-nova-bacabal-orange hover:text-nova-bacabal-orange hover:bg-nova-bacabal-orange/10 bg-nova-bacabal-orange/5'
                          : 'text-white hover:bg-white/20 bg-white/10 border border-white/20'
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
              isBot ? 'text-muted-foreground' : 'text-white/70'
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
