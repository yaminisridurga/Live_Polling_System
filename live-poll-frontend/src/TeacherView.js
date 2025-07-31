import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./TeacherView.css";

const socket = io("http://localhost:5000");

export default function TeacherView() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(60);
  const [pollActive, setPollActive] = useState(false);
  const [results, setResults] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [pollHistory, setPollHistory] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("pollResults", (data) => {
      setResults(data);
      setPollActive(false);
    });
    socket.on("updateParticipants", (list) => setParticipants(list));
    socket.on("chatMessage", (msg) => setChatMessages((prev) => [...prev, msg]));
    socket.on("pollHistory", (history) => setPollHistory(history));

    return () => {
      socket.off("pollResults");
      socket.off("updateParticipants");
      socket.off("chatMessage");
      socket.off("pollHistory");
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const addOption = () => setOptions([...options, ""]);

  const startPoll = () => {
    if (!question.trim() || options.some((o) => !o.trim())) {
      alert("Please enter the question and all options.");
      return;
    }
    socket.emit("createPoll", { question, options, duration });
    setPollActive(true);
    setResults(null);
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      socket.emit("chatMessage", { sender: "Teacher", message: chatInput.trim() });
      setChatInput("");
    }
  };

  const kickStudent = (name) => {
    if (window.confirm(`Are you sure you want to kick ${name}?`)) {
      socket.emit("kickStudent", name);
    }
  };

  const fetchHistory = () => socket.emit("getPollHistory");

  return (
    <div className="teacher-container">
      <h1>👩‍🏫 Teacher Dashboard</h1>

      {/* Poll Creation Area */}
      <section className="poll-box" aria-labelledby="poll-creation-label">
        <h2 id="poll-creation-label" className="sr-only">
          Create a Poll
        </h2>
        <div className="poll-row">
          <input
            className="question-input"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={pollActive}
            aria-label="Poll question input"
            autoComplete="off"
          />
          <div className="timer">
            <input
              type="number"
              min={10}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={pollActive}
              aria-label="Poll duration in seconds"
            />
            <span>seconds</span>
          </div>
        </div>
        {options.map((opt, i) => (
          <div key={i} className="option-line">
            <input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const updated = [...options];
                updated[i] = e.target.value;
                setOptions(updated);
              }}
              disabled={pollActive}
              aria-label={`Option ${i + 1}`}
              autoComplete="off"
            />
          </div>
        ))}
        {!pollActive && (
          <button
            type="button"
            className="btn add-option-btn"
            onClick={addOption}
            aria-label="Add more options"
          >
            + Add More Option
          </button>
        )}
        <button
          type="button"
          className="btn start-poll-btn"
          onClick={startPoll}
          disabled={pollActive}
          aria-disabled={pollActive}
          aria-live="assertive"
        >
          Ask Question
        </button>
      </section>

      {/* Dashboard cards row */}
      <section className="dashboard-cards" aria-live="polite">
        <article className="card live-results-card" aria-label="Live poll results">
          <h3>📊 Live Results</h3>
          {results ? (
            Object.entries(results.answers).map(([student, ans]) => (
              <p key={student} tabIndex="0">
                <strong>{student}:</strong> {ans}
              </p>
            ))
          ) : (
            <p tabIndex="0" className="no-poll-msg">
              No active poll.
            </p>
          )}
        </article>

        <article className="card participants-card" aria-label="Participants list">
          <h3>👥 Participants</h3>
          <div className="participants-list">
            {participants.length > 0 ? (
              participants.map((p, idx) => (
                <div key={idx} className="participant-item">
                  <span tabIndex="0">{p.name}</span>
                  <button
                    type="button"
                    className="kick-btn"
                    onClick={() => kickStudent(p.name)}
                    aria-label={`Kick ${p.name}`}
                  >
                    Kick
                  </button>
                </div>
              ))
            ) : (
              <p tabIndex="0" className="no-participants-msg">
                No participants yet.
              </p>
            )}
          </div>
        </article>

        <article className="card chat-card" aria-label="Chat area">
          <h3>💬 Chat</h3>
          <div className="chat-messages" aria-live="polite" aria-relevant="additions">
            {chatMessages.length > 0 ? (
              chatMessages.map((m, i) => (
                <p key={i} tabIndex="0">
                  <strong>{m.sender}:</strong> {m.message}
                </p>
              ))
            ) : (
              <p className="no-chat-msg">No messages yet.</p>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
              aria-label="Type chat message"
              onKeyDown={(e) => {
                if (e.key === "Enter" && chatInput.trim()) sendMessage();
              }}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn send-chat-btn"
              onClick={sendMessage}
              disabled={!chatInput.trim()}
              aria-disabled={!chatInput.trim()}
            >
              Send
            </button>
          </div>
        </article>

        <article className="card poll-history-card" aria-label="Poll history">
          <h3>🕘 Poll History</h3>
          <button
            type="button"
            className="btn view-history-btn"
            onClick={fetchHistory}
            aria-label="View poll history"
          >
            View Poll History
          </button>
          {pollHistory.length > 0 ? (
            pollHistory.map((h, i) => (
              <div key={i} className="history-item" tabIndex="0">
                <strong>{h.question}</strong>
                <pre>{JSON.stringify(h.answers, null, 2)}</pre>
              </div>
            ))
          ) : (
            <p className="no-history-msg" tabIndex="0">
              No poll history available.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
