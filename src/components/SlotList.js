import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SlotList.css';

const SlotList = ({ date, userEmail, setBookings = () => {} }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch slots
    const fetchSlots = async () => {
        if (!date) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const res = await axios.get(`http://localhost:3000/api/slots?date=${date}`);
            
            // Process and deduplicate slots
            const uniqueSlots = {};
            
            res.data.forEach(slot => {
                const timeKey = slot.time;
                
                if (!uniqueSlots[timeKey]) {
                    uniqueSlots[timeKey] = {
                        time: timeKey,
                        courts: [...(slot.courts || [])]
                    };
                } else if (slot.courts?.length) {
                    const existingCourts = new Set(uniqueSlots[timeKey].courts);
                    slot.courts.forEach(court => existingCourts.add(court));
                    uniqueSlots[timeKey].courts = Array.from(existingCourts).sort((a, b) => a - b);
                }
            });
            
            // Convert to array and sort by time
            const processedSlots = Object.values(uniqueSlots).sort((a, b) => {
                const timeA = new Date(`1970-01-01T${a.time.split(' - ')[0]}:00`);
                const timeB = new Date(`1970-01-01T${b.time.split(' - ')[0]}:00`);
                return timeA - timeB;
            });
            
            setSlots(processedSlots);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setError('Failed to load available slots. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch slots when date changes
    useEffect(() => {
        fetchSlots();
    }, [date]);

    // Book a slot
    const bookSlot = async (court, slotTime) => {
        if (!userEmail) {
            alert('Please log in to book a court.');
            return;
        }

        const bookingDetails = {
            date,
            time: slotTime,
            court,
            studentId: userEmail,
        };

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:3000/api/book', bookingDetails);

            if (res.data.success || res.status === 200) {
                alert(res.data.message || 'Court booked successfully!');

                // Ensure setBookings is called with correct type
                setBookings(prev => (Array.isArray(prev) ? [...prev, bookingDetails] : [bookingDetails]));

                // Optimistically update the UI
                setSlots(prevSlots => prevSlots.map(slot => 
                    slot.time === slotTime ? { 
                        ...slot, 
                        courts: slot.courts.filter(c => c !== court) 
                    } : slot
                ));

                // Optional: Re-fetch to ensure consistency
                fetchSlots();
            } else {
                throw new Error(res.data.message || 'Booking failed');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Error booking the slot. Please try again.';
            alert(errorMsg);
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
