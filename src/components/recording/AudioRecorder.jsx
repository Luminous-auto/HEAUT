import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Trash2 } from 'lucide-react';

const translations = {
  en: {
    yourRecording: 'Your Recording',
    recordAgain: 'Record Again',
    clickToStop: 'Click to stop recording',
    clickToStart: 'Click to start recording'
  },
  zh: {
    yourRecording: '您的录音',
    recordAgain: '重新录制',
    clickToStop: '点击停止录音',
    clickToStart: '点击开始录音'
  }
};

export default function AudioRecorder({ onRecordingComplete, disabled, currentLanguage = 'en' }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    const t = translations[currentLanguage];

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check your browser permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };
    
    const resetRecording = () => {
        setAudioURL('');
        setDuration(0);
        onRecordingComplete(null);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (audioURL) {
        return (
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <h3 className="font-semibold text-stone-800">{t.yourRecording}</h3>
                <audio ref={audioRef} src={audioURL} controls className="w-full" />
                <Button variant="outline" onClick={resetRecording} disabled={disabled}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t.recordAgain}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors
                    ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-stone-900 hover:bg-stone-800'}
                    disabled:bg-stone-300`}
            >
                {isRecording ? (
                    <MicOff className="w-10 h-10 text-white" />
                ) : (
                    <Mic className="w-10 h-10 text-white" />
                )}
            </button>
            <div className="text-2xl font-mono text-stone-700 w-24 text-center">
                {formatTime(duration)}
            </div>
            <p className="text-stone-600">
                {isRecording ? t.clickToStop : t.clickToStart}
            </p>
        </div>
    );
}