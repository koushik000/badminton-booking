import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SlotList.css';

const SlotList = ({ date, userEmail, setBookings = () => {} }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Restricted time slots
    const restrictedTimes = {
        weekday: ["08:00 - 09:00", "13:00 - 14:00"],  // Weekdays & Saturday
        sunday: ["13:00 - 14:00"],                    // Sunday
    };

    // Function to determine if a slot is allowed
    const isSlotAllowed = (day, time) => {
        if (day === 6) return time < "13:00";  // Saturday: Only before 1 PM
        if (day === 0) return time < "10:00" || !restrictedTimes.sunday.includes(time); // Sunday: Only before 10 AM, except 1-2 PM
        return !restrictedTimes.weekday.includes(time); // Weekdays: Exclude break times
    };

    // Fetch slots
    const fetchSlots = async () => {
        if (!date) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const res = await axios.get(`http://localhost:3000/api/slots?date=${date}`);
            
            const filteredSlots = res.data.filter(slot => {
                const [startTime] = slot.time.split(" - ");
                const day = new Date(date).getDay(); // Get the day (0 = Sunday, 6 = Saturday)
                return isSlotAllowed(day, startTime);
            });

            setSlots(filteredSlots);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setError('Failed to load available slots. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [date]);

    // Book a slot
    const bookSlot = async (court, slotTime) => {
        if (!userEmail) {
            alert('Please log in to book a court.');
            return;
        }

        const bookingDetails = { date, time: slotTime, court, studentId: userEmail };

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:3000/api/book', bookingDetails);

            if (res.data.success || res.status === 200) {
                alert(res.data.message || 'Court booked successfully!');
                setBookings(prev => (Array.isArray(prev) ? [...prev, bookingDetails] : [bookingDetails]));

                // Optimistically update UI
                setSlots(prevSlots => prevSlots.map(slot => 
                    slot.time === slotTime ? { ...slot, courts: slot.courts.filter(c => c !== court) } : slot
                ));

                fetchSlots(); // Refresh slots
            } else {
                throw new Error(res.data.message || 'Booking failed');
            }
        } catch (error) {
            alert(error.response?.data?.message || error.message || 'Error booking the slot.');
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="slot-list-container">
            {loading && <div className="loading-message">Loading available slots...</div>}
            {error && <div className="error-message">{error}</div>}

            {slots.length > 0 ? (
                slots.map((slot) => (
                    <div key={slot.time} className="slot-container">
                        <div className="slot-header">
                            <div className="slot-time">{slot.time}</div>
                            <div>
                                <span className="courts-label">Available Courts:</span>
                                <div className="courts-available">
                                    {slot.courts.length > 0 ? (
                                        slot.courts.map(court => (
                                            <span key={court} className="court-badge">{court}</span>
                                        ))
                                    ) : (
                                        <span className="no-courts">None</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="booking-buttons">
                            {slot.courts.map(court => (
                                <button 
                                    key={`${slot.time}-${court}`}
                                    className="book-button"
                                    onClick={() => bookSlot(court, slot.time)}
                                    disabled={loading}
                                >
                                    Book Court {court}
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="no-slots-message">No courts available for the selected date.</div>
            )}
        </div>
    );
};

export default SlotList;
