// src/components/Profile.js

import React from 'react';

const Profile = ({ bookings, onLogout }) => {
    return (
        <div>
            <h2>Your Bookings</h2>
            <button onClick={onLogout}>Logout</button>
            {bookings.length > 0 ? (
                <ul>
                    {bookings.map((booking, index) => (
                        <li key={index}>
                            Court {booking.court} booked on {booking.date} from {booking.time}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bookings yet.</p>
            )}
        </div>
    );
};

export default Profile;