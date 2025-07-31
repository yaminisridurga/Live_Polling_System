import React, { useState } from "react";
import TeacherView from "./TeacherView";
import StudentView from "./StudentView";
import "./App.css";

export default function App() {
  const [role, setRole] = useState("");

  if (role === "teacher") return <TeacherView />;
  if (role === "student") return <StudentView />;

  return (
    <div className="app-container">
      <div className="poll-card">
        <div className="poll-header">Intervue Poll</div>
        <h1>Welcome to the Live Polling System</h1>
        <p className="subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-options">
          <div
            className={`role-card ${role === "student" ? "selected" : ""}`}
            onClick={() => setRole("student")}
          >
            <h3>I’m a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div
            className={`role-card ${role === "teacher" ? "selected" : ""}`}
            onClick={() => setRole("teacher")}
          >
            <h3>I’m a Teacher</h3>
            <p>Submit answers and view live poll results in real-time.</p>
          </div>
        </div>

        <button
          className="continue-btn"
          onClick={() => {
            if (!role) alert("Please select a role to continue");
            else setRole(role);
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
