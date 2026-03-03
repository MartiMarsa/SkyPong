'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/auth-context';

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
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/chat/ws`;
  }, []);

  useEffect(() => {
    if (authloading || !user || !wsUrl) return;

    let active = true;

    const connect = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!active) return;
        setConnected(true);
      };

      socket.onclose = () => {
        if (!active) return;
        setConnected(false);
        reconnectRef.current = window.setTimeout(connect, 2000);
      };

      socket.onerror = () => {
        socket.close();
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
      setConnected(false);
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
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
    <section style={{ position: 'fixed', right: 16, bottom: 16, width: 320, background: '#111827', color: '#ffffff', borderRadius: 8, border: '1px solid #374151', padding: 12, zIndex: 30 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Global chat {connected ? '●' : '○'}</div>
      <div style={{ height: 220, overflowY: 'auto', border: '1px solid #374151', borderRadius: 6, padding: 8, marginBottom: 8, background: '#0f172a' }}>
        {messages.map((message, index) => (
          <div key={`${message.timestamp || 'no-ts'}-${index}`} style={{ marginBottom: 6, wordBreak: 'break-word' }}>
            <strong>{message.sender}: </strong>
            <span>{message.text}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage();
          }}
          placeholder="Type message"
          style={{ flex: 1, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#fff', padding: '8px 10px' }}
        />
        <button onClick={sendMessage} type="button" style={{ borderRadius: 6, border: '1px solid #374151', background: '#2563eb', color: '#fff', padding: '8px 10px' }}>
          Send
        </button>
      </div>
    </section>
  );
}
