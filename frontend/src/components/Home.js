import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import '../assets/home.css'; // Import the CSS file for styling

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Event Management</h1>
            </header>
            <div className="home-content">
                <h2>Welcome to the Event Management Dashboard</h2>
                <p>Manage your events, attendees, and tasks with ease.</p>
                <div className="home-links">
                    <Link to="/events" className="home-link">Events</Link>
                    <Link to="/attendees" className="home-link">Attendees</Link>
                    <Link to="/tasks" className="home-link">Tasks</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
