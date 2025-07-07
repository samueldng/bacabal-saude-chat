
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
          <div className="flex items-center bg-red-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
            <span className="text-sm text-red-600 font-medium">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="h-10 w-10 text-red-500 hover:bg-red-50"
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
          className="h-10 w-10 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default VoiceInput;
