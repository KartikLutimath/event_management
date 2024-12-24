import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/attendee.css'; 

function AttendeeManager() {
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendeeName, setAttendeeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [attendeeId, setAttendeeId] = useState('');

  // Fetch attendees, events, and tasks from the backend
  useEffect(() => {
    fetchAttendees();
    fetchEvents();
  }, []);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/attendees');
      setAttendees(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error fetching attendees!');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
    } catch (error) {
      alert('Error fetching events!');
    }
  };

  const fetchTasks = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks/${eventId}`);
      setTasks(response.data);
    } catch (error) {
      alert('Error fetching tasks!');
    }
  };

  const handleAddAttendee = async () => {
    if (!attendeeName) {
      alert('Please enter a name!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/attendees', { name: attendeeName });
      setAttendees([...attendees, response.data]);
      setAttendeeName('');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error adding attendee!');
    }
  };

  const handleRemoveAttendee = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/attendees/${id}`);
      setAttendees(attendees.filter((attendee) => attendee.id !== id));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error removing attendee!');
    }
  };

  const handleAssignToTask = async () => {
    if (!selectedEvent || !selectedTask || !attendeeId) {
      alert('Please select event, task, and attendee!');
      return;
    }

    try {
      setLoading(true);
      // Send the assignment data to the backend
      await axios.post(`http://localhost:5000/api/assign-attendee-task`, {
        attendeeId,
        taskId: selectedTask,
      });
      alert(`Assigned attendee ${attendeeId} to task ${selectedTask}`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error assigning attendee to task!');
    }
  };

  return (
    <div className='attendee-manager'>
      <h1>Attendee Management</h1>
      <input
        type="text"
        placeholder="Attendee Name"
        value={attendeeName}
        onChange={(e) => setAttendeeName(e.target.value)}
      />
      <button onClick={handleAddAttendee} disabled={loading}>
        {loading ? 'Adding...' : 'Add Attendee'}
      </button>

      <h2>Attendee List</h2>
      {loading ? (
        <p>Loading attendees...</p>
      ) : attendees.length === 0 ? (
        <p>No attendees added yet.</p>
      ) : (
        <ul>
          {attendees.map((attendee) => (
            <li key={attendee.id}>
              {attendee.name}
              <button onClick={() => handleRemoveAttendee(attendee.id)} disabled={loading}>
                {loading ? 'Removing...' : 'Remove'}
              </button>
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  fetchTasks(e.target.value); // Fetch tasks for selected event
                }}
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">Select Task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
              <button onClick={() => setAttendeeId(attendee.id)}>Select Attendee</button>
              <button onClick={handleAssignToTask} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign to Task'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; 2024 Event Management. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AttendeeManager;
