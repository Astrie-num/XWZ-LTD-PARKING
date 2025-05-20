// // // src/components/Dashboard.js
// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';

// // function Dashboard({ user, setPage }) {
// //   if (user.role === 'admin') {
// //     return <AdminDashboard />;
// //   } else if (user.role === 'attendant') {
// //     return <AttendantDashboard />;
// //   } else {
// //     return <UserDashboard />;
// //   }
// // }

// // function AdminDashboard() {
// //   const [parkings, setParkings] = useState([]);
// //   const [form, setForm] = useState({
// //     code: '',
// //     parkingName: '',
// //     availableSpaces: 0,
// //     location: '',
// //     chargingFeePerHour: 0,
// //   });
// //   const [reportType, setReportType] = useState('outgoing');
// //   const [startDate, setStartDate] = useState('');
// //   const [endDate, setEndDate] = useState('');
// //   const [reports, setReports] = useState([]);
// //   const [page, setPage] = useState(1);

// //   useEffect(() => {
// //     axios
// //       .get('http://localhost:3002/api/parkings', {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //       })
// //       .then((res) => setParkings(res.data))
// //       .catch((err) => console.error('Parkings fetch error:', err));
// //   }, []);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.post(
// //         'http://localhost:3002/api/parkings',
// //         form,
// //         {
// //           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //         }
// //       );
// //       setForm({
// //         code: '',
// //         parkingName: '',
// //         availableSpaces: 0,
// //         location: '',
// //         chargingFeePerHour: 0,
// //       });
// //       axios
// //         .get('http://localhost:3002/api/parkings', {
// //           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //         })
// //         .then((res) => setParkings(res.data));
// //     } catch (err) {
// //       console.error('Parking add error:', err);
// //     }
// //   };

