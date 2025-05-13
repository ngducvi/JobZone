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
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

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
        
        // Cập nhật conversation's last message và số tin nhắn chưa đọc
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => {
            if (conv.id === message.conversation_id) {
              // Cập nhật tin nhắn cuối cùng
              const updatedConv = { 
                ...conv, 
                last_message: message.content, 
                last_message_at: message.created_at 
              };
              
              // Tăng số tin nhắn chưa đọc nếu người gửi không phải người dùng hiện tại
              const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
              if (currentUserId && message.sender_id !== currentUserId) {
                if (conv.user1_id == currentUserId) {
                  updatedConv.unread_count_user1 = (conv.unread_count_user1 || 0) + 1;
                } else if (conv.user2_id == currentUserId) {
                  updatedConv.unread_count_user2 = (conv.unread_count_user2 || 0) + 1;
                }
              }
              
              return updatedConv;
            }
            return conv;
          });
          
          // Tính lại tổng số tin nhắn chưa đọc
          const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
          if (currentUserId) {
            let total = 0;
            updatedConversations.forEach(conv => {
              if (conv.user1_id == currentUserId) {
                total += conv.unread_count_user1 || 0;
              } else if (conv.user2_id == currentUserId) {
                total += conv.unread_count_user2 || 0;
              }
            });
            setTotalUnreadMessages(total);
          }
          
          return updatedConversations;
        });
      });

      // Add message_updated event handler
      socketService.socket.on('message_updated', (updatedMessage) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      // Add message_deleted event handler
      socketService.socket.on('message_deleted', (deletedMessageId) => {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== deletedMessageId)
        );
      });
      
      // Add messages_marked_read event handler
      socketService.socket.on('messages_marked_read', (data) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.conversation_id === data.conversation_id && msg.sender_id !== data.reader_id
              ? { ...msg, is_read: true }
              : msg
          )
        );
      });
      
      // Add unread_count_reset event handler
      socketService.socket.on('unread_count_reset', (data) => {
        setConversations(prevConversations => {
          const newConversations = prevConversations.map(conv => {
            if (conv.id === data.conversation_id) {
              if (conv.user1_id == data.user_id) {
                return { ...conv, unread_count_user1: 0 };
              } else if (conv.user2_id == data.user_id) {
                return { ...conv, unread_count_user2: 0 };
              }
            }
            return conv;
          });
          
          // Tính lại tổng số tin nhắn chưa đọc
          const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
          if (currentUserId) {
            let total = 0;
            newConversations.forEach(conv => {
              if (conv.user1_id == currentUserId) {
                total += conv.unread_count_user1;
              } else if (conv.user2_id == currentUserId) {
                total += conv.unread_count_user2;
              }
            });
            setTotalUnreadMessages(total);
          }
          
          return newConversations;
        });
      });

      return () => {
        socketService.disconnect();
        socketService.socket.off('message_updated');
        socketService.socket.off('message_deleted');
        socketService.socket.off('messages_marked_read');
        socketService.socket.off('unread_count_reset');
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
        
        // Tính tổng số tin nhắn chưa đọc
        let total = 0;
        response.data.data.forEach(conv => {
          if (conv.user1_id == userId) {
            total += conv.unread_count_user1;
          } else if (conv.user2_id == userId) {
            total += conv.unread_count_user2;
          }
        });
        setTotalUnreadMessages(total);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
    }
  };

  const markMessagesAsRead = async (conversationId, userId) => {
    try {
      const response = await authAPI().put(messagesApis.markMessagesAsRead, {
        conversation_id: conversationId,
        user_id: userId
      });
      return response.data.success;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast.error('Failed to mark messages as read');
      return false;
    }
  };

  const resetUnreadCount = async (conversationId, userId) => {
    try {
      const response = await authAPI().put(messagesApis.resetUnreadCount, {
        conversation_id: conversationId,
        user_id: userId
      });
      
      if (response.data.success) {
        // Giảm tổng số tin nhắn chưa đọc
        setTotalUnreadMessages(prev => {
          const conversation = conversations.find(c => c.id === conversationId);
          if (conversation) {
            if (conversation.user1_id == userId) {
              return prev - conversation.unread_count_user1;
            } else if (conversation.user2_id == userId) {
              return prev - conversation.unread_count_user2;
            }
          }
          return prev;
        });
      }
      
      return response.data.success;
    } catch (error) {
      console.error('Error resetting unread count:', error);
      toast.error('Failed to reset unread count');
      return false;
    }
  };

  const fetchTotalUnreadMessages = async (userId) => {
    try {
      const response = await authAPI().get(messagesApis.getTotalUnread(userId));
      if (response.data.success) {
        setTotalUnreadMessages(response.data.total_unread);
        return response.data.total_unread;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching total unread messages:', error);
      return 0;
    }
  };

  const value = {
    socket,
    messages,
    setMessages,
    conversations,
    selectedConversation,
    setSelectedConversation,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    fetchMessages,
    fetchConversations,
    markMessagesAsRead,
    resetUnreadCount,
    totalUnreadMessages,
    fetchTotalUnreadMessages
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
