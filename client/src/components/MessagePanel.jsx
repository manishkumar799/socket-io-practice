import React, { useState } from "react";
import StatusIcon from "./StatusIcon";

function MessagePanel({ user, onInput }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onInput(input);
    setInput("");
  };

  const displaySender = (message, index) =>
    index === 0 ||
    user.messages[index - 1].fromSelf !== user.messages[index].fromSelf;

  const isValid = input.length > 0;

  return (
    <div>
      <div className="header">
        <StatusIcon connected={user.connected} />
        {user.username}
      </div>

      <ul className="messages">
        {user.messages.map((message, index) => (
          <li key={index} className="message">
            {displaySender(message, index) && (
              <div className="sender">
                {message.fromSelf ? "(yourself)" : user.username}
              </div>
            )}
            {message.content}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your message..."
          className="input"
        />
        <button disabled={!isValid} className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default MessagePanel;
