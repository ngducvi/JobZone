import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from './MesagesRecruiter.module.scss';
import { authAPI, messagesApis, userApis, recruiterApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import images from "~/assets/images/index";
import { FaUser, FaEllipsisV, FaArrowLeft, FaPaperclip, FaImage, FaPaperPlane, FaEdit, FaTrash, FaCheck, FaCheckDouble, FaTimes } from "react-icons/fa";
import { useMessage } from '~/context/MessageContext';
import socketService from '~/utils/socket';

const cx = classNames.bind(styles);

const MessagesRecruiter = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [candidateDetail, setCandidateDetail] = useState(null);
    const [candidateprofilepicture, setcandidateprofilepicture] = useState(null);
    const [conversationsData, setConversationsData] = useState({});
    const [editingMessage, setEditingMessage] = useState(null);
    const [showMenuForMessage, setShowMenuForMessage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showConversations, setShowConversations] = useState(true);
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
        markMessagesAsRead,
        resetUnreadCount
    } = useMessage();

    // Check if the device is mobile
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= 768);
        };
        
        // Initial check
        checkMobileView();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkMobileView);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

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
                // Lấy user
                const currentUserResponse = await authAPI().get(userApis.getCurrentUser);
                setCurrentUser(currentUserResponse.data);
                setCurrentId(currentUserResponse.data.user.id);

                // Lấy danh sách conversation
                await fetchConversations(currentUserResponse.data.user.id);

                // Nếu có conversation thì lấy messages của conversation đầu tiên
                if (conversations.length > 0) {
                    const firstConversationId = conversations[0].id;
                    await fetchMessages(firstConversationId);
                    setSelectedConversation(conversations[0]);
                    
                    // Load thông tin cho tất cả các cuộc hội thoại
                    loadAllConversationsUserData(conversations, currentUserResponse.data.user.id);
                }
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
            
            // On mobile, when a conversation is selected, hide the conversations list
            if (isMobileView) {
                setShowConversations(false);
            }
            
            return () => {
                leaveConversation(selectedConversation.id);
            };
        }
    }, [selectedConversation, isMobileView]);

    useEffect(() => {
        if (!selectedConversation) return;
        const candidateId = selectedConversation.user1_id === currentId
            ? selectedConversation.user2_id
            : selectedConversation.user1_id;
        const fetchCandidateDetail = async () => {
            try {
                const res = await authAPI().get(
                    recruiterApis.getCandidateDetailByUserId(candidateId)
                );
                setCandidateDetail(res.data.user);
                setcandidateprofilepicture(res.data.candidate);
                console.log("Candidate details loaded:", res.data);
                
                // Lưu thông tin cho conversation hiện tại
                setConversationsData(prev => ({
                    ...prev,
                    [selectedConversation.id]: {
                        user: res.data.user,
                        profilePicture: res.data.candidate?.profile_picture || null
                    }
                }));
            } catch (error) {
                console.error("Error fetching candidate details:", error);
                setCandidateDetail(null);
                setcandidateprofilepicture(null);
            }
        };
        fetchCandidateDetail();
    }, [selectedConversation, currentId]);

    const handleConversationSelect = async (conversation) => {
        setSelectedConversation(conversation);
        await fetchMessages(conversation.id);
        
        // If on mobile, hide the conversations list after selecting a conversation
        if (isMobileView) {
            setShowConversations(false);
        }
        
        // Nếu chưa có thông tin người dùng cho hội thoại này, tải thông tin
        if (!conversationsData[conversation.id]) {
            const userId = conversation.user1_id === currentId
                ? conversation.user2_id
                : conversation.user1_id;
                
            try {
                const res = await authAPI().get(
                    recruiterApis.getCandidateDetailByUserId(userId)
                );
                
                setCandidateDetail(res.data.user);
                setcandidateprofilepicture(res.data.candidate);
                
                setConversationsData(prev => ({
                    ...prev,
                    [conversation.id]: {
                        user: res.data.user,
                        profilePicture: res.data.candidate?.profile_picture || null
                    }
                }));
            } catch (error) {
                console.error(`Error fetching user data for conversation ${conversation.id}:`, error);
            }
        } else {
            // Sử dụng thông tin người dùng đã lưu trữ
            const userData = conversationsData[conversation.id];
            setCandidateDetail(userData.user);
            setcandidateprofilepicture({ profile_picture: userData.profilePicture });
        }
        
        // Đánh dấu tin nhắn đã đọc và đặt lại số lượng tin nhắn chưa đọc
        if (currentId) {
            await markMessagesAsRead(conversation.id, currentId);
            await resetUnreadCount(conversation.id, currentId);
        }
    };

    const handleGoBackToList = () => {
        setShowConversations(true);
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
        navigate('/recruiter');
    };

    const handleViewCandidateProfile = (candidateId) => {
        navigate(`/recruiter/candidate-detail/${candidateId}`);
    };

    // Hàm tải thông tin người dùng cho tất cả các cuộc hội thoại
    const loadAllConversationsUserData = async (conversationsList, userId) => {
        try {
            const promises = conversationsList.map(async (conversation) => {
                const otherUserId = conversation.user1_id === userId
                    ? conversation.user2_id
                    : conversation.user1_id;
                
                try {
                    const res = await authAPI().get(
                        recruiterApis.getCandidateDetailByUserId(otherUserId)
                    );
                    
                    return {
                        conversationId: conversation.id,
                        userData: {
                            user: res.data.user,
                            profilePicture: res.data.candidate?.profile_picture || null
                        }
                    };
                } catch (error) {
                    console.error(`Error fetching user data for conversation ${conversation.id}:`, error);
                    return {
                        conversationId: conversation.id,
                        userData: null
                    };
                }
            });
            
            const results = await Promise.all(promises);
            
            const newConversationsData = {};
            results.forEach(result => {
                if (result.userData) {
                    newConversationsData[result.conversationId] = result.userData;
                }
            });
            
            setConversationsData(newConversationsData);
        } catch (error) {
            console.error("Error loading conversations user data:", error);
        }
    };

    useEffect(() => {
        if (conversations.length > 0 && currentId) {
            // Load thông tin cho tất cả các cuộc hội thoại khi danh sách thay đổi
            loadAllConversationsUserData(conversations, currentId);
        }
    }, [conversations, currentId]);

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
            {(!isMobileView || (isMobileView && showConversations)) && (
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
                        <input type="text" placeholder="Search conversations..." />
                    </div>
                    <div className={cx("list")}>
                        {conversations.length > 0 ? (
                            conversations.map((conversation) => {
                                const conversationData = conversationsData[conversation.id] || {};
                                return (
                                    <div
                                        key={conversation.id}
                                        className={cx("conversation-item", {
                                            active: selectedConversation?.id === conversation.id
                                        })}
                                        onClick={() => handleConversationSelect(conversation)}
                                    >
                                        <img
                                            src={conversationData.profilePicture || images.avatar}
                                            className={cx("avatar")}
                                            alt={conversationData.user?.name || "User"}
                                        />
                                        <div className={cx("content")}>
                                            <div className={cx("name")}>
                                                {conversationData.user?.name || 
                                                    (conversation.user1_id === currentId
                                                        ? conversation.user2_id
                                                        : conversation.user1_id)}
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
                                );
                            })
                        ) : (
                            <div className={cx("no-conversations")}>
                                <div className={cx("empty-icon")}>
                                    <FaUser size={32} />
                                </div>
                                <p>No conversations yet</p>
                                <span>Start connecting with candidates</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(!isMobileView || (isMobileView && !showConversations)) && (
                <div className={cx("chat")}>
                    {selectedConversation ? (
                        <>
                            <div className={cx("header")}>
                                {isMobileView && (
                                    <button className={cx("mobile-back")} onClick={handleGoBackToList}>
                                        <FaArrowLeft />
                                    </button>
                                )}
                                <div className={cx("user-info")}>
                                    <img
                                        src={candidateprofilepicture?.profile_picture || images.avatar}
                                        className={cx("avatar")}
                                        alt={candidateDetail?.name || "User avatar"}
                                    />
                                    <div className={cx("info")}>
                                        <div className={cx("name")}>
                                            {candidateDetail?.name || (selectedConversation?.user1_id === currentId
                                                ? selectedConversation?.user2_id
                                                : selectedConversation?.user1_id)}
                                        </div>
                                        <div className={cx("status")}>
                                            <span className={cx("status-dot")}></span>
                                            {candidateDetail?.email && (
                                                <span className={cx("email")}>{candidateDetail.email}</span>
                                            )}
                                            {candidateDetail?.phone && (
                                                <span className={cx("phone")}> • {candidateDetail.phone}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={cx("actions")}>
                                    <button
                                        className={cx("profile-button")}
                                        onClick={() => handleViewCandidateProfile(
                                            candidateDetail?.user_id || 1
                                        )}
                                    >
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
                                    messages.map((message, index) => (
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
                                    ))
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
                                <h3>Chọn một cuộc trò chuyện để bắt đầu</h3>
                                <p>Kết nối với các ứng viên thảo luận về các cơ hội việc làm</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessagesRecruiter;
