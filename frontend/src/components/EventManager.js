import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';  // Import the Calendar component
import 'react-calendar/dist/Calendar.css';  // Import the Calendar styles
import '../assets/event.css';  // Import the CSS file for styling

function EventManager() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
  });
  const [editIndex, setEditIndex] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);  // State to toggle calendar visibility

  // Fetch events when the component loads
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setEvents(data);  // Set fetched events to state
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.description || !formData.location || !formData.date) {
      alert('Please fill all fields!');
      return;
    }

    try {
      if (editIndex !== null) {
        // Update event
        const updatedEvent = { ...formData, id: events[editIndex].id };
        await updateEvent(updatedEvent);
        setEditIndex(null); // Reset edit mode
      } else {
        // Add new event to the database
        await addEvent(formData);
      }
    } catch (error) {
      console.error('Error handling form submission:', error);
    }

    // Clear the form
    setFormData({
      name: '',
      description: '',
      location: '',
      date: '',
    });
  };

  const getEventForDate = (date) => {
    // Find event that matches the date
    const event = events.find((event) => new Date(event.date).toDateString() === date.toDateString());
    return event ? event.name : '';  // Return event name or empty string
  };

  const tileContent = ({ date, view }) => {
    // Only show event names on 'month' view
    if (view === 'month') {
      const eventName = getEventForDate(date);
      return eventName ? <div className="event-name">{eventName}</div> : null;
    }
    return null;
  };

  const addEvent = async (event) => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),  // Event data to be sent to the backend
      });
  
      if (response.ok) {
        const newEvent = await response.json();
        setEvents((prevEvents) => [...prevEvents, newEvent]);  // Add the new event to the state
      } else {
        console.error('Failed to add event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const updateEvent = async (updatedEvent) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        // Refresh events after updating
        fetchEvents();
      } else {
        console.error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleEditEvent = (index) => {
    setEditIndex(index);
    setFormData(events[index]);
  };

  const handleDeleteEvent = async (index) => {
    const eventId = events[index].id;
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh events after deletion
        fetchEvents();
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Toggle the calendar view
  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  // Function to format events for the calendar
  const getEventDates = () => {
    return events.map(event => new Date(event.date));
  };

  return (
    <div className='event-manager'>
      <h1>Event Management</h1>
      
      <div className="event-manager-header">
        {/* Button to toggle calendar view */}
        <button
          className="calendar-toggle-button"
          onClick={handleCalendarToggle}
          tileContent={tileContent}
        >
          {showCalendar ? 'Close Calendar' : 'Open Calendar'}
        </button>
      </div>

      {/* Display calendar when showCalendar is true */}
      {showCalendar && (
        <div className="calendar-container">
          <Calendar
            tileClassName={({ date }) => {
              // Check if the date matches any event's date
              const eventDates = getEventDates();
              return eventDates.some(eventDate => eventDate.toDateString() === date.toDateString())
                ? 'event-day' : null; // Add class 'event-day' if the date has an event
            }}
            tileContent={tileContent}
          />
        </div>
      )}

      {/* Render the form to add/edit events */}
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Event Description"
          value={formData.description}
          onChange={handleInputChange}
          required
        ></textarea>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{editIndex !== null ? 'Update Event' : 'Add Event'}</button>
      </form>

      <h2>Event List</h2>
      {events.length === 0 ? (
        <p>No events yet. Start by adding one!</p>
      ) : (
        <ul className='event-list'>
          {events.map((event, index) => (
            <li key={event.id} className="event-item">
              <strong><h3>{event.name}</h3></strong>
              <div className='description'>{event.description}</div>
              <p>{event.location} - {event.date}</p>
              <div className='buttons'>
                <button onClick={() => handleEditEvent(index)}>Edit</button>
                <button onClick={() => handleDeleteEvent(index)}>Delete</button>
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
}

export default EventManager;
