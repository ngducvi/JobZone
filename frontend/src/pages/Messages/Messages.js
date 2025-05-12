// Messages page

import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from './Messages.module.scss';
import { FaUser, FaEllipsisV, FaArrowLeft, FaPaperclip, FaImage, FaPaperPlane, FaEdit, FaTrash, FaCheck, FaCheckDouble } from "react-icons/fa";
import { authAPI, messagesApis, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import images from "~/assets/images/index";
import Avatar from "~/components/Avatar";
import { useMessage } from '~/context/MessageContext';
import socketService from '~/utils/socket';

const cx = classNames.bind(styles);

const Messages = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMenuForMessage, setShowMenuForMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesContainerRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const {
    messages,
    conversations,
    selectedConversation,
    setSelectedConversation,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    fetchMessages,
    fetchConversations,
    setMessages,
    markMessagesAsRead,
    resetUnreadCount
  } = useMessage();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Lấy user hiện tại
        const currentUserResponse = await authAPI().get(userApis.getCurrentUser);
        setCurrentUser(currentUserResponse.data);
        setCurrentId(currentUserResponse.data.user.id);

        // Lấy conversations
        await fetchConversations(currentUserResponse.data.user.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Thiết lập interval để làm mới số tin nhắn chưa đọc mỗi 30 giây
    const refreshInterval = setInterval(() => {
      if (currentId) {
        fetchConversations(currentId);
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation.id);
      
      // Listen for message updates
      socketService.socket.on('message_updated', (updatedMessage) => {
        // Update the message in the messages array
        const updatedMessages = messages.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        );
        // Force re-render by setting messages
        setMessages([...updatedMessages]);
      });

      return () => {
        leaveConversation(selectedConversation.id);
        socketService.socket.off('message_updated');
      };
    }
  }, [selectedConversation, messages]);

  useEffect(() => {
    const fetchAllCompanyDetails = async () => {
      const companyDetailsMap = {};
      for (const conversation of conversations) {
        const otherUserId = conversation.user1_id === currentId
          ? conversation.user2_id
          : conversation.user1_id;
        try {
          const response = await authAPI().get(userApis.getRecruiterCompanyByUserId, {
            params: { user_id: otherUserId }
          });
          if (response.data.company) {
            companyDetailsMap[conversation.id] = response.data.company;
          }
        } catch (error) {
          console.error("Error fetching company detail:", error);
        }
      }
      setCompanyDetails(companyDetailsMap);
    };

    if (conversations.length > 0 && currentId) {
      fetchAllCompanyDetails();
    }
  }, [conversations, currentId]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      const firstConversation = conversations[0];
      setSelectedConversation(firstConversation);
      fetchMessages(firstConversation.id);
    }
  }, [conversations]);

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    
    // Đánh dấu tin nhắn đã đọc và đặt lại số lượng tin nhắn chưa đọc
    if (currentId) {
      await markMessagesAsRead(conversation.id, currentId);
      await resetUnreadCount(conversation.id, currentId);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setShowMenuForMessage(null);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage || !newMessage.trim()) return;

    try {
      const response = await authAPI().put(messagesApis.editMessage, {
        message_id: editingMessage.id,
        message: newMessage.trim()
      });

      if (response.data.success) {
        // Reset editing state
        setEditingMessage(null);
        setNewMessage("");
        toast.success("Message updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update message");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error(error.response?.data?.message || "Failed to update message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await authAPI().delete(messagesApis.deleteMessage, {
        data: { message_id: messageId }
      });

      if (response.data.success) {
        setShowMenuForMessage(null);
        toast.success("Message deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      if (editingMessage) {
        await handleUpdateMessage();
      } else {
        await sendMessage(selectedConversation.id, newMessage.trim());
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedConversation && currentId) {
      socketService.handleTyping(selectedConversation.id, currentId, true);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBackToHome = () => {
    if (currentUser?.user?.role === 'recruiter') {
      navigate('/recruiter');
    } else {
      navigate('/');
    }
  };

  // Add search handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const searchLower = searchQuery.toLowerCase();
    const otherUserId = conversation.user1_id === currentId ? conversation.user2_id : conversation.user1_id;
    
    // Search by ID
    if (otherUserId.toString().includes(searchLower)) {
      return true;
    }
    
    // Search by company name if available
    if (companyDetails[conversation.id]?.company_name && 
        companyDetails[conversation.id].company_name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  if (loading) {
    return (
      <div className={cx("loading-container")}>
        <div className={cx("loading-spinner")}></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("conversations")}>
        <div className={cx("header")}>
          <button className={cx("back-button")} onClick={handleBackToHome}>
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h2>Messages</h2>
          {conversations.length > 0 && (
            <div className={cx("unread-count")}>
              {conversations.reduce((total, conv) => {
                if (conv.user1_id === currentId) {
                  return total + conv.unread_count_user1;
                } else {
                  return total + conv.unread_count_user2;
                }
              }, 0)}
            </div>
          )}
        </div>
        <div className={cx("search-box")}>
          <input 
            type="text" 
            placeholder="Search by ID or company name..." 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className={cx("list")}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cx("conversation-item", {
                  active: selectedConversation?.id === conversation.id
                })}
                onClick={() => handleConversationSelect(conversation)}
              >
                <Avatar
                  src={companyDetails[conversation.id]?.logo || images.avatar}
                  className={cx("avatar")}
                  alt="Company logo"
                />
                <div className={cx("content")}>
                  <div className={cx("name")}>
                    {companyDetails[conversation.id]?.company_name || `User ${conversation.user1_id === currentId ? conversation.user2_id : conversation.user1_id}`}
                  </div>
                  <div className={cx("last-message")}>{conversation.last_message || "No messages yet"}</div>
                </div>
                <div className={cx("meta")}>
                  <div className={cx("time")}>
                    {formatTime(conversation.last_message_at || new Date())}
                  </div>
                  {conversation.user1_id === currentId
                    ? conversation.unread_count_user1 > 0 && (
                      <div className={cx("unread")}>
                        {conversation.unread_count_user1}
                      </div>
                    )
                    : conversation.unread_count_user2 > 0 && (
                      <div className={cx("unread")}>
                        {conversation.unread_count_user2}
                      </div>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className={cx("no-conversations")}>
              <div className={cx("empty-icon")}>
                <FaUser size={32} />
              </div>
              <p>No conversations yet</p>
              <span>Start connecting with recruiters</span>
            </div>
          )}
        </div>
      </div>

      <div className={cx("chat")}>
        {selectedConversation ? (
          <>
            <div className={cx("header")}>
              <div className={cx("user-info")}>
                <Avatar
                  src={companyDetails[selectedConversation.id]?.logo || images.avatar}
                  className={cx("avatar")}
                  alt="Company logo"
                />
                <div className={cx("info")}>
                  <div className={cx("name")}>
                    {companyDetails[selectedConversation.id]?.company_name || `Recruiter ${selectedConversation.user1_id === currentId ? selectedConversation.user2_id : selectedConversation.user1_id}`}
                  </div>
                  <div className={cx("status")}>
                    <span className={cx("status-dot")}></span>
                    Online
                  </div>
                </div>
              </div>
              <div className={cx("actions")}>
                <button className={cx("profile-button")} onClick={() => navigate(`/company-detail/${companyDetails[selectedConversation.id]?.company_id}`)}>
                  <FaUser />
                  <span>View Profile</span>
                </button>
                <button className={cx("more-button")}>
                  <FaEllipsisV />
                </button>
              </div>
            </div>

            <div className={cx("messages")} ref={messagesContainerRef}>
              {messages.length > 0 ? (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={cx("message", {
                        sent: message.sender_id === currentId,
                        received: message.sender_id !== currentId
                      })}
                    >
                      <div className={cx("message-content")}>
                        {message.content}
                        {message.sender_id === currentId && (
                          <>
                            <div className={cx("read-status")}>
                              {message.is_read ? (
                                <FaCheckDouble className={cx("read-icon")} />
                              ) : (
                                <FaCheck className={cx("unread-icon")} />
                              )}
                            </div>
                            <div className={cx("message-menu")}>
                              <button
                                className={cx("menu-button")}
                                onClick={() => setShowMenuForMessage(
                                  showMenuForMessage === message.id ? null : message.id
                                )}
                              >
                                <FaEllipsisV />
                              </button>
                              <div className={cx("menu-options", {
                                show: showMenuForMessage === message.id
                              })}>
                                <div
                                  className={cx("option")}
                                  onClick={() => handleEditMessage(message)}
                                >
                                  <FaEdit />
                                  <span>Edit</span>
                                </div>
                                <div
                                  className={cx("option", "delete")}
                                  onClick={() => handleDeleteMessage(message.id)}
                                >
                                  <FaTrash />
                                  <span>Delete</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className={cx("time")}>{formatTime(message.created_at)}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div className={cx("no-messages")}>
                  <p>No messages yet</p>
                  <span>Start the conversation by sending a message</span>
                </div>
              )}
            </div>

            <form className={cx("input")} onSubmit={handleSendMessage}>
              <div className={cx("input-wrapper")}>
                <input
                  type="text"
                  placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                  value={newMessage}
                  onChange={handleTyping}
                />
                {editingMessage && (
                  <button
                    type="button"
                    className={cx("cancel-edit")}
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage("");
                    }}
                  >
                    Cancel
                  </button>
                )}
                <div className={cx("attachments")}>
                  <button type="button" className={cx("attachment-button")}>
                    <FaPaperclip />
                  </button>
                  <button type="button" className={cx("attachment-button")}>
                    <FaImage />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className={cx("send-button", { disabled: !newMessage.trim() })}
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane />
                <span>{editingMessage ? "Update" : "Send"}</span>
              </button>
            </form>
          </>
        ) : (
          <div className={cx("no-chat")}>
            <div className={cx("empty-state")}>
              <div className={cx("empty-icon")}>
                <FaUser size={48} />
              </div>
              <h3>Select a conversation to start chatting</h3>
              <p>Connect with recruiters and discuss job opportunities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
