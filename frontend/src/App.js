import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventManager from './components/EventManager';
import AttendeeManager from './components/AttendeeManager';
import TaskTracker from './components/TaskTracker';
import Home from './components/Home';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventManager />} />
        <Route path="/attendees" element={<AttendeeManager />} />
        <Route path="/tasks" element={<TaskTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
