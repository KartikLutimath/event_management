import React, { useState, useEffect } from "react";
import "../assets/task.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState({
    name: "",
    deadline: "",
    status: "Pending",
    event_id: "",
    attendee_id: "",
  });
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events and attendees when the component mounts
  useEffect(() => {
    const fetchEventsAndAttendees = async () => {
      try {
        const eventResponse = await fetch("/api/events"); // Adjust the API path if necessary
        const attendeeResponse = await fetch("/api/attendees");

        if (eventResponse.ok && attendeeResponse.ok) {
          const eventsData = await eventResponse.json();
          const attendeesData = await attendeeResponse.json();
          setEvents(eventsData);
          setAttendees(attendeesData);
        } else {
          console.error("Failed to fetch events or attendees");
        }
      } catch (error) {
        console.error("Error fetching events or attendees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndAttendees();
  }, []);

  // Fetch tasks for the selected event when event_id changes
  useEffect(() => {
    if (taskData.event_id) {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`/api/tasks/${taskData.event_id}`);
          if (response.ok) {
            const data = await response.json();
            setTasks(data);
          } else {
            console.error("Failed to fetch tasks for event");
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }
  }, [taskData.event_id]);

  // Handle input changes for task data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission to create a new task
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (
      !taskData.name ||
      !taskData.deadline ||
      !taskData.event_id ||
      !taskData.attendee_id
    ) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setTaskData({
          name: "",
          deadline: "",
          status: "Pending",
          event_id: "",
          attendee_id: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to add task: ${errorData.message}`);
      }
    } catch (error) {
      alert("Error creating task");
      console.error("Error creating task:", error);
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId, status) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      } else {
        console.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Assign an attendee to a task
  const handleAssignAttendeeToTask = async (taskId, attendeeId) => {
    try {
      const response = await fetch("/api/assign-attendee-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendeeId, taskId }),
      });

      if (response.ok) {
        alert("Attendee assigned to task");
      } else {
        const errorData = await response.json();
        alert(`Error assigning attendee: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error assigning attendee:", error);
    }
  };

  return (
    <div className="event-manager">
      <h2 className="task-manager-header">Task Manager</h2>

      {/* Select Event Dropdown */}
      <div className="form-group">
        <label htmlFor="event_id" className="select-event-label">Select Event:</label>
        <select
          id="event_id"
          name="event_id"
          value={taskData.event_id}
          onChange={handleInputChange}
          className="form-control select-dropdown"
        >
          <option value="">--Select Event--</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleFormSubmit} className="task-form">
        <div className="form-list">
          <label htmlFor="name">Task Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={taskData.name}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="form-list">
          <label htmlFor="deadline">Deadline:</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={taskData.deadline}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="form-list">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={taskData.status}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Select Attendee Dropdown */}
        <div className="form-list">
          <label htmlFor="attendee_id">Assign Attendee:</label>
          <select
            id="attendee_id"
            name="attendee_id"
            value={taskData.attendee_id}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">--Select Attendee--</option>
            {attendees.map((attendee) => (
              <option key={attendee.id} value={attendee.id}>
                {attendee.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </form>

      {/* Task List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="event-list">
          {tasks.map((task) => (
            <li key={task.id} className="event-item">
              <h3>{task.name}</h3>
              <p>Deadline: {task.deadline}</p>
              <p>Status: {task.status}</p>
              <p>Event ID: {task.event_id}</p>
              <p>Attendee ID: {task.attendee_id}</p>
              <button
                onClick={() => handleTaskStatusUpdate(task.id, "Completed")}
                className="btn btn-secondary"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleTaskStatusUpdate(task.id, "Pending")}
                className="btn btn-secondary"
              >
                Mark as Pending
              </button>

              {/* Assign Attendee to Task */}
              <div className="form-group">
                <label htmlFor="attendee_select">Assign Attendee:</label>
                <select
                  id="attendee_select"
                  className="form-control"
                  onChange={(e) =>
                    handleAssignAttendeeToTask(task.id, e.target.value)
                  }
                >
                  <option value="">Select Attendee</option>
                  {attendees.map((attendee) => (
                    <option key={attendee.id} value={attendee.id}>
                      {attendee.name}
                    </option>
                  ))}
                </select>
              </div>
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
};

export default TaskManager;
