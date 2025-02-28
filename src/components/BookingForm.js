// src/components/BookingForm.js
import React, { useEffect, useState } from "react";
import SlotList from "./SlotList";
import moment from "moment";

const BookingForm = ({ userEmail, addBooking }) => {
    const [selectedDate, setSelectedDate] = useState(moment().add(1, "days").format("YYYY-MM-DD")); // Only allow tomorrow
    const [filteredSlots, setFilteredSlots] = useState([]);

    // Define available slots
    const allSlots = [
        "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00",
        "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"
    ];

    // Function to update available slots based on the selected date
    const updateSlots = (date) => {
        const dayOfWeek = moment(date).day(); // 0 = Sunday, 6 = Saturday
        let availableSlots = [...allSlots];

        if (dayOfWeek === 6) {
            // Saturday: Only allow slots before 13:00
            availableSlots = availableSlots.filter(slot => parseInt(slot.split(":")[0]) < 13);
        } else if (dayOfWeek === 0) {
            // Sunday: Only allow slots before 10:00
            availableSlots = availableSlots.filter(slot => parseInt(slot.split(":")[0]) < 10);
        }

        // Remove break times (8-9 AM, 1-2 PM) for weekdays & Saturday
        if (dayOfWeek !== 0) {
            availableSlots = availableSlots.filter(slot => slot !== "08:00 - 09:00" && slot !== "13:00 - 14:00");
        } else {
            // Sunday allows 8-9 AM, but removes 1-2 PM
            availableSlots = availableSlots.filter(slot => slot !== "13:00 - 14:00");
        }

        setFilteredSlots(availableSlots);
    };

    // Run updateSlots on component mount and when date changes
    useEffect(() => {
        updateSlots(selectedDate);
    }, [selectedDate]);

    return (
        <div>
            <input
                type="date"
                value={selectedDate} // Controlled input
                onChange={(e) => setSelectedDate(e.target.value)}
                min={moment().add(1, "days").format("YYYY-MM-DD")} // Prevent selecting today or past dates
                max={moment().add(1, "days").format("YYYY-MM-DD")} // Only allow tomorrow
                readOnly // Prevent user from manually changing beyond tomorrow
            />
            <SlotList date={selectedDate} userEmail={userEmail} addBooking={addBooking} availableSlots={filteredSlots} />
        </div>
    );
};

export default BookingForm;
