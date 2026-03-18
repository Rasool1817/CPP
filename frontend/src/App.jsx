import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import Warranties from './pages/Warranties';
import AddWarranty from './pages/AddWarranty';
import ServiceHistory from './pages/ServiceHistory';
import Reminders from './pages/Reminders';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/warranties" element={<ProtectedRoute><Warranties /></ProtectedRoute>} />
          <Route path="/warranties/add" element={<ProtectedRoute><AddWarranty /></ProtectedRoute>} />
          <Route path="/service-history" element={<ProtectedRoute><ServiceHistory /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
