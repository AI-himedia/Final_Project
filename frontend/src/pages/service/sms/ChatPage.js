import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '../../../api/AxiosInstance';
import styles from './ChatPage.module.css';
import { HeaderService } from '../../../components/Header/variants';

const ChatPage = () => {
  const location = useLocation();
  const { subscriptionCode, deceasedName } = location.state || {};

  useEffect(() => {
    console.log('Received subscriptionCode:', subscriptionCode);
  }, [subscriptionCode]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = useCallback(() => {
    if (chatBoxRef.current) {
      const scrollHeight = chatBoxRef.current.scrollHeight;
      chatBoxRef.current.scrollTop = scrollHeight;
    }
  }, []);

  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const userMessage = { type: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await axiosInstance.post('/sms/chat', {
        subscriptionCode,
        userInput: currentInput,
      });
      setIsTyping(false);
      const aiMessage = {
        type: 'ai',
        content: response.data.message || '(응답 없음)',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage = {
        type: 'ai',
        content: error.response?.data?.message || error.message,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }, [input, subscriptionCode, isSending]);

  const handleSendButtonClick = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
        e.preventDefault();
        sendMessage().then(() => {
          setInput('');
        });
      }
    },
    [sendMessage, input]
  );

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, isTyping, scrollToBottom]);

  return (
    <>
      <HeaderService deceasedName={deceasedName} />

      <div className={styles['chat-container']}>
        <div className={styles['chat-box']} ref={chatBoxRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles['chat-message']} ${
                msg.type === 'user'
                  ? styles['user-message']
                  : styles['ai-message']
              }`}
            >
              {msg.content}
            </div>
          ))}

          {/* 입력 중 표시 */}
          {isTyping && (
            <div
              className={`${styles['chat-message']} ${styles['ai-message']} ${styles['typing-indicator']}`}
            >
              잠시만 기다려 주세요...
            </div>
          )}
        </div>

        <div className={styles['chat-input-wrapper']}>
          <textarea
            className={styles['chat-input']}
            placeholder="메시지 입력"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <button
            className={styles['send-button']}
            onClick={handleSendButtonClick}
            disabled={isTyping}
          >
            전송
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(ChatPage);
