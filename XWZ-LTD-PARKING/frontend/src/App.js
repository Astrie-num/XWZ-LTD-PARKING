// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:3001/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setError('');
        })
        .catch((err) => {
          console.error('User fetch error:', err);
          setError('Failed to fetch user data');
          setToken('');
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setPage('login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Car Parking System</h1>
        {user && (
          <div>
            <span className="mr-4">Welcome, {user.firstName} ({user.role})</span>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
              Logout
            </button>
          </div>
        )}
      </nav>
      <div className="container mx-auto p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {page === 'login' && <Login setToken={setToken} setPage={setPage} />}
        {page === 'register' && <Register setPage={setPage} />}
        {page === 'dashboard' && user && <Dashboard user={user} setPage={setPage} />}
      </div>
    </div>
  );
}

export default App;