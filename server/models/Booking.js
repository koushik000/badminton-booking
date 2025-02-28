const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    court: { type: Number, required: true },
    studentId: { type: String, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;