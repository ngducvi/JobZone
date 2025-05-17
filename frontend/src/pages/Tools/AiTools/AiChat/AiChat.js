import React, { useState, useRef, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './AiChat.module.scss';
import { EventSourcePolyfill } from 'event-source-polyfill';
import ModalTypeContext from '~/context/ModalTypeContext';
import ModelAI from '~/components/ModelAI';
import { FaRobot, FaUser, FaPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

const cx = classNames.bind(styles);

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
  const chatContainerRef = useRef(null);
  
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

  const formatBotMessage = (text) => {
    // Loại bỏ dấu ngoặc kép thừa đầu/cuối nếu có
    let formatted = text;
    if (formatted.startsWith('"') && formatted.endsWith('"')) {
      formatted = formatted.slice(1, -1);
    }
    // Thay thế \" thành "
    formatted = formatted.replace(/\\"/g, '"');
    // KHÔNG thay thế \n thành <br/>
    // Xử lý các trường hợp \\n thành \n
    formatted = formatted.replace(/\\n/g, '\n');
    return formatted;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setModalType('loginEmail');
      return;
    }

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputMessage('');
    setIsTyping(true);

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

    let eventSource;
    try {
      const prompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;

      eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          withCredentials: false,
          heartbeatTimeout: 60000,
        }
      );

      let botResponse = '';

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          botResponse += data;
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
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = () => {
        setIsTyping(false);
        eventSource.close();
      };

    } catch (error) {
      console.error('Error sending message:', error);
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
          <ModelAI selectedModel={model} setSelectedModel={setModel} />
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
                <ReactMarkdown>
                  {message.type === 'bot' ? formatBotMessage(message.content) : message.content}
                </ReactMarkdown>
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
      </div>
    </div>
  );
};

export default AiChat; 