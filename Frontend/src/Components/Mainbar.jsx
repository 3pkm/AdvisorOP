import React, { useEffect, useRef } from 'react';
import './Mainbar.css';
import { assets } from '../Images/assets';

function MainBar({ messages, inputValue, onInputChange, onSendMessage, isLoading, sidebarExtended }) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (inputValue.trim()) {
      onSendMessage(inputValue);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>AdvisorOP</p>
        <img src={assets.user_icon} alt="User" />
      </div>
      <div className="main-container">
        {messages.length === 0 ? (
          <div className="greet">
            <p><span>Hello, Dev.</span></p>
            <p>How can I help you today?</p>
          </div>
        ) : (
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.is_user ? 'user-message' : 'ai-message'}`}>
                <img src={msg.is_user ? assets.user_icon : assets.gemini_icon} alt="" className="message-icon" />
                <div className="message-content" dangerouslySetInnerHTML={{ __html: msg.text || msg.response }}></div>
              </div>
            ))}
            {isLoading && (
              <div className="loading-indicator">
                  <div className="loader"></div>
                  <p>Athena is thinking...</p>
              </div>
            )}
          </div>        )}
      </div>
      <div className={`main-bottom ${sidebarExtended ? 'extended-sidebar' : ''}`}>
        <form className="search" onSubmit={handleSend}>
          <input 
            onChange={onInputChange} 
            onKeyPress={handleKeyPress} 
            value={inputValue} 
            type="text" 
            placeholder='Enter a prompt here' 
          />
          <img src={assets.send_icon} alt="Send" onClick={handleSend} />
        </form>
      </div>
    </div>
  );
}

export default MainBar;
