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

    const userInfo = {
      username: localStorage.getItem("username"),
      targetName: localStorage.getItem("targetName"),
      linkId: localStorage.getItem("linkId"),
      pin: localStorage.getItem("pin"),
      playerId,
    };

    setData(userInfo);

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

      <button
        onClick={() => {
          const text = logs.map((log) => {
            const timestamp = new Date(log.time);
            const formattedTime = timestamp.toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            let message = '';
            if (log.admitted) {
              message = `🙈 ${log.name} admitted being phished: "${log.note || 'No message'}"`;
            } else if (log.defused) {
              message = "✅ Link disarmed with correct PIN";
            } else if (log.timedOut) {
              message = "💥 Timer expired — no interaction";
            } else if (log.opened) {
              message = `🎯 Link opened in ${log.userAgent || "unknown browser"}`;
            } else {
              message = "❓ Uncategorized activity";
            }

            if (log.duration) {
              message += ` 🕒 Stayed for ${log.duration} sec`;
            }

            return `[${formattedTime}] ${message}`;
          }).join("\n");

          navigator.clipboard.writeText(text)
            .then(() => alert("📋 Logs copied to clipboard!"))
            .catch(() => alert("Failed to copy logs 😢"));
        }}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem'
        }}
      >
        📋 Copy Logs
      </button>

      <h2>Activity Log</h2>
      {logs.length === 0 ? (
        <p>No clicks yet.</p>
      ) : (
        <ul>
          {logs.map((log, i) => {
            const timestamp = new Date(log.time);
            const now = new Date();
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
              message = `${log.name} admitted being phished: "${log.note || 'No message'}"`;
              emoji = "🙈";
            } else if (log.defused) {
              message = "Link disarmed with correct PIN";
              emoji = "✅";
            } else if (log.timedOut) {
              message = "Timer expired — no interaction";
              emoji = "💥";
            } else if (log.opened) {
              message = `Link opened in ${log.userAgent || "unknown browser"}`;
              emoji = "🎯";
            } else {
              message = "Uncategorized activity";
              emoji = "❓";
            }

            if (log.duration) {
              message += ` 🕒 Stayed for ${log.duration} sec`;
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
