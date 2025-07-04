import React, { useState } from "react";
import "./Sidebar.css";
import { assets } from "../Images/assets";

function SideBar({ handleNewChat, onToggle }) {
  const [extended, setExtended] = useState(false);

  const toggleSidebar = () => {
    const newExtended = !extended;
    setExtended(newExtended);
    if (onToggle) {
      onToggle(newExtended);
    }
  };

  return (
    <div className={`sidebar ${extended ? "extended" : ""}`}>
      <div className="top">
        <img
          onClick={toggleSidebar}
          className="menu-icon"
          src={assets.menu_icon}
          alt="Menu"
        />
        <div onClick={handleNewChat} className="new-chat">
          <img src={assets.plus_icon} alt="New Chat" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>
            <div className="recent-entry">
              <img src={assets.message_icon} alt="Message" />
              <p>What is React...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SideBar;
