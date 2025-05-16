import React, { useState, useRef, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './AiChat.module.scss';
import ModalTypeContext from '~/context/ModalTypeContext';
import ModelAI from '~/components/ModelAI';
import { FaRobot, FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';

const cx = classNames.bind(styles);

// Test Modal Component
const TestModal = ({ isOpen, onClose, testResult }) => {
  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal-content')}>
        <h2>Test Puter.js Integration</h2>
        <div className={cx('test-result')}>
          {testResult ? (
            <>
              <p className={cx('status', 'success')}>✓ Kết nối thành công!</p>
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </>
          ) : (
            <p className={cx('status', 'loading')}>Đang kiểm tra kết nối...</p>
          )}
        </div>
        <button className={cx('close-button')} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

// Utility function to load Puter.js
const loadPuterScript = () => {
  return new Promise((resolve, reject) => {
    if (window.puter) {
      resolve(window.puter);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      if (window.puter) {
        resolve(window.puter);
      } else {
        reject(new Error('Puter.js failed to load properly'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Puter.js script'));
    };
    document.head.appendChild(script);
  });
};

// Direct Chat Modal Component
const DirectChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem('puterChatMessages');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');
  const [error, setError] = useState(null);
  const [puterInstance, setPuterInstance] = useState(null);
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUserInfo = localStorage.getItem('puterChatUserInfo');
      return savedUserInfo ? JSON.parse(savedUserInfo) : { name: null };
    } catch (error) {
      console.error('Error loading user info:', error);
      return { name: null };
    }
  });
  const chatContainerRef = useRef(null);

  // Add state for chat history loaded
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [initialContext, setInitialContext] = useState('');

  const models = [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' }
  ];

  // Load and process chat history when component mounts
  useEffect(() => {
    if (isOpen && messages.length > 0 && !isHistoryLoaded) {
      const processHistory = async () => {
        try {
          // Create initial context from all messages
          const historyContext = messages.map(msg => 
            `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
          ).join('\n');

          // Create initial system prompt with history
          const initialPrompt = `${getSystemPrompt()}\n\nLịch sử chat đầy đủ:\n${historyContext}\n\nAssistant: Tôi đã đọc lại toàn bộ lịch sử chat. Tôi sẽ tiếp tục cuộc trò chuyện dựa trên ngữ cảnh này.`;
          
          setInitialContext(initialPrompt);
          setIsHistoryLoaded(true);

          // If we have puter instance, send initial context
          if (puterInstance) {
            await puterInstance.ai.chat(initialPrompt, {
              model: selectedModel,
              stream: false
            });
          }
        } catch (error) {
          console.error('Error processing chat history:', error);
        }
      };

      processHistory();
    }
  }, [isOpen, messages, puterInstance, isHistoryLoaded]);

  // Reset history loaded state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsHistoryLoaded(false);
      setInitialContext('');
    }
  }, [isOpen]);

  // System prompt with user info and context handling
  const getSystemPrompt = () => {
    return `Bạn là một trợ lý AI thông minh và hữu ích. 
    Thông tin người dùng:
    - Tên: ${userInfo.name || 'chưa biết'}
    
    Hướng dẫn quan trọng:
    1. LUÔN đọc và phân tích toàn bộ lịch sử chat trước khi trả lời
    2. Hiểu ngữ cảnh của cuộc trò chuyện từ các tin nhắn trước đó
    3. Trả lời dựa trên ngữ cảnh và thông tin đã trao đổi
    4. Nếu câu hỏi liên quan đến thông tin đã thảo luận trước đó, hãy tham chiếu lại
    5. Nếu thông tin mâu thuẫn với lịch sử chat, hãy chỉ ra và làm rõ
    6. Khi khởi tạo lại, hãy đọc toàn bộ lịch sử chat để hiểu ngữ cảnh
    
    Khi xử lý tên:
    - Nếu người dùng chưa cho biết tên, hãy hỏi họ
    - Nếu đã biết tên, hãy sử dụng tên đó trong các câu trả lời
    - Khi người dùng hỏi "tôi tên là gì" hoặc "tôi là ai", trả lời dựa trên thông tin đã lưu
    - KHÔNG lưu câu hỏi của người dùng như một tên mới`;
  };

  // Get relevant context from previous messages
  const getMessageContext = (currentMessage) => {
    // Get last 10 messages for context
    const recentMessages = messages.slice(-10);
    
    // Create a summary of the conversation context
    const contextSummary = recentMessages.map(msg => {
      const role = msg.type === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n');

    // Add current message
    return `${contextSummary}\nUser: ${currentMessage}\nAssistant:`;
  };

  // Check if message is a name declaration
  const isNameDeclaration = (message) => {
    const namePatterns = [
      /^tôi tên là\s+([^,.!?]+)$/i,
      /^tên tôi là\s+([^,.!?]+)$/i,
      /^tôi là\s+([^,.!?]+)$/i
    ];
    return namePatterns.some(pattern => pattern.test(message));
  };

  // Check if message is a name query
  const isNameQuery = (message) => {
    const queryPatterns = [
      /^tôi tên là gì$/i,
      /^tôi là ai$/i,
      /^tên tôi là gì$/i
    ];
    return queryPatterns.some(pattern => pattern.test(message));
  };

  // Extract name from declaration
  const extractName = (message) => {
    if (!isNameDeclaration(message)) return null;

    const namePatterns = [
      /^tôi tên là\s+([^,.!?]+)$/i,
      /^tên tôi là\s+([^,.!?]+)$/i,
      /^tôi là\s+([^,.!?]+)$/i
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate name (ít nhất 2 ký tự, không chứa số)
        if (name.length >= 2 && !/\d/.test(name)) {
          return name;
        }
      }
    }
    return null;
  };

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('puterChatMessages', JSON.stringify(messages));
  }, [messages]);

  // Save user info to localStorage
  useEffect(() => {
    localStorage.setItem('puterChatUserInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  // Load Puter.js when modal opens
  useEffect(() => {
    let mounted = true;

    const initPuter = async () => {
      if (!isOpen) return;
      
      try {
        setError(null);
        const puter = await loadPuterScript();
        if (mounted) {
          setPuterInstance(puter);
        }
      } catch (err) {
        console.error('Error loading Puter.js:', err);
        if (mounted) {
          setError('Không thể kết nối với Puter.js. Vui lòng thử lại sau.');
        }
      }
    };

    initPuter();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !puterInstance) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      // If we have initial context and this is the first message after load
      let prompt = '';
      if (initialContext && !isHistoryLoaded) {
        prompt = `${initialContext}\n\nUser: ${userMessage}\nAssistant:`;
      } else {
        // Get full context including system prompt and message history
        prompt = `${getSystemPrompt()}\n\nLịch sử chat gần đây:\n${getMessageContext(userMessage)}`;
      }
      
      const response = await puterInstance.ai.chat(prompt, {
        model: selectedModel,
        stream: true
      });

      let botResponse = '';
      
      for await (const part of response) {
        if (part?.text) {
          botResponse += part.text;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.type === 'bot') {
              lastMessage.content = botResponse;
              return [...newMessages];
            } else {
              return [...prev, { type: 'bot', content: botResponse }];
            }
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError('Đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      setMessages([]);
      setUserInfo({ name: null });
      localStorage.removeItem('puterChatMessages');
      localStorage.removeItem('puterChatUserInfo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('direct-chat-modal')}>
        <div className={cx('modal-header')}>
          <h2>Chat Trực Tiếp với Puter.js</h2>
          <div className={cx('header-actions')}>
            {messages.length > 0 && (
              <div className={cx('history-status')}>
                {isHistoryLoaded ? '✓ Đã tải lịch sử chat' : 'Đang tải lịch sử chat...'}
              </div>
            )}
            <button 
              className={cx('clear-button')} 
              onClick={clearChat}
              title="Xóa lịch sử chat"
            >
              Xóa Chat
            </button>
            <button className={cx('close-button')} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {error && (
          <div className={cx('error-message')}>
            {error}
          </div>
        )}

        <div className={cx('model-selector')}>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className={cx('model-select')}
            disabled={!puterInstance}
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className={cx('chat-container')} ref={chatContainerRef}>
          {!puterInstance && !error && (
            <div className={cx('loading-message')}>
              Đang kết nối với Puter.js...
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={cx('message')}>
              <div className={cx('avatar', message.type)} style={{ marginLeft: '40px' }}>
                {message.type === 'user' ? (
                  <FaUser className={cx('icon')} />
                ) : (
                  <FaRobot className={cx('icon')} />
                )}
              </div>
              <div className={cx('message-content', message.type)}>
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={cx('message')}>
              <div className={cx('avatar', 'bot')}>
                <FaRobot className={cx('icon')} />
              </div>
              <div className={cx('message-content', 'bot')}>
                <div className={cx('typing-indicator')}>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cx('input-container')}>
          <div className={cx('input-wrapper')}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={puterInstance ? "Nhập tin nhắn của bạn..." : "Đang kết nối..."}
              disabled={!puterInstance || isTyping}
            />
            <button
              className={cx('send-button')}
              onClick={handleSendMessage}
              disabled={!puterInstance || !inputMessage.trim() || isTyping}
            >
              <FaPaperPlane className={cx('icon')} />
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiChat = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('aiChatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [userInfo, setUserInfo] = useState(() => {
    const savedUserInfo = localStorage.getItem('aiChatUserInfo');
    return savedUserInfo ? JSON.parse(savedUserInfo) : {};
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState('');
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const chatContainerRef = useRef(null);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);
  
  const suggestions = [
    'Tôi nên chuẩn bị gì cho buổi phỏng vấn?',
    'Làm thế nào để viết CV hiệu quả?',
    'Cách phát triển kỹ năng mềm?',
    'Xu hướng nghề nghiệp hiện nay?'
  ];

  const systemPrompt = `Bạn là một trợ lý AI chuyên nghiệp về tư vấn nghề nghiệp và phát triển sự nghiệp. 
  Nhiệm vụ của bạn là:
  1. Tư vấn về lựa chọn và phát triển nghề nghiệp
  2. Hướng dẫn cách chuẩn bị CV và phỏng vấn
  3. Đưa ra lời khuyên về phát triển kỹ năng
  4. Giải đáp thắc mắc về thị trường lao động
  5. Hỗ trợ định hướng và lập kế hoạch sự nghiệp

  Thông tin người dùng:
  - Tên: ${userInfo.name || 'chưa biết'}

  Hãy trả lời một cách chuyên nghiệp, đầy đủ và dễ hiểu. Sử dụng ngôn ngữ thân thiện và khuyến khích người dùng.`;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('aiChatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('aiChatUserInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  // Load Puter.js script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        setPuterLoaded(true);
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup script on component unmount
        document.head.removeChild(script);
      };
    } else if (window.puter) {
      setPuterLoaded(true);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setModalType('loginEmail');
      return;
    }

    if (!puterLoaded) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Đang khởi tạo AI, vui lòng thử lại sau...' 
      }]);
      return;
    }

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputMessage('');
    setIsTyping(true);

    // Handle name-related messages
    if (userMessage.toLowerCase().includes('tôi tên là')) {
      const name = userMessage.split('tôi tên là')[1].trim();
      setUserInfo(prev => ({ ...prev, name }));
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Tôi đã ghi nhớ tên của bạn là ${name}. Tôi sẽ sử dụng tên này trong các cuộc trò chuyện sau.` 
      }]);
      setIsTyping(false);
      return;
    }

    if (userMessage.toLowerCase().includes('tôi tên là gì')) {
      if (userInfo.name) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Bạn tên là ${userInfo.name}. Tôi đã ghi nhớ tên của bạn từ trước.` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Tôi chưa biết tên của bạn. Bạn có thể cho tôi biết tên của bạn không?' 
        }]);
      }
      setIsTyping(false);
      return;
    }

    try {
      const prompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;
      const selectedModel = model || 'claude-3-5-sonnet'; // Default to Claude 3.5 Sonnet if no model selected

      // Use Puter.js for chat
      const response = await window.puter.ai.chat(prompt, {
        model: selectedModel,
        stream: true
      });

      let botResponse = '';

      // Handle streaming response
      for await (const part of response) {
        if (part?.text) {
          botResponse += part.text;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.type === 'bot') {
              lastMessage.content = botResponse;
              return [...newMessages];
            } else {
              return [...prev, { type: 'bot', content: botResponse }];
            }
          });
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleTestConnection = async () => {
    setIsTestModalOpen(true);
    setTestResult(null);

    try {
      if (!puterLoaded) {
        setTestResult({ error: 'Puter.js chưa được tải xong' });
        return;
      }

      const testPrompt = 'Xin chào, đây là tin nhắn test. Hãy trả lời ngắn gọn "Test thành công!"';
      const response = await window.puter.ai.chat(testPrompt, {
        model: 'claude-3-5-sonnet',
        stream: false
      });

      setTestResult({
        status: 'success',
        model: 'claude-3-5-sonnet',
        response: response.message.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('header')}>
          <h1 className={cx('title')}>
            <FaRobot className={cx('icon')} />
            AI Chatbot Tư Vấn
          </h1>
          <p className={cx('description')}>
            Trò chuyện với AI để nhận tư vấn về nghề nghiệp, kỹ năng và định hướng sự nghiệp
          </p>
          <div className={cx('header-controls')}>
          <ModelAI selectedModel={model} setSelectedModel={setModel} />
            <button 
              className={cx('test-button')} 
              onClick={() => setIsDirectChatOpen(true)}
              title="Chat trực tiếp với Puter.js"
            >
              <FaPaperPlane className={cx('icon')} />
              Chat Trực Tiếp
            </button>
          </div>
        </div>

        {messages.length === 0 && (
          <div className={cx('suggestions')}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={cx('suggestion-chip')}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className={cx('chat-container')} ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={cx('message')}>
              <div className={cx('avatar', message.type)}>
                {message.type === 'user' ? (
                  <FaUser className={cx('icon')} />
                ) : (
                  <FaRobot className={cx('icon')} />
                )}
              </div>
              <div className={cx('message-content', message.type)}>
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={cx('message')}>
              <div className={cx('avatar', 'bot')}>
                <FaRobot className={cx('icon')} />
              </div>
              <div className={cx('message-content', 'bot')}>
                <div className={cx('typing-indicator')}>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cx('input-container')}>
          <div className={cx('input-wrapper')}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
            />
            <button
              className={cx('send-button')}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              <FaPaperPlane className={cx('icon')} />
              Gửi
            </button>
          </div>
        </div>

        <TestModal 
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          testResult={testResult}
        />

        <DirectChatModal 
          isOpen={isDirectChatOpen}
          onClose={() => setIsDirectChatOpen(false)}
        />
      </div>
    </div>
  );
};

export default AiChat; 