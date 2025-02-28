import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import Login from './components/Login';
import Register from './components/Register';
import BookedSlots from './components/BookedSlots'; // Create this component
import './App.css';
import axios from 'axios';

function App() {
    const [userEmail, setUserEmail] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            setUserEmail(email);
        }
    }, []);

    const handleLogin = (email) => {
        setUserEmail(email);
        setIsRegistering(false);
        localStorage.setItem('userEmail', email);
    };

    const handleLogout = () => {
        setUserEmail('');
        localStorage.removeItem('userEmail');
    };

    return (
        <Router>
            <div className="app-container">
                {/* Sidebar */}
                <div className="sidebar">
                    {userEmail && (
                        <>
                            <Link to="/booked-slots">
                                <button>Booked Slots</button>
                            </Link>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                userEmail ? (
                                    <BookingForm userEmail={userEmail} />
                                ) : isRegistering ? (
                                    <Register onRegister={handleLogin} />
                                ) : (
                                    <div>
                                        <Login onLogin={handleLogin} />
                                        <button onClick={() => setIsRegistering(true)}>Register</button>
                                    </div>
                                )
                            }
                        />
                        <Route path="/booked-slots" element={<BookedSlots userEmail={userEmail} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
