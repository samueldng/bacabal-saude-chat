
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
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isBot ? 'bg-blue-600' : 'bg-green-600'
        }`}>
          {isBot ? (
            <Bot className="h-4 w-4 text-white" />
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`relative rounded-2xl px-4 py-3 shadow-sm max-w-full ${
          isBot 
            ? 'bg-white border border-gray-200 rounded-bl-sm' 
            : 'bg-blue-600 text-white rounded-br-sm'
        }`}>
          {/* Tail for WhatsApp-like appearance */}
          <div className={`absolute bottom-0 w-3 h-4 ${
            isBot 
              ? 'left-0 -ml-2 bg-white border-l border-b border-gray-200 rounded-bl-lg'
              : 'right-0 -mr-2 bg-blue-600 rounded-br-lg'
          }`} style={{
            clipPath: isBot 
              ? 'polygon(0 0, 100% 100%, 0 100%)'
              : 'polygon(0 100%, 100% 0, 100% 100%)'
          }} />
          
          <div className="relative z-10">
            <p className={`text-sm leading-relaxed whitespace-pre-line ${
              isBot ? 'text-gray-800' : 'text-white'
            }`}>
              {message.content}
            </p>
            
            {/* Options for initial message */}
            {message.type === 'options' && message.options && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-600 mb-3 font-medium">Como posso ajudar você?</p>
                {message.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onOptionClick?.(option)}
                    className="w-full justify-start text-left h-auto py-3 px-4 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    <span className="text-sm">{option}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className={`text-xs mb-2 font-medium ${
                  isBot ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  Sugestões:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={`text-xs h-8 px-3 rounded-full transition-colors ${
                        isBot 
                          ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 bg-blue-50/70'
                          : 'text-white hover:bg-white/20 bg-white/10'
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
              isBot ? 'text-gray-500' : 'text-blue-100'
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
