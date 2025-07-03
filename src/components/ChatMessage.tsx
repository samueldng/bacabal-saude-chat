
import { User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Message } from './ChatInterface';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
}

const ChatMessage = ({ message, onOptionClick }: ChatMessageProps) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-blue-600' : 'bg-green-600'
        }`}>
          {isBot ? (
            <Bot className="h-4 w-4 text-white" />
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
        </div>
        
        <Card className={`p-3 ${
          isBot 
            ? 'bg-white border-gray-200' 
            : 'bg-blue-600 text-white border-blue-600'
        }`}>
          <p className="text-sm">{message.text}</p>
          
          {message.type === 'options' && message.options && (
            <div className="mt-3 space-y-2">
              {message.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onOptionClick?.(option)}
                  className="w-full justify-start text-left h-auto py-2 px-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          
          <div className={`text-xs mt-2 ${
            isBot ? 'text-gray-500' : 'text-blue-100'
          }`}>
            {message.timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatMessage;
