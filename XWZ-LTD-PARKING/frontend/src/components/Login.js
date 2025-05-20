// // src/components/Login.js
// import React, { useState } from 'react';
// import axios from 'axios';

// function Login({ setToken, setPage }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('http://localhost:3001/api/users/login', { email, password });
//       localStorage.setItem('token', res.data.token);
//       setToken(res.data.token);
//       setPage('dashboard');
//       setError('');
//     } catch (err) {
//       console.error('Login error:', err);
//       setError('Invalid credentials');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Login</h2>
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
//           Login
//         </button>
//       </form>
//       <p className="mt-4">
//         Don't have an account?{' '}
//         <button onClick={() => setPage('register')} className="text-blue-600">
//           Register
//         </button>
//       </p>
//     </div>
//   );
// }

// export default Login;



// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setPage('dashboard');
      setError('');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Server responded with a status code (e.g., 401 for invalid credentials)
        if (err.response.status === 401) {
          setError('Invalid email or password');
        } else {
          setError('Server error. Please try again later.');
        }
      } else if (err.request) {
        // Request was made but no response received (e.g., CORS or network issue)
        setError('Network error. Please check your connection or server status.');
      } else {
        // Something else caused the error
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
      <p className="mt-4">
        Don't have an account?{' '}
        <button onClick={() => setPage('register')} className="text-blue-600">
          Register
        </button>
      </p>
    </div>
  );
}

export default Login;