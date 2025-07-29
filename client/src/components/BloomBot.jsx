import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import './BloomBot.css';

function BloomBot() {
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize with a simple greeting
  useEffect(() => {
    setMessages([{
      id: 1,
      text: "Hello! I'm BloomBot and I am your wellness buddy. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const userMsg = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Store the message to send before clearing the input
    const messageToSend = userMessage;

    // Clear input field immediately after sending
    setUserMessage('');

    try {
      const res = await axiosInstance.post('/api/bloombot', {
        message: messageToSend
      });

      // Add bot response to chat
      const botMsg = {
        id: messages.length + 2,
        text: res.data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      // Add a friendly message to the chat
      const errorMsg = {
        id: messages.length + 2,
        text: 'BloomBot is feeling a little tired. Try again soon.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bloombot-container">
      {!showChat ? (
        <button
          className="bloombot-button"
          onClick={() => setShowChat(true)}
          aria-label="Open BloomBot chat"
        >
          <div className="bloombot-button-content">
            <div className="bloombot-icon">🌼</div>
            <span>BloomBot</span>
          </div>
        </button>
      ) : (
        <div className={`bloombot-chat ${isMinimized ? 'minimized' : ''}`}>
          <div className="bloombot-header">
            <div className="bloombot-title">
              <div className="bloombot-avatar">🌼</div>
              <h3>BloomBot</h3>
            </div>
            <div className="bloombot-controls">
              <button
                className="bloombot-minimize"
                onClick={toggleMinimize}
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? '↑' : '↓'}
              </button>
              <button
                className="bloombot-close"
                onClick={() => setShowChat(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="bloombot-messages" ref={chatContainerRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    {msg.sender === 'bot' && <div className="bot-avatar">🌼</div>}
                    <div className="message-content">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message bot-message">
                    <div className="bot-avatar">🌼</div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bloombot-input">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={handleSend}
                  disabled={isLoading || !userMessage.trim()}
                  aria-label="Send message"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BloomBot;
