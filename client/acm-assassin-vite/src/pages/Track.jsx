import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Track() {
  const { linkId } = useParams();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [entryTime] = useState(Date.now());

  // Log page open
  useEffect(() => {
    axios.post(`http://localhost:3000/track/${linkId}/open`, {
      userAgent: navigator.userAgent
    }).catch(() => {
      console.warn("Failed to log open event");
    });
  }, [linkId]);

  // Track duration on exit
  useEffect(() => {
    const handleUnload = () => {
      const timeSpent = Math.floor((Date.now() - entryTime) / 1000);
      navigator.sendBeacon(
        `http://localhost:3000/track/${linkId}/duration`,
        JSON.stringify({ timeSpent, userAgent: navigator.userAgent })
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleUnload();
    });

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [entryTime, linkId]);

  const submitResponse = () => {
    axios.post(`http://localhost:3000/track/${linkId}/respond`, {
      name,
      note
    }).then(res => {
      setMessage(res.data.message);
      setSubmitted(true);
    }).catch(() => {
      setMessage("Something went wrong submitting your response.");
      setSubmitted(true);
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>🎣 ACM Assassins</h1>
      <p>
        This link is part of <a href="https://acm.cs.wm.edu" target="_blank" rel="noopener noreferrer">W&M ACM</a>'s Assassins game.
        Unfortunately, the link you clicked on was a decoy left by someone trying to get their target to this page.
        If you were tricked and would like to leave a message to the assassin, you can do so below.
      </p>

      {!submitted && (
        <>
          <input
            placeholder="Your name (or defusal code)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <textarea
            placeholder="Optional message to your assassin..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem', height: '80px' }}
          />
          <button onClick={submitResponse}>Submit</button>
        </>
      )}

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}
