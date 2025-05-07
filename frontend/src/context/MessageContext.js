import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '~/utils/socket';
import { authAPI, messagesApis } from '~/utils/api';
import { toast } from 'react-hot-toast';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      setSocket(socketService.socket);
      setIsConnected(true);

      socketService.socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketService.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      socketService.socket.on('new_message', (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
        // Update conversation's last message
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === message.conversation_id 
              ? { ...conv, last_message: message.content, last_message_at: message.created_at }
              : conv
          )
        );
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = async (conversationId, content) => {
    try {
      const response = await authAPI().post(messagesApis.sendMessage, {
        conversation_id: conversationId,
        message: content
      });

      if (response.data.success) {
        const message = response.data.data;
        return message;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      throw error;
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await authAPI().get(messagesApis.getMessagesByConversationId(conversationId));
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    }
  };

  const fetchConversations = async (userId) => {
    try {
      const response = await authAPI().get(messagesApis.getConversationByUserId(userId));
      if (response.data.success) {
        setConversations(response.data.data);
        console.log("sdf", response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
    }
  };

  const value = {
    socket,
    messages,
    conversations,
    selectedConversation,
    setSelectedConversation,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    fetchMessages,
    fetchConversations
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