// //   const handleReport = async () => {
// //     try {
// //       const res = await axios.get('http://localhost:3003/api/transactions/reports', {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //         params: { startDate, endDate, type: reportType, page, limit: 10 },
// //       });
// //       setReports(res.data);
// //     } catch (err) {
// //       console.error('Report fetch error:', err);
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
// //       <h3 className="text-xl mb-2">Register Parking Lot</h3>
// //       <form onSubmit={handleSubmit} className="mb-6">
// //         <input
// //           type="text"
// //           placeholder="Code"
// //           value={form.code}
// //           onChange={(e) => setForm({ ...form, code: e.target.value })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <input
// //           type="text"
// //           placeholder="Parking Name"
// //           value={form.parkingName}
// //           onChange={(e) => setForm({ ...form, parkingName: e.target.value })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <input
// //           type="number"
// //           placeholder="Available Spaces"
// //           value={form.availableSpaces}
// //           onChange={(e) => setForm({ ...form, availableSpaces: parseInt(e.target.value) })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <input
// //           type="text"
// //           placeholder="Location"
// //           value={form.location}
// //           onChange={(e) => setForm({ ...form, location: e.target.value })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <input
// //           type="number"
// //           placeholder="Fee per Hour"
// //           value={form.chargingFeePerHour}
// //           onChange={(e) => setForm({ ...form, chargingFeePerHour: parseFloat(e.target.value) })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <button type="submit" className="bg-blue-600 text-white p-2 rounded">
// //           Add Parking
// //         </button>
// //       </form>
// //       <h3 className="text-xl mb-2">Parking Lots</h3>
// //       <table className="w-full border-collapse border mb-6">
// //         <thead>
// //           <tr className="bg-gray-200">
// //             <th className="border p-2">Code</th>
// //             <th className="border p-2">Name</th>
// //             <th className="border p-2">Spaces</th>
// //             <th className="border p-2">Location</th>
// //             <th className="border p-2">Fee/Hour</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {parkings.map((p) => (
// //             <tr key={p.code}>
// //               <td className="border p-2">{p.code}</td>
// //               <td className="border p-2">{p.parkingName}</td>
// //               <td className="border p-2">{p.availableSpaces}</td>
// //               <td className="border p-2">{p.location}</td>
// //               <td className="border p-2">${p.chargingFeePerHour}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //       <h3 className="text-xl mb-2">Reports</h3>
// //       <div className="mb-4">
// //         <select
// //           value={reportType}
// //           onChange={(e) => setReportType(e.target.value)}
// //           className="p-2 border rounded mr-2"
// //         >
// //           <option value="outgoing">Outgoing Cars</option>
// //           <option value="incoming">Incoming Cars</option>
// //         </select>
// //         <input
// //           type="datetime-local"
// //           value={startDate}
// //           onChange={(e) => setStartDate(e.target.value)}
// //           className="p-2 border rounded mr-2"
// //         />
// //         <input
// //           type="datetime-local"
// //           value={endDate}
// //           onChange={(e) => setEndDate(e.target.value)}
// //           className="p-2 border rounded mr-2"
// //         />
// //         <button onClick={handleReport} className="bg-blue-600 text-white p-2 rounded">
// //           Generate Report
// //         </button>
// //       </div>
// //       <table className="w-full border-collapse border">
// //         <thead>
// //           <tr className="bg-gray-200">
// //             <th className="border p-2">ID</th>
// //             <th className="border p-2">Plate Number</th>
// //             <th className="border p-2">Parking Code</th>
// //             <th className="border p-2">Entry Time</th>
// //             <th className="border p-2">Exit Time</th>
// //             <th className="border p-2">Charged Amount</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {reports.map((t) => (
// //             <tr key={t.id}>
// //               <td className="border p-2">{t.id}</td>
// //               <td className="border p-2">{t.plateNumber}</td>
// //               <td className="border p-2">{t.parkingCode}</td>
// //               <td className="border p-2">{t.entryDateTime}</td>
// //               <td className="border p-2">{t.exitDateTime || 'N/A'}</td>
// //               <td className="border p-2">${t.chargedAmount}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //       <div className="mt-4">
// //         <button
// //           onClick={() => setPage(page - 1)}
// //           disabled={page === 1}
// //           className="bg-gray-300 p-2 rounded mr-2"
// //         >
// //           Previous
// //         </button>
// //         <button
// //           onClick={() => setPage(page + 1)}
// //           className="bg-gray-300 p-2 rounded"
// //         >
// //           Next
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // function AttendantDashboard() {
// //   const [parkings, setParkings] = useState([]);
// //   const [entryForm, setEntryForm] = useState({ plateNumber: '', parkingCode: '' });
// //   const [exitForm, setExitForm] = useState({ id: '' });

// //   useEffect(() => {
// //     axios
// //       .get('http://localhost:3002/api/parkings', {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //       })
// //       .then((res) => setParkings(res.data))
// //       .catch((err) => console.error('Parkings fetch error:', err));
// //   }, []);

// //   const handleEntry = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.post(
// //         'http://localhost:3003/api/transactions/entry',
// //         entryForm,
// //         {
// //           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //         }
// //       );
// //       setEntryForm({ plateNumber: '', parkingCode: '' });
// //     } catch (err) {
// //       console.error('Entry error:', err);
// //     }
// //   };

