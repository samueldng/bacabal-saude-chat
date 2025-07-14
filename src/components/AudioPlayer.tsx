import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/contexts/ChatContext';

interface AudioPlayerProps {
  text: string;
  isBot?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isBot = false }) => {
  const { playAudioResponse } = useChatContext();

  const handlePlayAudio = async () => {
    await playAudioResponse(text);
  };

  // Só mostrar o botão para mensagens do bot
  if (!isBot) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePlayAudio}
      className="ml-2 h-6 w-6 p-0 text-muted-foreground hover:text-primary transition-colors"
      title="Ouvir resposta"
    >
      <Volume2 className="h-3 w-3" />
    </Button>
  );
};

export default AudioPlayer;