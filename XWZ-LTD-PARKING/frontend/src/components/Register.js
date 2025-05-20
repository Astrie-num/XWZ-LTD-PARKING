import React, { useState } from 'react';
import axios from 'axios';

function Register({ setPage }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Fallback regex

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email) {
      errors.email = 'Email is required';
    } else if (window.IsEmail && typeof window.IsEmail.validate === 'function') {
      // Use isemail if available
      if (!window.IsEmail.validate(email)) {
        errors.email = 'Invalid email format';
      }
    } else {
      // Fallback to regex if isemail is not loaded
      if (!emailRegex.test(email)) {
        errors.email = 'Invalid email format';
      }
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/users/register', {
        firstName,
        lastName,
        email,
        password,
        role: 'user',
      });
      setPage('login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-black mb-6">Create Your Account</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.firstName ? 'border-red-500' : 'border-blue-300'
              }`}
            />
            {validationErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
            )}
          </div>
          <div>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.lastName ? 'border-red-500' : 'border-blue-300'
              }`}
            />
            {validationErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
            )}
          </div>
          <div>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.email ? 'border-red-500' : 'border-blue-300'
              }`}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>
          <div>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.password ? 'border-red-500' : 'border-blue-300'
              }`}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-blue-600">
          Already have an account?{' '}
          <button
            onClick={() => setPage('login')}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;