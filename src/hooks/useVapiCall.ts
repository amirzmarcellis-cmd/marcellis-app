import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface UseVapiCallReturn {
  status: 'idle' | 'connecting' | 'connected' | 'ended';
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  duration: number;
  error: string | null;
  startCall: (assistantId: string, variableValues?: Record<string, string>) => Promise<void>;
  endCall: () => void;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

export function useVapiCall(): UseVapiCallReturn {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const vapiRef = useRef<Vapi | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize VAPI instance
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      console.error('VAPI_PUBLIC_KEY is not configured');
      return;
    }
    
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    // Set up event listeners
    vapi.on('call-start', () => {
      console.log('VAPI: Call started');
      setStatus('connected');
      setError(null);
    });

    vapi.on('call-end', () => {
      console.log('VAPI: Call ended');
      setStatus('ended');
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    });

    vapi.on('speech-start', () => {
      console.log('VAPI: Assistant speaking');
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('VAPI: Assistant stopped speaking');
      setIsSpeaking(false);
    });

    vapi.on('error', (e: Error) => {
      console.error('VAPI Error:', e);
      setError(e.message || 'An error occurred during the call');
      setStatus('ended');
    });

    vapi.on('message', (message: unknown) => {
      console.log('VAPI Message:', message);
    });

    // Cleanup on unmount
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (status === 'connected') {
      setDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [status]);

  const startCall = useCallback(async (assistantId: string, variableValues?: Record<string, string>) => {
    if (!vapiRef.current) {
      setError('VAPI is not initialized. Please check your API key configuration.');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);
      setDuration(0);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the call with assistant ID and variable overrides
      await vapiRef.current.start(assistantId, {
        variableValues,
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
          setError('Microphone access is required for the voice interview. Please enable it in your browser settings.');
        } else if (err.message.includes('network') || err.message.includes('connection')) {
          setError('Unable to connect. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      setStatus('idle');
    }
  }, []);

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setStatus('ended');
    setIsSpeaking(false);
    setIsUserSpeaking(false);
  }, []);

  return {
    status,
    isSpeaking,
    isUserSpeaking,
    duration,
    error,
    startCall,
    endCall,
  };
}
