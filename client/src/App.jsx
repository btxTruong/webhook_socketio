import {useEffect, useState} from 'react';
import './App.css';
import {socket} from './socket.js';
import axios from 'axios';

function App() {
  const [isReceived, setIsReceived] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    function webhookEvent(data) {
      socket.disconnect();
      setData(data);
      setIsReceived(true);
    }

    socket.on('webhook', webhookEvent);

    return () => {
      socket.off('webhook', webhookEvent);
    };
  }, []);

  return (
    <>
      <button
        onClick={async () => {
          socket.connect();
          await axios.post('http://localhost:3000/api/v1/dispatch');
        }}
      >
        Dispatch long process
      </button>
      <p
        style={{
          color: isReceived ? 'green' : 'red',
        }}
      >
        {isReceived ? 'Received' : 'Not received'}
      </p>
      <p>
        {data && (JSON.stringify(data))}
      </p>
    </>
  );
}

export default App;
