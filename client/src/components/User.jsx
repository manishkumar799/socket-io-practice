import React from "react";
import StatusIcon from "./StatusIcon";

function User({ user, selected, onSelect }) {
  const handleClick = () => {
    onSelect(user);
  };

  return (
    <div className={`user ${selected ? 'selected' : ''}`} onClick={handleClick}>
      <div className="description">
        <div className="name">
          {user.username} {user.self ? " (yourself)" : ""}
        </div>
        <div className="status">
          <StatusIcon connected={user.connected} />{user.connected ? "online" : "offline"}
        </div>
      </div>
      {user.hasNewMessages && <div className="new-messages">!</div>}
    </div>
  );
}

export default User;
