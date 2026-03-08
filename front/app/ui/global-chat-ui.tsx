'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from '../hooks/use-translation';

type ChatMessage = {
  sender: string;
  text: string;
  timestamp?: string;
};

export default function GlobalChatUI() {
  const { user, authloading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const intentionalCloseRef = useRef<boolean>(false);
  const { t } = useTranslation();

  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/chat/ws`;
  }, []);

  useEffect(() => {
    if (authloading || !user || !wsUrl) return;

    let active = true;

    const connect = () => {
      intentionalCloseRef.current = false;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!active) return;
        setConnected(true);
      };

      socket.onclose = (event) => {
        if (!active) return;
        setConnected(false);
        
        // Only reconnect if close wasn't intentional and code indicates we should retry
        const shouldReconnect = !intentionalCloseRef.current && 
                                event.code !== 1000 && 
                                event.code !== 1001;
        
        if (shouldReconnect) {
          reconnectRef.current = window.setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        // Mark as intentional close to prevent reconnection
        if (!active) {
          intentionalCloseRef.current = true;
        }
        // Close with proper code to avoid browser error messages
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close(1000, 'Connection error');
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as ChatMessage;
          if (!data?.sender || !data?.text) return;
          setMessages((prev) => [...prev, data]);
        } catch {
          return;
        }
      };
    };

    connect();

    return () => {
      active = false;
      intentionalCloseRef.current = true;
      setConnected(false);
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }
      // Close with proper code for normal closure
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN || 
            socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close(1000, 'Component unmounting');
        }
        socketRef.current = null;
      }
      setMessages([]);
    };
  }, [authloading, user, wsUrl]);

  if (authloading || !user) {
    return null;
  }

  const sendMessage = () => {
    const value = text.trim();
    if (!value || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(JSON.stringify({ text: value }));
    setText('');
  };

  return (
    <section style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 30 }}>
      {isMinimized ? (
        <button className='chat-button'
          onClick={() => setIsMinimized(false)}
          type="button"
          style={{
            borderRadius: 999,
            fontWeight: 700,
            padding: '10px 16px',
            cursor: 'pointer',
          }}
          aria-label="Open global chat"
        >
        <FontAwesomeIcon icon={faCommentDots} />  Chat
        </button>
      ) : (
        <div className='chat-window' style={{ width: 'min(320px, calc(100vw - 32px))', borderRadius: 8, padding: 12, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, marginBottom: 8 }}>
            <span><FontAwesomeIcon icon={faCommentDots} /> Global chat {connected ? '●' : '○'}</span>
            <button
            className='chat-minimize rounded-full'
              onClick={() => setIsMinimized(true)}
              type="button"
              aria-label="Minimize global chat"
              style={{ padding: '2px 8px', cursor: 'pointer' }}
            >
              −
            </button>
          </div>
          <div className='chat-box' style={{ height: 220, overflowY: 'auto', borderRadius: 6, padding: 8, marginBottom: 8}}>
            {messages.map((message, index) => (
              <div key={`${message.timestamp || 'no-ts'}-${index}`} style={{ marginBottom: 6, wordBreak: 'break-word' }}>
                <strong>{message.sender}: </strong>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
            className='chat-input'
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage();
              }}
              placeholder="Type message"
              style={{ flex: 1, borderRadius: 6, padding: '8px 10px' }}
            />
            <button className='chat-sendbtn rounded-6' onClick={sendMessage} type="button" style={{ borderRadius: 6, padding: '8px 10px' }}>
              {t?.form?.submit || 'Send'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
