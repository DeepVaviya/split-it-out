import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';

function App() {
  return (
    <BrowserRouter>
      {/* FIX: Removed 'bg-gray-50 text-gray-900' so index.css can control the theme */}
      <div className="min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group/:id" element={<GroupDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;