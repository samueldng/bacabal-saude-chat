
import React, { useState } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onVoiceMessage?: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onVoiceMessage, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const startRecording = () => {
    // Preparado para implementação futura
    setIsRecording(true);
    console.log('Gravação de áudio será implementada em breve');
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    console.log('Parando gravação');
  };

  return (
    <div className="flex items-center">
      {isRecording ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-nova-bacabal-green/10 px-3 py-1 rounded-full border border-nova-bacabal-green/20">
            <div className="w-2 h-2 bg-nova-bacabal-green rounded-full animate-pulse mr-2" />
            <span className="text-sm text-nova-bacabal-green font-medium">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="h-10 w-10 text-nova-bacabal-green hover:bg-nova-bacabal-green/10 rounded-full transition-all duration-200"
          >
            <Square className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={startRecording}
          disabled={disabled}
          className="h-10 w-10 text-nova-bacabal-orange hover:bg-gradient-orange hover:text-white disabled:opacity-50 rounded-full transition-all duration-200 shadow-sm hover:shadow-orange"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default VoiceInput;
