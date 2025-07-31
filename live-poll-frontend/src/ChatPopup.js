import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatPopup({ userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("sendMessage", input);
      setInput("");
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Chat</button>
      {open && (
        <div style={{
          position: "fixed", bottom: "20px", right: "20px",
          background: "#fff", border: "1px solid #ccc", padding: "10px",
          width: "250px", height: "300px", overflowY: "auto"
        }}>
          <div>
            {messages.map((msg, i) => (
              <p key={i}><b>{msg.name}:</b> {msg.message}</p>
            ))}
          </div>
          <input value={input} onChange={(e) => setInput(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
