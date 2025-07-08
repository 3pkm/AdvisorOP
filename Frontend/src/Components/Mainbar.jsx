import React, { useEffect, useRef } from 'react';
import './Mainbar.css';
import { assets } from '../Images/assets';

function MainBar({ messages, inputValue, onInputChange, onSendMessage, isLoading, onNewChat }) {
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages change or when loading
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSend = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (inputValue.trim()) {
      onSendMessage(inputValue);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleNewChatClick = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <div className="nav-left">
          <img 
            src={assets.advisorop_logo} 
            alt="AdvisorOP Logo" 
            className="logo" 
            onClick={handleNewChatClick}
            title="Click to start a new chat"
          />
          <p>AdvisorOP</p>
        </div>
      </div>
      <div className="main-container">
        {messages.length === 0 ? (
          <div className="greet">
            <p>Hey how can I help you today?</p>
          </div>
        ) : (
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.is_user ? 'user-message' : 'ai-message'}`}>
                <div className="message-content" dangerouslySetInnerHTML={{ __html: msg.text || msg.response }}></div>
              </div>
            ))}
            {isLoading && (
              <div className="loading-indicator">
                  <div className="loader"></div>
                  <p>AdvisorOP is thinking...</p>
              </div>
            )}
          </div>        )}
      </div>
      <div className="main-bottom">
        <form className="search" onSubmit={handleSend}>
          <textarea 
            ref={textareaRef}
            onChange={onInputChange} 
            onKeyPress={handleKeyPress} 
            value={inputValue} 
            placeholder='Type here...'
            rows="1"
          />
          <img src={assets.send_icon} alt="Send" onClick={handleSend} />
        </form>
      </div>
    </div>
  );
}

export default MainBar;
