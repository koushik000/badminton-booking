import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegister }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/api/register', { email });
            alert(response.data.message);
            onRegister(email);
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <button type="submit">Register</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Register;