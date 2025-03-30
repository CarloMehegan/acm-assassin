import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Track from './pages/Track.jsx';
import Stats from './pages/Stats.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/track/:linkId" element={<Track />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  );
}

export default App;