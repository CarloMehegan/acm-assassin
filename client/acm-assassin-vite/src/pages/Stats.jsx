import { useEffect, useState } from "react";
import axios from "axios";

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/stats")
      .then(res => setStats(res.data))
      .catch(() => setStats([]));
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1>🎯 Player Stats</h1>
      <p>Hits: How many times this player's link has tricked someone.</p>
      <p>Messages: How many messages this player's link has received.</p>
      <p>Opens: How many times this player's link has been opened.</p>
      <p>Time Spent: How long this player's link has been open.</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Player</th>
            <th>Status</th>
            <th>🎯 Hits</th>
            <th>💬 Messages</th>
            <th>👀 Opens</th>
            <th>🕒 Time Spent</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((player, i) => (
            <tr key={i} style={{ borderTop: "1px solid #ccc" }}>
              <td>{player.username}</td>
              <td>{player.status === "Eliminated" ? "💀 Eliminated" : "🎣 Active"}</td>
              <td>{player.admittedHits}</td>
              <td>{player.messageCount}</td>
              <td>{player.totalOpens}</td>
              <td>{formatTime(player.totalTimeSpent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
