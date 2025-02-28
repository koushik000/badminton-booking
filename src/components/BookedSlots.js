import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BookedSlots({ userEmail }) {
    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userEmail) {
            navigate('/'); // Redirect to home if not logged in
        } else {
            fetchUserBookings();
        }
    }, [userEmail, navigate]);

    const fetchUserBookings = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/bookings?email=${userEmail}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
        }
    };

    return (
        <div className="container">
            <h2>Your Booked Slots</h2>
            {bookings.length > 0 ? (
                <ul>
                    {bookings.map((booking, index) => (
                        <li key={index}>
                            Court {booking.court} booked on {booking.date} for {booking.time}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bookings yet.</p>
            )}
        </div>
    );
}

export default BookedSlots;
