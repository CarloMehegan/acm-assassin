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
        <p>
            <strong>Your Phishing Link:</strong>{' '}
            <a href={link} target="_blank" rel="noreferrer">{link}</a>
        </p>
        <p><strong>Your Link's Defusal Code:</strong> {data.pin}</p>

        <h2>Activity Log</h2>
        {logs.length === 0 ? (
            <p>No clicks yet.</p>
        ) : (
            <ul>
            {logs.map((log, i) => {
                const timestamp = new Date(log.time);
                const now = new Date();
                const minutesAgo = Math.floor((now - timestamp) / 60000);
                const secondsAgo = Math.floor((now - timestamp) / 1000);
                const timeAgo =
                    secondsAgo < 60
                        ? `${secondsAgo} sec ago`
                        : `${Math.floor(secondsAgo / 60)} min ${secondsAgo % 60} sec ago`;


                const formattedTime = timestamp.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                });

                let message = '';
                let emoji = '';

                if (log.admitted) {
                    message = "Target clicked 'You got me!'";
                    emoji = "🙈";
                } else if (log.defused) {
                    message = "Link disarmed with correct PIN";
                    emoji = "✅";
                } else if (log.timedOut) {
                    message = "Timer expired — no interaction";
                    emoji = "⏱️";
                } else if (log.opened) {
                    message = `Link opened in ${log.userAgent || "unknown browser"}`;
                    emoji = "👀";
                } else {
                    message = "Uncategorized activity";
                    emoji = "❓";
                }

                return (
                    <li key={i}>
                    [{formattedTime}] ({timeAgo}) {emoji} {message}
                    </li>
                );
                })}

            </ul>
        )}
        </div>

  );
}
