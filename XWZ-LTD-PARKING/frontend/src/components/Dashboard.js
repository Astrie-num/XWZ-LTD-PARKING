import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function Dashboard({ user, setPage }) {
  if (!user) {
    setPage('login');
    return null;
  }
  if (user.role === 'admin') {
    return <AdminDashboard setPage={setPage} />;
  } else if (user.role === 'attendant') {
    return <AttendantDashboard setPage={setPage} />;
  } else {
    return <UserDashboard setPage={setPage} />;
  }
}

function AdminDashboard({ setPage }) {
  const [parkings, setParkings] = useState([]);
  const [form, setForm] = useState({
    code: '',
    parkingName: '',
    availableSpaces: 0,
    location: '',
    chargingFeePerHour: 0,
  });
  const [reportType, setReportType] = useState('outgoing');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await axios(url, options);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const fetchParkings = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Fetching parkings with token:', token);
    try {
      const res = await fetchWithRetry('http://localhost:3002/api/parkings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParkings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Parkings fetch error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError('Failed to fetch parking lots. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [setPage]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Fetching reports with token:', token);
    try {
      const res = await fetchWithRetry('http://localhost:3003/api/transactions/reports', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate, type: reportType, page: currentPage, limit: 10 },
      });
      setReports(Array.isArray(res.data.transactions) ? res.data.transactions : []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Report fetch error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, reportType, currentPage, setPage]);

  useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [currentPage, reportType, startDate, endDate, fetchReports]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Submitting parking with token:', token);
    try {
      await fetchWithRetry('http://localhost:3002/api/parkings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: form,
      });
      await fetchParkings();
      setForm({
        code: '',
        parkingName: '',
        availableSpaces: 0,
        location: '',
        chargingFeePerHour: 0,
      });
    } catch (err) {
      console.error('Parking add error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError(err.response?.data?.error || 'Failed to add parking lot. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-4">Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-black mb-4">Loading...</p>}
      <h3 className="text-xl text-black mb-2">Register Parking Lot</h3>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <input
          type="text"
          placeholder="Parking Name"
          value={form.parkingName}
          onChange={(e) => setForm({ ...form, parkingName: e.target.value })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <input
          type="number"
          placeholder="Available Spaces"
          value={form.availableSpaces}
          onChange={(e) => setForm({ ...form, availableSpaces: parseInt(e.target.value) || 0 })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <input
          type="number"
          placeholder="Fee per Hour"
          value={form.chargingFeePerHour}
          onChange={(e) => setForm({ ...form, chargingFeePerHour: parseFloat(e.target.value) || 0 })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Parking'}
        </button>
      </form>
      <h3 className="text-xl text-black mb-2">Parking Lots</h3>
      {parkings.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No parking lots available.</p>}
      {parkings.length > 0 && (
        <table className="w-full border-collapse border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-black">Code</th>
              <th className="border p-2 text-black">Name</th>
              <th className="border p-2 text-black">Spaces</th>
              <th className="border p-2 text-black">Location</th>
              <th className="border p-2 text-black">Fee/Hour</th>
            </tr>
          </thead>
          <tbody>
            {parkings.map((p) => (
              <tr key={p.code}>
                <td className="border p-2">{p.code}</td>
                <td className="border p-2">{p.parkingName}</td>
                <td className="border p-2">{p.availableSpaces}</td>
                <td className="border p-2">{p.location}</td>
                <td className="border p-2">${p.chargingFeePerHour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 className="text-xl text-black mb-2">Reports</h3>
      <div className="mb-4 space-y-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="outgoing">Outgoing Cars</option>
          <option value="incoming">Incoming Cars</option>
        </select>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
        />
        <button
          onClick={fetchReports}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-500"
          disabled={loading || !startDate || !endDate}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      {reports.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No reports available.</p>}
      {reports.length > 0 && (
        <table className="w-full border-collapse border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-black">ID</th>
              <th className="border p-2 text-black">Plate Number</th>
              <th className="border p-2 text-black">Parking Code</th>
              <th className="border p-2 text-black">Entry Time</th>
              <th className="border p-2 text-black">Exit Time</th>
              <th className="border p-2 text-black">Charged Amount</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.id}</td>
                <td className="border p-2">{t.plateNumber}</td>
                <td className="border p-2">{t.parkingCode}</td>
                <td className="border p-2">{new Date(t.entryDateTime).toLocaleString()}</td>
                <td className="border p-2">{t.exitDateTime ? new Date(t.exitDateTime).toLocaleString() : 'N/A'}</td>
                <td className="border p-2">${t.chargedAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="bg-gray-300 p-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>
        <span className="text-black">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="bg-gray-300 p-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function AttendantDashboard({ setPage }) {
  const [parkings, setParkings] = useState([]);
  const [entryForm, setEntryForm] = useState({ plateNumber: '', parkingCode: '' });
  const [exitForm, setExitForm] = useState({ id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await axios(url, options);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const fetchParkings = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Fetching parkings with token:', token);
    try {
      const res = await fetchWithRetry('http://localhost:3002/api/parkings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParkings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Parkings fetch error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError('Failed to fetch parking lots. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [setPage]);

  useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  const handleEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Submitting car entry with token:', token);
    try {
      await fetchWithRetry('http://localhost:3003/api/transactions/entry', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: entryForm,
      });
      setEntryForm({ plateNumber: '', parkingCode: '' });
    } catch (err) {
      console.error('Entry error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError(err.response?.data?.error || 'Failed to register car entry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Submitting car exit with token:', token);
    try {
      await fetchWithRetry('http://localhost:3003/api/transactions/exit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: exitForm,
      });
      setExitForm({ id: '' });
    } catch (err) {
      console.error('Exit error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError(err.response?.data?.error || 'Failed to register car exit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-4">Attendant Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-black mb-4">Loading...</p>}
      <h3 className="text-xl text-black mb-2">Parking Lots</h3>
      {parkings.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No parking lots available.</p>}
      {parkings.length > 0 && (
        <table className="w-full border-collapse border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-black">Code</th>
              <th className="border p-2 text-black">Name</th>
              <th className="border p-2 text-black">Spaces</th>
              <th className="border p-2 text-black">Location</th>
              <th className="border p-2 text-black">Fee/Hour</th>
            </tr>
          </thead>
          <tbody>
            {parkings.map((p) => (
              <tr key={p.code}>
                <td className="border p-2">{p.code}</td>
                <td className="border p-2">{p.parkingName}</td>
                <td className="border p-2">{p.availableSpaces}</td>
                <td className="border p-2">{p.location}</td>
                <td className="border p-2">${p.chargingFeePerHour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 className="text-xl text-black mb-2">Car Entry</h3>
      <form onSubmit={handleEntry} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Plate Number"
          value={entryForm.plateNumber}
          onChange={(e) => setEntryForm({ ...entryForm, plateNumber: e.target.value })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <input
          type="text"
          placeholder="Parking Code"
          value={entryForm.parkingCode}
          onChange={(e) => setEntryForm({ ...entryForm, parkingCode: e.target.value })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Entry'}
        </button>
      </form>
      <h3 className="text-xl text-black mb-2">Car Exit</h3>
      <form onSubmit={handleExit} className="space-y-4">
        <input
          type="text"
          placeholder="Transaction ID"
          value={exitForm.id}
          onChange={(e) => setExitForm({ id: e.target.value })}
          className="p-2 border rounded w-full focus:ring-2 focus:ring-black focus:border-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Exit'}
        </button>
      </form>
    </div>
  );
}

function UserDashboard({ setPage }) {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await axios(url, options);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      localStorage.removeItem('token');
      setPage('login');
      setLoading(false);
      return;
    }
    console.log('Fetching transactions with token:', token);
    try {
      const res = await fetchWithRetry('http://localhost:3003/api/transactions/user', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: 10 },
      });
      setTransactions(Array.isArray(res.data.transactions) ? res.data.transactions : []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Transactions fetch error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        setPage('login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch transactions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, setPage]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, fetchTransactions]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-4">User Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-black mb-4">Loading...</p>}
      <h3 className="text-xl text-black mb-2">Your Transactions</h3>
      {transactions.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No transactions available.</p>}
      {transactions.length > 0 && (
        <table className="w-full border-collapse border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-black">ID</th>
              <th className="border p-2 text-black">Plate Number</th>
              <th className="border p-2 text-black">Parking Code</th>
              <th className="border p-2 text-black">Entry Time</th>
              <th className="border p-2 text-black">Exit Time</th>
              <th className="border p-2 text-black">Charged Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.id}</td>
                <td className="border p-2">{t.plateNumber}</td>
                <td className="border p-2">{t.parkingCode}</td>
                <td className="border p-2">{new Date(t.entryDateTime).toLocaleString()}</td>
                <td className="border p-2">{t.exitDateTime ? new Date(t.exitDateTime).toLocaleString() : 'N/A'}</td>
                <td className="border p-2">${t.chargedAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="bg-gray-300 p-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>
        <span className="text-black">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="bg-gray-300 p-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Dashboard;