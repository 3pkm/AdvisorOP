import React, { useState } from "react";
import "./SideBar.css";
import { assets } from "../Images/assets";

// SideBar now receives handleNewChat prop from App.jsx
function SideBar({ handleNewChat }) {
  const [extended, setExtended] = useState(false);

  const newChatClickHandler = () => {
    // Call the function passed from App.jsx to handle new chat logic
    if (handleNewChat) {
      handleNewChat();
    }
    // Optionally, you might want to ensure the sidebar is extended or collapsed
    // setExtended(true); // or false, depending on desired UX
  };

  return (
    <div className={`sidebar ${extended ? "extended" : "collapsed"}`}>
      {/* Top Section */}
      <div className="top">
        <div className="menu">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu-icon"
          src={assets.menu_icon}
          alt="Menu"
          title="Toggle Sidebar"
        />
      </div>
      <div className="new-chat-collapsed" onClick={newChatClickHandler} style={{cursor: 'pointer', marginTop: '1rem'}}>
        <img className="icon" src={assets.plus_icon} alt="New Chat" title="New Chat" />
      </div>

        {/* Conditionally render based on extended state */}
        {extended && (
          <>
            <div className="new-chat" onClick={newChatClickHandler} style={{cursor: 'pointer'}}>
              <img className="icon" src={assets.plus_icon} alt="New Chat" />
              <p>New Chat</p>
            </div>

            <div className="recent">
              <p className="recent-title">Recent</p>
              {/* Placeholder for recent conversations - this would need state management */}
              <div className="recent-entry">
                <img className="icon" src={assets.message_icon} alt="Message" />
                <p>Example Chat...</p>
              </div>
            </div>
          </>
        )}
        {!extended && (
            <div className="new-chat-collapsed" onClick={newChatClickHandler} style={{cursor: 'pointer', marginTop: '1rem'}}>
                 <img className="icon" src={assets.plus_icon} alt="New Chat" />
            </div>
        )}
      </div>

      {/* Bottom Section - Conditionally render based on extended state */}
      {extended && (
        <div className="bottom">
          <div className="bottom-item">
            <img className="icon" src={assets.question_icon} alt="Help" />
            <p>Help</p>
          </div>

          <div className="bottom-item">
            <img className="icon" src={assets.history_icon} alt="History" />
            <p>History</p>
          </div>

          <div className="bottom-item">
            <img className="icon" src={assets.setting_icon} alt="Settings" />
            <p>Settings</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBar;