// //   const handleExit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.post(
// //         'http://localhost:3003/api/transactions/exit',
// //         exitForm,
// //         {
// //           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //         }
// //       );
// //       setExitForm({ id: '' });
// //     } catch (err) {
// //       console.error('Exit error:', err);
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2 className="text-2xl font-bold mb-4">Attendant Dashboard</h2>
// //       <h3 className="text-xl mb-2">Parking Lots</h3>
// //       <table className="w-full border-collapse border mb-6">
// //         <thead>
// //           <tr className="bg-gray-200">
// //             <th className="border p-2">Code</th>
// //             <th className="border p-2">Name</th>
// //             <th className="border p-2">Spaces</th>
// //             <th className="border p-2">Location</th>
// //             <th className="border p-2">Fee/Hour</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {parkings.map((p) => (
// //             <tr key={p.code}>
// //               <td className="border p-2">{p.code}</td>
// //               <td className="border p-2">{p.parkingName}</td>
// //               <td className="border p-2">{p.availableSpaces}</td>
// //               <td className="border p-2">{p.location}</td>
// //               <td className="border p-2">${p.chargingFeePerHour}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //       <h3 className="text-xl mb-2">Car Entry</h3>
// //       <form onSubmit={handleEntry} className="mb-6">
// //         <input
// //           type="text"
// //           placeholder="Plate Number"
// //           value={entryForm.plateNumber}
// //           onChange={(e) => setEntryForm({ ...entryForm, plateNumber: e.target.value })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <input
// //           type="text"
// //           placeholder="Parking Code"
// //           value={entryForm.parkingCode}
// //           onChange={(e) => setEntryForm({ ...entryForm, parkingCode: e.target.value })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <button type="submit" className="bg-blue-600 text-white p-2 rounded">
// //           Register Entry
// //         </button>
// //       </form>
// //       <h3 className="text-xl mb-2">Car Exit</h3>
// //       <form onSubmit={handleExit}>
// //         <input
// //           type="text"
// //           placeholder="Transaction ID"
// //           value={exitForm.id}
// //           onChange={(e) => setExitForm({ id: e.target.value })}
// //           className="p-2 border rounded mr-2"
// //           required
// //         />
// //         <button type="submit" className="bg-blue-600 text-white p-2 rounded">
// //           Register Exit
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }

// // function UserDashboard() {
// //   const [transactions, setTransactions] = useState([]);
// //   const [page, setPage] = useState(1);

// //   useEffect(() => {
// //     axios
// //       .get('http://localhost:3003/api/transactions/user', {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //         params: { page, limit: 10 },
// //       })
// //       .then((res) => setTransactions(res.data))
// //       .catch((err) => console.error('Transactions fetch error:', err));
// //   }, [page]);

