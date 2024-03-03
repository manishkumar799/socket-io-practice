import React, { useState, useEffect } from "react";
import SelectUsername from "./components/SelectUsername";
import Chat from "./components/Chat";
import socket from "./socket";

function App() {
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");

    if (sessionID) {
      setUsernameAlreadySelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }

    socket.on("session", ({ sessionID, userID }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      socket.userID = userID;
    });

    const connectErrorListener = (err) => {
      if (err.message === "invalid username") {
        setUsernameAlreadySelected(false);
      }
    };

    socket.on("connect_error", connectErrorListener);

    return () => {
      socket.off("connect_error", connectErrorListener);
    };
  }, []);

  const handleUsernameSelection = (username) => {
    setUsernameAlreadySelected(true);
    socket.auth = { username };
    socket.connect();
  };

  return (
    <div id="app">
      {!usernameAlreadySelected && <SelectUsername onSubmit={handleUsernameSelection} />}
      {usernameAlreadySelected && <Chat />}
    </div>
  );
}

export default App;
