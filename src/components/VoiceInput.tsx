
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onVoiceMessage?: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onVoiceMessage, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Verificar formatos suportados e usar o melhor disponível
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Deixar o navegador escolher
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const finalMimeType = mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        
        console.log('Áudio capturado:', {
          size: audioBlob.size,
          type: audioBlob.type,
          duration: recordingTime
        });
        
        if (onVoiceMessage && audioBlob.size > 0) {
          onVoiceMessage(audioBlob);
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Gravação iniciada",
        description: "Fale agora, sua mensagem está sendo gravada."
      });
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast({
        title: "Erro no microfone",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Gravação finalizada",
        description: "Processando sua mensagem de áudio..."
      });
    }
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