// //   return (
// //     <div>
// //       <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
// //       <h3 className="text-xl mb-2">Your Transactions</h3>
// //       <table className="w-full border-collapse border">
// //         <thead>
// //           <tr className="bg-gray-200">
// //             <th className="border p-2">ID</th>
// //             <th className="border p-2">Plate Number</th>
// //             <th className="border p-2">Parking Code</th>
// //             <th className="border p-2">Entry Time</th>
// //             <th className="border p-2">Exit Time</th>
// //             <th className="border p-2">Charged Amount</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {transactions.map((t) => (
// //             <tr key={t.id}>
// //               <td className="border p-2">{t.id}</td>
// //               <td className="border p-2">{t.plateNumber}</td>
// //               <td className="border p-2">{t.parkingCode}</td>
// //               <td className="border p-2">{t.entryDateTime}</td>
// //               <td className="border p-2">{t.exitDateTime || 'N/A'}</td>
// //               <td className="border p-2">${t.chargedAmount}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //       <div className="mt-4">
// //         <button
// //           onClick={() => setPage(page - 1)}
// //           disabled={page === 1}
// //           className="bg-gray-300 p-2 rounded mr-2"
// //         >
// //           Previous
// //         </button>
// //         <button
// //           onClick={() => setPage(page + 1)}
// //           className="bg-gray-300 p-2 rounded"
// //         >
// //           Next
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Dashboard;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function Dashboard({ user, setPage }) {
//   if (user.role === 'admin') {
//     return <AdminDashboard />;
//   } else if (user.role === 'attendant') {
//     return <AttendantDashboard />;
//   } else {
//     return <UserDashboard />;
//   }
// }

// function AdminDashboard() {
//   const [parkings, setParkings] = useState([]);
//   const [form, setForm] = useState({
//     code: '',
//     parkingName: '',
//     availableSpaces: 0,
//     location: '',
//     chargingFeePerHour: 0,
//   });
//   const [reportType, setReportType] = useState('outgoing');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [reports, setReports] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchParkings = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const res = await axios.get('http://localhost:3002/api/parkings', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });
//         setParkings(res.data || []); // Ensure parkings is always an array
//       } catch (err) {
//         console.error('Parkings fetch error:', err);
//         setError(
//           err.response?.status === 401
//             ? 'Unauthorized: Please log in again.'
//             : 'Failed to fetch parking lots. Please try again.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchParkings();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       await axios.post('http://localhost:3002/api/parkings', form, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setForm({
//         code: '',
//         parkingName: '',
//         availableSpaces: 0,
//         location: '',
//         chargingFeePerHour: 0,
//       });
//       const res = await axios.get('http://localhost:3002/api/parkings', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setParkings(res.data || []);
//     } catch (err) {
//       console.error('Parking add error:', err);
//       setError(
//         err.response?.status === 401
//           ? 'Unauthorized: Please log in again.'
//           : 'Failed to add parking lot. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReport = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get('http://localhost:3003/api/transactions/reports', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         params: { startDate, endDate, type: reportType, page, limit: 10 },
//       });
//       setReports(res.data || []);
//     } catch (err) {
//       console.error('Report fetch error:', err);
//       setError(
//         err.response?.status === 401
//           ? 'Unauthorized: Please log in again.'
//           : 'Failed to fetch reports. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {loading && <p className="text-blue-500 mb-4">Loading...</p>}
//       <h3 className="text-xl mb-2">Register Parking Lot</h3>
//       <form onSubmit={handleSubmit} className="mb-6">
//         <input
//           type="text"
//           placeholder="Code"
//           value={form.code}
//           onChange={(e) => setForm({ ...form, code: e.target.value })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <input
//           type="text"
//           placeholder="Parking Name"
//           value={form.parkingName}
//           onChange={(e) => setForm({ ...form, parkingName: e.target.value })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <input
//           type="number"
//           placeholder="Available Spaces"
//           value={form.availableSpaces}
//           onChange={(e) => setForm({ ...form, availableSpaces: parseInt(e.target.value) || 0 })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <input
//           type="text"
//           placeholder="Location"
//           value={form.location}
//           onChange={(e) => setForm({ ...form, location: e.target.value })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <input
//           type="number"
//           placeholder="Fee per Hour"
//           value={form.chargingFeePerHour}
//           onChange={(e) => setForm({ ...form, chargingFeePerHour: parseFloat(e.target.value) || 0 })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
//           {loading ? 'Adding...' : 'Add Parking'}
//         </button>
//       </form>
//       <h3 className="text-xl mb-2">Parking Lots</h3>
//       {parkings.length === 0 && !loading && !error && (
//         <p className="text-gray-500 mb-4">No parking lots available.</p>
//       )}
//       {parkings.length > 0 && (
//         <table className="w-full border-collapse border mb-6">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">Code</th>
//               <th className="border p-2">Name</th>
//               <th className="border p-2">Spaces</th>
//               <th className="border p-2">Location</th>
//               <th className="border p-2">Fee/Hour</th>
//             </tr>
//           </thead>
//           <tbody>
//             {parkings.map((p) => (
//               <tr key={p.code}>
//                 <td className="border p-2">{p.code}</td>
//                 <td className="border p-2">{p.parkingName}</td>
//                 <td className="border p-2">{p.availableSpaces}</td>
//                 <td className="border p-2">{p.location}</td>
//                 <td className="border p-2">${p.chargingFeePerHour}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//       <h3 className="text-xl mb-2">Reports</h3>
//       <div className="mb-4">
//         <select
//           value={reportType}
//           onChange={(e) => setReportType(e.target.value)}
//           className="p-2 border rounded mr-2"
//         >
//           <option value="outgoing">Outgoing Cars</option>
//           <option value="incoming">Incoming Cars</option>
//         </select>
//         <input
//           type="datetime-local"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           className="p-2 border rounded mr-2"
//         />
//         <input
//           type="datetime-local"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           className="p-2 border rounded mr-2"
//         />
//         <button onClick={handleReport} className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
//           {loading ? 'Generating...' : 'Generate Report'}
//         </button>
//       </div>
//       {reports.length === 0 && !loading && !error && (
//         <p className="text-gray-500 mb-4">No reports available.</p>
//       )}
//       {reports.length > 0 && (
//         <table className="w-full border-collapse border">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">ID</th>
//               <th className="border p-2">Plate Number</th>
//               <th className="border p-2">Parking Code</th>
//               <th className="border p-2">Entry Time</th>
//               <th className="border p-2">Exit Time</th>
//               <th className="border p-2">Charged Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reports.map((t) => (
//               <tr key={t.id}>
//                 <td className="border p-2">{t.id}</td>
//                 <td className="border p-2">{t.plateNumber}</td>
//                 <td className="border p-2">{t.parkingCode}</td>
//                 <td className="border p-2">{t.entryDateTime}</td>
//                 <td className="border p-2">{t.exitDateTime || 'N/A'}</td>
//                 <td className="border p-2">${t.chargedAmount}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//       <div className="mt-4">
//         <button
//           onClick={() => setPage(page - 1)}
//           disabled={page === 1 || loading}
//           className="bg-gray-300 p-2 rounded mr-2"
//         >
//           Previous
//         </button>
//         <button
//           onClick={() => setPage(page + 1)}
//           disabled={loading}
//           className="bg-gray-300 p-2 rounded"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// function AttendantDashboard() {
//   const [parkings, setParkings] = useState([]);
//   const [entryForm, setEntryForm] = useState({ plateNumber: '', parkingCode: '' });
//   const [exitForm, setExitForm] = useState({ id: '' });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchParkings = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const res = await axios.get('http://localhost:3002/api/parkings', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });
//         setParkings(res.data || []);
//       } catch (err) {
//         console.error('Parkings fetch error:', err);
//         setError(
//           err.response?.status === 401
//             ? 'Unauthorized: Please log in again.'
//             : 'Failed to fetch parking lots. Please try again.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchParkings();
//   }, []);

//   const handleEntry = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       await axios.post('http://localhost:3003/api/transactions/entry', entryForm, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setEntryForm({ plateNumber: '', parkingCode: '' });
//     } catch (err) {
//       console.error('Entry error:', err);
//       setError(
//         err.response?.status === 401
//           ? 'Unauthorized: Please log in again.'
//           : 'Failed to register car entry. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       await axios.post('http://localhost:3003/api/transactions/exit', exitForm, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setExitForm({ id: '' });
//     } catch (err) {
//       console.error('Exit error:', err);
//       setError(
//         err.response?.status === 401
//           ? 'Unauthorized: Please log in again.'
//           : 'Failed to register car exit. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Attendant Dashboard</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {loading && <p className="text-blue-500 mb-4">Loading...</p>}
//       <h3 className="text-xl mb-2">Parking Lots</h3>
//       {parkings.length === 0 && !loading && !error && (
//         <p className="text-gray-500 mb-4">No parking lots available.</p>
//       )}
//       {parkings.length > 0 && (
//         <table className="w-full border-collapse border mb-6">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">Code</th>
//               <th className="border p-2">Name</th>
//               <th className="border p-2">Spaces</th>
//               <th className="border p-2">Location</th>
//               <th className="border p-2">Fee/Hour</th>
//             </tr>
//           </thead>
//           <tbody>
//             {parkings.map((p) => (
//               <tr key={p.code}>
//                 <td className="border p-2">{p.code}</td>
//                 <td className="border p-2">{p.parkingName}</td>
//                 <td className="border p-2">{p.availableSpaces}</td>
//                 <td className="border p-2">{p.location}</td>
//                 <td className="border p-2">${p.chargingFeePerHour}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//       <h3 className="text-xl mb-2">Car Entry</h3>
//       <form onSubmit={handleEntry} className="mb-6">
//         <input
//           type="text"
//           placeholder="Plate Number"
//           value={entryForm.plateNumber}
//           onChange={(e) => setEntryForm({ ...entryForm, plateNumber: e.target.value })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <input
//           type="text"
//           placeholder="Parking Code"
//           value={entryForm.parkingCode}
//           onChange={(e) => setEntryForm({ ...entryForm, parkingCode: e.target.value })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
//           {loading ? 'Registering...' : 'Register Entry'}
//         </button>
//       </form>
//       <h3 className="text-xl mb-2">Car Exit</h3>
//       <form onSubmit={handleExit}>
//         <input
//           type="text"
//           placeholder="Transaction ID"
//           value={exitForm.id}
//           onChange={(e) => setExitForm({ id: e.target.value })}
//           className="p-2 border rounded mr-2"
//           required
//         />
//         <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
//           {loading ? 'Registering...' : 'Register Exit'}
//         </button>
//       </form>
//     </div>
//   );
// }

// function UserDashboard() {
//   const [transactions, setTransactions] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const res = await axios.get('http://localhost:3003/api/transactions/user', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//           params: { page, limit: 10 },
//         });
//         setTransactions(res.data || []);
//       } catch (err) {
//         console.error('Transactions fetch error:', err);
//         setError(
//           err.response?.status === 401
//             ? 'Unauthorized: Please log in again.'
//             : 'Failed to fetch transactions. Please try again.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTransactions();
//   }, [page]);

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {loading && <p className="text-blue-500 mb-4">Loading...</p>}
//       <h3 className="text-xl mb-2">Your Transactions</h3>
//       {transactions.length === 0 && !loading && !error && (
//         <p className="text-gray-500 mb-4">No transactions available.</p>
//       )}
//       {transactions.length > 0 && (
//         <table className="w-full border-collapse border">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">ID</th>
//               <th className="border p-2">Plate Number</th>
//               <th className="border p-2">Parking Code</th>
//               <th className="border p-2">Entry Time</th>
//               <th className="border p-2">Exit Time</th>
//               <th className="border p-2">Charged Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {transactions.map((t) => (
//               <tr key={t.id}>
//                 <td className="border p-2">{t.id}</td>
//                 <td className="border p-2">{t.plateNumber}</td>
//                 <td className="border p-2">{t.parkingCode}</td>
//                 <td className="border p-2">{t.entryDateTime}</td>
//                 <td className="border p-2">{t.exitDateTime || 'N/A'}</td>
//                 <td className="border p-2">${t.chargedAmount}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//       <div className="mt-4">
//         <button
//           onClick={() => setPage(page - 1)}
//           disabled={page === 1 || loading}
//           className="bg-gray-300 p-2 rounded mr-2"
//         >
//           Previous
//         </button>
//         <button
//           onClick={() => setPage(page + 1)}
//           disabled={loading}
//           className="bg-gray-300 p-2 rounded"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;




import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user, setPage }) {
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'attendant') {
    return <AttendantDashboard />;
  } else {
    return <UserDashboard />;
  }
}

