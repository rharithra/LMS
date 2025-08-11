import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Create socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      // Authentication
      newSocket.on('connect', () => {
        console.log('🔌 Connected to server');
        newSocket.emit('authenticate', token);
      });

      newSocket.on('authenticated', (data) => {
        console.log('🔐 Socket authenticated:', data);
        setConnected(true);
      });

      newSocket.on('authentication-error', (error) => {
        console.error('🔐 Socket authentication failed:', error);
        setConnected(false);
      });

      // Handle real-time notifications
      newSocket.on('notification', (notification) => {
        console.log('📧 New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.success(notification.message, {
          duration: 5000,
          icon: '📧',
          position: 'top-right'
        });
      });

      // Handle unread notifications on connect
      newSocket.on('unread-notifications', (unreadNotifications) => {
        console.log('📬 Received unread notifications:', unreadNotifications.length);
        setNotifications(unreadNotifications);
        setUnreadCount(unreadNotifications.length);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const markNotificationAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark-notification-read', notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 