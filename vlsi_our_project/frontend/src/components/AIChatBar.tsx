import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { Send, Plus, Image as ImageIcon, File as FileIcon, Camera, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';
import styles from './AIChatBar.module.css';
interface AIChatBarProps {
  onWaveformUpdate?: (payload: WaveformPayload | null) => void;
}

export interface WaveformPayload {
  waveform_data?: any[];
  signals?: Array<Record<string, unknown>>;
  waveform_url?: string;
  simulation_log?: string;
  simulation_error?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChatBar({ onWaveformUpdate }: AIChatBarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(() => ({ top: 120, left: 120 }));
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  useEffect(() => {
    if (typeof window === 'undefined' || !chatRef.current) return;
    const rect = chatRef.current.getBoundingClientRect();
    setPosition({
      top: clamp(window.innerHeight - rect.height - 24, 16, window.innerHeight - rect.height - 16),
      left: clamp(window.innerWidth - rect.width - 24, 16, window.innerWidth - rect.width - 16),
    });
  }, []);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.style.setProperty('--chat-top', `${position.top}px`);
    chatRef.current.style.setProperty('--chat-left', `${position.left}px`);
  }, [position]);

  useEffect(() => {
    if (isMinimized) {
      setIsMenuOpen(false);
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!chatRef.current) return;
      const rect = chatRef.current.getBoundingClientRect();
      const newLeft = clamp(event.clientX - dragOffsetRef.current.x, 16, window.innerWidth - rect.width - 16);
      const newTop = clamp(event.clientY - dragOffsetRef.current.y, 16, window.innerHeight - rect.height - 16);
      setPosition({ top: newTop, left: newLeft });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('/api/chat', { message: input });
      const text = response.data?.response?.trim() || 'I did not receive a reply from the assistant. Please try again in a moment.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const fallback: Message = {
        id: (Date.now() + 2).toString(),
        text: 'I could not reach the AI service. Check the backend server and API key configuration.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallback]);
    }
  };
  

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMessage: Message = {
      id: `${Date.now()}-upload`,
      text: `Uploaded file: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const {url, analysis, waveform_data, signals, waveform_url, simulation_log, simulation_error} = response.data || {};
      onWaveformUpdate?.({
        waveform_data,
        signals,
        waveform_url,
        simulation_log,
        simulation_error,
      });
      const summary = analysis
        ? analysis
        : url
          ? `I received ${file.name}. You can download it anytime from ${url}`
          : `${file.name} uploaded successfully.`;

      const aiMessage: Message = {
        id: `${Date.now()}-upload-response`,
        text: summary,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error uploading file:', error);
      const aiMessage: Message = {
        id: `${Date.now()}-upload-error`,
        text: `I couldn't upload ${file.name}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      e.target.value = '';
    }
  };

  const handleScreenshot = async () => {
    try {
      // This requires the Web Screen Capture API
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'window' },
        audio: false,
      } as MediaStreamConstraints);
      
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      // Convert bitmap to blob
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            // Handle the screenshot blob
            console.log('Screenshot taken:', blob);
            // You can upload this to your backend
          }
        }, 'image/png');
      }
      
      // Stop all tracks in the stream
      track.stop();
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    if (!chatRef.current) return;
    event.preventDefault();
    const rect = chatRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setIsDragging(true);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const containerClassNames = [
    styles.chatContainer,
    isMinimized ? styles.chatContainerMinimized : '',
    isDragging ? styles.chatContainerDragging : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={chatRef}
      className={containerClassNames}
    >
      <div
        className={styles.chatHeader}
        onPointerDown={handlePointerDown}
      >
        <h3>AI Assistant</h3>
        <div className={styles.headerButtons}>
          <button
            type="button"
            className={styles.headerButton}
            onClick={handleToggleMinimize}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            title={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className={styles.messagesContainer}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messageAI}`}
              >
                <div className={styles.messageBubble}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className={styles.inputField}
                aria-label="Type your message"
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className={styles.sendButton}
                aria-label="Send message"
                title="Send message"
              >
                <Send size={18} />
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={styles.menuButton}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                title="Open menu"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Plus size={20} />
              </button>

              {isMenuOpen && (
                <div className={styles.menu}>
                  <button
                    type="button"
                    onClick={() => {
                      imageInputRef.current?.click();
                      setIsMenuOpen(false);
                    }}
                    className={styles.menuItem}
                  >
                    <ImageIcon size={16} />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsMenuOpen(false);
                    }}
                    className={styles.menuItem}
                  >
                    <FileIcon size={16} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleScreenshot();
                      setIsMenuOpen(false);
                    }}
                    className={styles.menuItem}
                  >
                    <Camera size={16} />
                    <span>Take Screenshot</span>
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className={styles.hiddenInput}
                onChange={handleFileUpload}
                id="file-upload"
                aria-label="Upload file"
              />
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFileUpload}
                id="image-upload"
                aria-label="Upload image"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