function AdminDashboard() {
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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParkings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:3002/api/parkings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setParkings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Parkings fetch error:', err);
        setError(
          err.response?.status === 401
            ? 'Unauthorized: Please log in again.'
            : 'Failed to fetch parking lots. Please check the server.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchParkings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(
        'http://localhost:3002/api/parkings',
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const res = await axios.get('http://localhost:3002/api/parkings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setParkings(Array.isArray(res.data) ? res.data : []);
      setForm({
        code: '',
        parkingName: '',
        availableSpaces: 0,
        location: '',
        chargingFeePerHour: 0,
      });
    } catch (err) {
      console.error('Parking add error:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again.'
          : 'Failed to add parking lot. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:3003/api/transactions/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { startDate, endDate, type: reportType, page, limit: 10 },
      });
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Report fetch error:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again.'
          : 'Failed to fetch reports. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      <h3 className="text-xl mb-2">Register Parking Lot</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <input
          type="text"
          placeholder="Parking Name"
          value={form.parkingName}
          onChange={(e) => setForm({ ...form, parkingName: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <input
          type="number"
          placeholder="Available Spaces"
          value={form.availableSpaces}
          onChange={(e) => setForm({ ...form, availableSpaces: parseInt(e.target.value) || 0 })}
          className="p-2 border rounded mr-2"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <input
          type="number"
          placeholder="Fee per Hour"
          value={form.chargingFeePerHour}
          onChange={(e) => setForm({ ...form, chargingFeePerHour: parseFloat(e.target.value) || 0 })}
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Adding...' : 'Add Parking'}
        </button>
      </form>
      <h3 className="text-xl mb-2">Parking Lots</h3>
      {parkings.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No parking lots available.</p>}
      {parkings.length > 0 && (
        <table className="w-full border-collapse border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Code</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Spaces</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Fee/Hour</th>
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
      <h3 className="text-xl mb-2">Reports</h3>
      <div className="mb-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="p-2 border rounded mr-2"
        >
          <option value="outgoing">Outgoing Cars</option>
          <option value="incoming">Incoming Cars</option>
        </select>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleReport} className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      {reports.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No reports available.</p>}
      {reports.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Plate Number</th>
              <th className="border p-2">Parking Code</th>
              <th className="border p-2">Entry Time</th>
              <th className="border p-2">Exit Time</th>
              <th className="border p-2">Charged Amount</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.id}</td>
                <td className="border p-2">{t.plateNumber}</td>
                <td className="border p-2">{t.parkingCode}</td>
                <td className="border p-2">{t.entryDateTime}</td>
                <td className="border p-2">{t.exitDateTime || 'N/A'}</td>
                <td className="border p-2">${t.chargedAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || loading}
          className="bg-gray-300 p-2 rounded mr-2"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={loading}
          className="bg-gray-300 p-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function AttendantDashboard() {
  const [parkings, setParkings] = useState([]);
  const [entryForm, setEntryForm] = useState({ plateNumber: '', parkingCode: '' });
  const [exitForm, setExitForm] = useState({ id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParkings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:3002/api/parkings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setParkings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Parkings fetch error:', err);
        setError(
          err.response?.status === 401
            ? 'Unauthorized: Please log in again.'
            : 'Failed to fetch parking lots. Please check the server.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchParkings();
  }, []);

  const handleEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3003/api/transactions/entry', entryForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEntryForm({ plateNumber: '', parkingCode: '' });
    } catch (err) {
      console.error('Entry error:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again.'
          : 'Failed to register car entry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3003/api/transactions/exit', exitForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExitForm({ id: '' });
    } catch (err) {
      console.error('Exit error:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again.'
          : 'Failed to register car exit. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attendant Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      <h3 className="text-xl mb-2">Parking Lots</h3>
      {parkings.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No parking lots available.</p>}
      {parkings.length > 0 && (
        <table className="w-full border-collapse border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Code</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Spaces</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Fee/Hour</th>
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
      <h3 className="text-xl mb-2">Car Entry</h3>
      <form onSubmit={handleEntry} className="mb-6">
        <input
          type="text"
          placeholder="Plate Number"
          value={entryForm.plateNumber}
          onChange={(e) => setEntryForm({ ...entryForm, plateNumber: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <input
          type="text"
          placeholder="Parking Code"
          value={entryForm.parkingCode}
          onChange={(e) => setEntryForm({ ...entryForm, parkingCode: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Registering...' : 'Register Entry'}
        </button>
      </form>
      <h3 className="text-xl mb-2">Car Exit</h3>
      <form onSubmit={handleExit}>
        <input
          type="text"
          placeholder="Transaction ID"
          value={exitForm.id}
          onChange={(e) => setExitForm({ id: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Registering...' : 'Register Exit'}
        </button>
      </form>
    </div>
  );
}

function UserDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:3003/api/transactions/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { page, limit: 10 },
        });
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Transactions fetch error:', err);
        setError(
          err.response?.status === 401
            ? 'Unauthorized: Please log in again.'
            : 'Failed to fetch transactions. Please check the server.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      <h3 className="text-xl mb-2">Your Transactions</h3>
      {transactions.length === 0 && !loading && !error && <p className="text-gray-500 mb-4">No transactions available.</p>}
      {transactions.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Plate Number</th>
              <th className="border p-2">Parking Code</th>
              <th className="border p-2">Entry Time</th>
              <th className="border p-2">Exit Time</th>
              <th className="border p-2">Charged Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.id}</td>
                <td className="border p-2">{t.plateNumber}</td>
                <td className="border p-2">{t.parkingCode}</td>
                <td className="border p-2">{t.entryDateTime}</td>
                <td className="border p-2">{t.exitDateTime || 'N/A'}</td>
                <td className="border p-2">${t.chargedAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || loading}
          className="bg-gray-300 p-2 rounded mr-2"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={loading}
          className="bg-gray-300 p-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Dashboard;