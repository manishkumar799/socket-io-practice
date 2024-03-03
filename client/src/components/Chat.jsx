import React, { useState, useEffect } from "react";
import socket from "../socket";
import User from "./User";
import MessagePanel from "./MessagePanel";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const onMessage = (content) => {
    if (selectedUser) {
      socket.emit("private message", {
        content,
        to: selectedUser.userID,
      });
      setSelectedUser((prevUser) => ({
        ...prevUser,
        messages: [
          ...prevUser.messages,
          {
            content,
            fromSelf: true,
          },
        ],
      }));
    }
  };

  const onSelectUser = (user) => {
    setSelectedUser(user);
    user.hasNewMessages = false;
  };

  useEffect(() => {
    socket.on("connect", () => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.self ? { ...user, connected: true } : user
        )
      );
    });

    socket.on("disconnect", () => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.self ? { ...user, connected: false } : user
        )
      );
    });

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
    };

    socket.on("users", (newUsers) => {
      const updatedUsers = newUsers.map((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userID;
        });
        const existingUser = users.find((existingUser) =>
          existingUser.userID === user.userID
        );
        if (existingUser) {
          existingUser.connected = user.connected;
          existingUser.messages = user.messages;
          return existingUser;
        }
        user.self = user.userID === socket.userID;
        initReactiveProperties(user);
        return user;
      });
      const sortedUsers = updatedUsers.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      setUsers(sortedUsers);
    });

    socket.on("user connected", (user) => {
      const updatedUsers = users.map((existingUser) =>
        existingUser.userID === user.userID
          ? { ...existingUser, connected: true }
          : existingUser
      );
      setUsers(updatedUsers);
    });

    socket.on("user disconnected", (id) => {
      const updatedUsers = users.map((user) =>
        user.userID === id ? { ...user, connected: false } : user
      );
      setUsers(updatedUsers);
    });

    socket.on("private message", ({ content, from, to }) => {
      const updatedUsers = users.map((user) => {
        const fromSelf = socket.userID === from;
        if (user.userID === (fromSelf ? to : from)) {
          const updatedUser = {
            ...user,
            messages: [
              ...user.messages,
              {
                content,
                fromSelf,
              },
            ],
          };
          if (user !== selectedUser) {
            updatedUser.hasNewMessages = true;
          }
          return updatedUser;
        }
        return user;
      });
      setUsers(updatedUsers);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
      socket.off("private message");
    };
  }, [selectedUser, users]);

  return (
    <div>
      <div className="left-panel">
        {users.map((user) => (
          <User
            key={user.userID}
            user={user}
            selected={selectedUser === user}
            onSelect={() => onSelectUser(user)}
          />
        ))}
      </div>
      <MessagePanel
        user={selectedUser}
        onInput={onMessage}
        className="right-panel"
      />
    </div>
  );
};

export default Chat;
