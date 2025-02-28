// src/components/BookingForm.js

import React, { useEffect, useState } from 'react';
import SlotList from './SlotList';
import moment from 'moment';

const BookingForm = ({ userEmail, addBooking }) => {
    const [selectedDate, setSelectedDate] = useState(moment().add(1, 'days').format('YYYY-MM-DD')); // Initialize to tomorrow
    const [tomorrow, setTomorrow] = useState('');

    useEffect(() => {
        // Set tomorrow's date - not needed since we set it directly above
        const nextDay = moment().add(1, 'days').format('YYYY-MM-DD');
        setTomorrow(nextDay);
    }, []);

    return (
        <div>
            <input
                type="date"
                value={selectedDate} // controlled input
                onChange={(e) => setSelectedDate(e.target.value)}
                min={selectedDate} // Keep it as tomorrow
                max={selectedDate} // Limit it to tomorrow
                readOnly // Optional: Makes it read-only so users cannot change it
            />
            <SlotList date={selectedDate} userEmail={userEmail} addBooking={addBooking} />
        </div>
    );
};

export default BookingForm;