import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./StudentView.css";

const socket = io("http://localhost:5000"); // Use env variable or config for production

export default function StudentView() {
  const [name, setName] = useState(sessionStorage.getItem("studentName") || "");
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [kicked, setKicked] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.emit("checkPoll");

    socket.on("newPoll", (pollData) => {
      setPoll(pollData);
      setResults(null);
      setTimeLeft(pollData.duration || 60);
      setSelectedOption("");
    });

    socket.on("pollResults", (data) => {
      setResults(data);
      setPoll(null);
    });

    socket.on("kickedOut", () => {
      setKicked(true);
      sessionStorage.removeItem("studentName");
    });

    socket.on("updateParticipants", (list) => setParticipants(list));
    socket.on("chatMessage", (msg) => setChatMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("newPoll");
      socket.off("pollResults");
      socket.off("kickedOut");
      socket.off("updateParticipants");
      socket.off("chatMessage");
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (poll && timeLeft > 0 && !results) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && poll) {
      socket.emit("timeout", { studentName: name });
    }
  }, [timeLeft, poll, results, name]);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const submitAnswer = () => {
    if (!selectedOption) {
      alert("Please select an option");
      return;
    }
    socket.emit("submitAnswer", { studentName: name, option: selectedOption });
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      socket.emit("chatMessage", { sender: name, message: chatInput.trim() });
      setChatInput("");
    }
  };

  const handleJoin = () => {
    if (name.trim()) {
      sessionStorage.setItem("studentName", name.trim());
      socket.emit("registerStudent", name.trim());
    }
  };

  if (kicked) {
    return (
      <div className="student-container">
        <div className="kicked-card" role="alert" aria-live="assertive">
          <h2>👋 You’ve been Kicked Out!</h2>
          <p>The teacher has removed you from the poll system.</p>
        </div>
      </div>
    );
  }

  if (!sessionStorage.getItem("studentName")) {
    return (
      <div className="student-container">
        <div className="name-card">
          <h1>Enter Your Name</h1>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
            aria-label="Enter your name"
          />
          <button onClick={handleJoin} disabled={!name.trim()}>
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-container">
      <h1>🎤 Intervue Poll</h1>

      {poll && !results ? (
        <div className="poll-card" role="region" aria-live="polite" aria-atomic="true" tabIndex="0">
          <h2>{poll.question}</h2>
          <p className="timer" aria-label={`Time left: ${timeLeft} seconds`}>
            ⏰ Time left: {timeLeft}s
          </p>
          <form>
            {poll.options.map((opt, i) => (
              <label key={i} className="option" tabIndex="0">
                <input
                  type="radio"
                  name="poll"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={() => setSelectedOption(opt)}
                  aria-checked={selectedOption === opt}
                />
                {opt}
              </label>
            ))}
          </form>
          <button className="submit-btn" onClick={submitAnswer} disabled={!selectedOption}>
            Submit Answer
          </button>
        </div>
      ) : results ? (
        <div className="results-card" role="region" aria-live="polite" aria-atomic="true" tabIndex="0">
          <h2>📊 Live Results</h2>
          {Object.entries(results.answers).map(([student, ans], idx) => (
            <p key={idx}>
              <strong>{student}:</strong> {ans}
            </p>
          ))}
        </div>
      ) : (
        <p className="waiting-msg">⏳ Waiting for teacher to ask a question...</p>
      )}

      <div className="participants" aria-label="Participants list">
        <h3>👥 Participants</h3>
        {participants.length ? (
          participants.map((p, idx) => (
            <p key={idx} tabIndex="0" aria-label={`Participant: ${p.name}`}>
              {p.name}
            </p>
          ))
        ) : (
          <p>No participants yet.</p>
        )}
      </div>

      <div className="chat-box" aria-label="Chat box">
        <h3>💬 Chat</h3>
        <div className="chat-messages" aria-live="polite" aria-relevant="additions">
          {chatMessages.map((m, i) => (
            <p key={i}>
              <strong>{m.sender}:</strong> {m.message}
            </p>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            aria-label="Type your chat message"
          />
          <button onClick={sendMessage} disabled={!chatInput.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
