const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment');
const Booking = require('./models/Booking');
const User = require('./models/User'); // Ensure this model exists

require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/badminton', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Available time slots
const timeSlots = [
    "06:00 - 07:00",
    "07:00 - 08:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
];

// API to register a new user
app.post('/api/register', async (req, res) => {
    const { email } = req.body;

    // Validate the email format
    if (!email.endsWith('@pesu.pes.edu')) {
        return res.status(400).json({ message: 'Invalid email. Please use a @pesu.pes.edu email address.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    // Create and save new user
    const user = new User({ email });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
});

// API for user login
app.post('/api/login', async (req, res) => {
    const { email } = req.body;

    // Validate email format
    if (!email.endsWith('@pesu.pes.edu')) {
        return res.status(400).json({ message: 'Invalid email. Please use a @pesu.pes.edu email address.' });
    }
    
    // Check if the user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res.status(401).json({ message: 'User not found. Please register first.' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful!', email });
});

// API to get available slots
app.get('/api/slots', async (req, res) => {
    const today = moment().format('YYYY-MM-DD');
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

    // Fetch bookings for today and tomorrow
    const bookings = await Booking.find({ date: { $in: [today, tomorrow] } });

    // For today's available slots
    const availableSlotsToday = timeSlots
        .filter(slotTime => {
            const slotStartMoment = moment(slotTime.split(' - ')[0], "HH:mm");
            return slotStartMoment.isAfter(moment()); // Only show slots from current time onward
        })
        .map(slotTime => {
            const bookedCourts = bookings.filter(b => b.date === today && b.time === slotTime).map(b => b.court);
            return {
                time: slotTime,
                courts: [1, 2, 3].filter(court => !bookedCourts.includes(court))
            };
        });

    // For tomorrow's available slots
    const availableSlotsTomorrow = timeSlots.map(slotTime => {
        const bookedCourts = bookings.filter(b => b.date === tomorrow && b.time === slotTime).map(b => b.court);
        return {
            time: slotTime,
            courts: [1, 2, 3].filter(court => !bookedCourts.includes(court))
        };
    });

    // Send available slots for today and tomorrow
    res.json(availableSlotsToday.concat(availableSlotsTomorrow));
});

// API to book a slot
app.post('/api/book', async (req, res) => {
    const { date, time, court, studentId } = req.body;

    const existingBooking = await Booking.findOne({ date, time, court });
    if (existingBooking) {
        return res.status(400).json({ message: 'Court is already booked!' });
    }

    const booking = new Booking({ date, time, court, studentId });
    await booking.save();

    // Respond with a success message
    return res.status(200).json({ message: 'Slot booked successfully!' });
});

// API to get user bookings
app.get('/api/bookings', async (req, res) => {
    const { email } = req.query;

    const bookings = await Booking.find({ studentId: email });
    res.status(200).json(bookings);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});