import { io, Socket } from 'socket.io-client';

export let socket: Socket | undefined;

const VITE_BASE_ENDPOINT = 'http://jobberemre.com';
const SOCKET_TOKEN_KEY = 'socketToken';

const getToken = (): string | null => window.sessionStorage.getItem(SOCKET_TOKEN_KEY);

let isConnecting = false;

class SocketService {
  setupSocketConnection = (): void => {
    const token = getToken();
    if (!token) {
      console.log('[Socket] No token, skipping connection');
      return;
    }
    if (socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }
    if (isConnecting) {
      console.log('[Socket] Connection in progress, skipping');
      return;
    }
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    isConnecting = true;
    console.log('[Socket] Connecting...');
    socket = io(VITE_BASE_ENDPOINT, {
      transports: ['websocket'],
      secure: true,
      withCredentials: true,
      auth: { token }
    });
    this.socketConnectionEvents(socket);
  };

  disconnect = (): void => {
    isConnecting = false;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
  };

  socketConnectionEvents(s: Socket) {
    s.on('connect', () => {
      isConnecting = false;
      console.log('[Socket] Connected to socket server');
    });

    s.on('disconnect', (reason: Socket.DisconnectReason) => {
      isConnecting = false;
      console.log('[Socket] Disconnected:', reason);
      if (getToken()) {
        s.connect();
      }
    });

    s.on('connect_error', (error: Error) => {
      isConnecting = false;
      console.log('[Socket] Connection error:', error.message);
      if (getToken()) {
        s.connect();
      }
    });
  }
}

export const socketService = new SocketService();
