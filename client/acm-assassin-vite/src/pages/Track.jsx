import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Track() {
  const { linkId } = useParams();
  const [pin, setPin] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(10);

  //once page is loaded, send a log to the server
  useEffect(() => {
    // Log that the page was opened
    axios.post(`http://localhost:3000/track/${linkId}/open`, {
      userAgent: navigator.userAgent
    }).catch(() => {
      console.warn("Failed to log open event");
    });
  }, []);
  
  // Start countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (!submitted) {
            axios.post(`http://localhost:3000/track/${linkId}/timeout`)
              .then(() => setMessage("⏱️ Time ran out — visit logged."))
              .catch(() => setMessage("Failed to log timeout."));
            setSubmitted(true);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);
  

  const submitPin = () => {
    axios.post(`http://localhost:3000/track/${linkId}/submit-pin`, { pin })
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage("Incorrect or no match"));
    setSubmitted(true);
  };

  const admit = () => {
    axios.post(`http://localhost:3000/track/${linkId}/admit`)
      .then(res => setMessage("You admitted being phished. 😔"))
      .catch(() => setMessage("Something went wrong."));
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>🚨 Suspicious Link Clicked</h1>
      <p>Countdown: {countdown}s</p>

      {!submitted && (
        <>
          <input
            placeholder="Enter defusal PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <button onClick={submitPin}>Disarm</button>
          <p style={{ margin: '1rem 0' }}>OR</p>
          <button onClick={admit}>You Got Me!</button>
        </>
      )}

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}
