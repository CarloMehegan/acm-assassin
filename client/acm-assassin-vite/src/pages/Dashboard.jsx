import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId");
    if (!playerId) {
      navigate("/");
      return;
    }

    // Get user info from localStorage
    const userInfo = {
      username: localStorage.getItem("username"),
      targetName: localStorage.getItem("targetName"),
      linkId: localStorage.getItem("linkId"),
      pin: localStorage.getItem("pin"),
      playerId,
    };

    setData(userInfo);

    // Fetch logs
    axios.get(`http://localhost:3000/logs/${playerId}`)
      .then(res => setLogs(res.data.logs))
      .catch(() => setLogs([]));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  const link = `http://localhost:3000/track/${data.linkId}`;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Welcome, {data.username}</h1>
      <p><strong>Your Target:</strong> {data.targetName}</p>
      <p><strong>Your Phishing Link:</strong> <a href={link} target="_blank" rel="noreferrer">{link}</a></p>
      <p><strong>Your Link's Defusal Code:</strong> {data.pin}</p>

      <h2>Activity Log</h2>
      {logs.length === 0 ? (
        <p>No clicks yet.</p>
      ) : (
        <ul>
          {logs.map((log, i) => (
            <li key={i}>
              [{log.time}] {log.defused ? "Disarmed" : "No PIN entered"}
              {log.admitted && " — Target clicked 'You got me!'"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
