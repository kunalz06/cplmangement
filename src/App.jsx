import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import OrderDetails from './pages/OrderDetails';

// Placeholder components until real ones are created
const Placeholder = ({ title }) => (
  <div className="text-center py-20">
    <h2 className="text-2xl font-bold text-gray-300">{title} Coming Soon</h2>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/order/:id" element={<OrderDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
