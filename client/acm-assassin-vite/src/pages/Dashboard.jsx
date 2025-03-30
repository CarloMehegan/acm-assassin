import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showSensitive, setShowSensitive] = useState(false);

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
      <p><a href="/stats">View Player Stats</a></p>

      
      {showSensitive ? (
        <>
          <p><strong>Your Target:</strong> {data.targetName}</p>
          <p>
            <strong>Your Phishing Link:</strong>{' '}
            <a href={link} target="_blank" rel="noreferrer">{link}</a>
          </p>
          <p><strong>Your Link's Defusal Code:</strong> {data.pin}</p>
        </>
      ) : (
        <>
          <p><strong>Your Target:</strong> <em>[hidden]</em></p>
          <p><strong>Your Phishing Link:</strong> <em>[hidden]</em></p>
          <p><strong>Your Link's Defusal Code:</strong> <em>[hidden]</em></p>
        </>
      )}


      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
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
        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
      >
        📋 Copy Logs
      </button>

      <button
        onClick={() => setShowSensitive((prev) => !prev)}
        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
      >
        {showSensitive ? "🙈 Hide Sensitive Info" : "👁️ Show Sensitive Info"}
      </button>

      <button
        onClick={() => {
          axios.get(`http://localhost:3000/logs/${data.playerId}`)
            .then(res => setLogs(res.data.logs))
            .catch(() => alert("Failed to refresh logs"));
        }}
        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
      >
        🔄 Refresh Logs
      </button>
    </div>

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
