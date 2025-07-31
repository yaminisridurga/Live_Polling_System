# 🎯 Live Polling System

A real-time web application that allows **Teachers** to create live polls and **Students** to respond instantly. Designed for interactive classrooms, training sessions, or virtual meetups.

---

## 👥 User Roles

### 🧑‍🏫 Teacher
- Create new polls.
- View live poll results 📊.
- Ask new questions only when all students have answered or no poll is active.
- (Optional) Set custom poll duration ⏱️.
- (Optional) Remove a student 🚫.
- (Bonus) View past poll results 🗂️.

### 🧑‍🎓 Student
- Enter a name (unique per tab) 📝.
- Submit answers ✅ within 60 seconds.
- View live results after answering or when the timer ends.
- Each tab acts as a new student, but refresh retains the name.

---

## ⚙️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) ⚛️
  - Optional: [Redux](https://redux.js.org/) for state management
- **Backend**: [Express.js](https://expressjs.com/) 🚀
- **Real-time Communication**: [Socket.IO](https://socket.io/) 🔌

---

## 🌐 Features

- Real-time polling experience for students and teachers.
- Auto-updating poll results.
- Unique tab-based student identity.
- 60-second timer for answering.
- Fully responsive UI 🎨.

---

## ✨ Nice-to-Haves

- Teacher-configurable poll time ⌛.
- Student removal option.
- Chat popup for live interaction 💬.
- Past poll history (not from localStorage) 🗂️.

---


