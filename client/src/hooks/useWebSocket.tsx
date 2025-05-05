import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

interface UseWebSocketProps {
  onMessage?: (data: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws-animation`; // Match the path in server/routes.ts
    
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      if (onOpen) onOpen();
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError(event);
      if (onError) onError(event);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      if (onClose) onClose();
    };
    
    // Clean up WebSocket on component unmount
    return () => {
      ws.close();
    };
  }, [onMessage, onOpen, onClose, onError]);
  
  // Send message function
  const sendMessage = useCallback((data: any) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);
  
  // Reconnect function
  const reconnect = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws-animation`; // Match the path in server/routes.ts
    
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connection re-established');
      setIsConnected(true);
      if (onOpen) onOpen();
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError(event);
      if (onError) onError(event);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      if (onClose) onClose();
    };
  }, [onMessage, onOpen, onClose, onError]);
  
  return {
    isConnected,
    error,
    sendMessage,
    reconnect,
  };
};
