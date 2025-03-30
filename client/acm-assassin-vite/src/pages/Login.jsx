import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/login', { username, password });
      // localStorage.setItem('token', res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("playerId", res.data.playerId);
      localStorage.setItem("targetName", res.data.targetName);
      localStorage.setItem("linkId", res.data.linkId);
      localStorage.setItem("pin", res.data.pin);

      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h1>🎣 ACM Assassins Login</h1>
      <form onSubmit={handleLogin}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
