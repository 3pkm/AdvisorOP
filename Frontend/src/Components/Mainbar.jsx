import React, { useState, useEffect, useRef } from "react"; // Added useEffect and useRef
import "./MainBar.css";
import { assets } from "../Images/assets";

// MainBar now receives props from App.jsx for chat functionality
function MainBar({ messages, inputValue, charCount, onInputChange, onSendMessage, isLoading }) { // Added isLoading to props
  // searchQuery state is now controlled by App.jsx as inputValue
  // const [searchQuery, setSearchQuery] = useState("");
  const chatContainerRef = useRef(null); // For auto-scrolling

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue); // Call the handler passed from App.jsx
    // Input clearing will be handled by App.jsx after optimistic update
  };

  return (
    <div className="main">
      <div className="nav">
        {/* <img src={assets.logo_icon} alt="Logo" /> Commented out or replace as needed */}
        <p>Athena - AI Reasoning Therapist</p> {/* App Name */}
        <img src={assets.user_icon} alt="User" />
      </div>

      {/* Chat messages display area */}
      <div className="main-container" ref={chatContainerRef}>
        {messages && messages.length > 0 ? (
          <div className="chat-messages">
            {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.is_user ? 'user-message' : 'ai-message'}`}>
            {!msg.is_user && (
              <img src={assets.gemini_icon} alt="Athena" className="message-icon" />
            )}
            <div className="message-content">
              <span className="message-sender">{msg.is_user ? 'You' : 'Athena'}: </span>
              <span dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
            {msg.is_user && (
              <img src={assets.user_icon} alt="User" className="message-icon" />
            )}
            <span className="message-timestamp">{msg.timestamp}</span>
          </div>
        ))}
        {isLoading && <div className="loading-indicator">Athena is typing...</div>}
          </div>
        ) : (
          <div className="greet">
            <p>
              <span>Good Morning.</span> {/* Or a dynamic greeting */}
            </p>
            <p>What can I do for you?</p>
          </div>
        )}
      </div>

      <div className="bottom">
        <form className="search" onSubmit={handleSearchSubmit}>
          {/* <img src={assets.plus_icon} alt="Clip" /> */}
          <input
            type="text"
            placeholder="Type Here..."
            value={inputValue} // Controlled by App.jsx
            onChange={onInputChange} // Handler from App.jsx
          />
          <img
            src={assets.send_icon}
            alt="Send"
            onClick={handleSearchSubmit} // Use the same submit handler
            style={{ cursor: 'pointer' }} // Make it look clickable
          />
        </form>
        {/* Display charCount if needed */}
        {/* <div className="char-counter-display">Char Count: {charCount}</div> */}
      </div>
    </div>
  );
}

export default MainBar;
