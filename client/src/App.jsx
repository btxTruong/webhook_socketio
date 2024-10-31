import {useEffect, useState} from 'react';
import './App.css';
import {socket} from './socket.js';
import axios from 'axios';

function App() {
  const [isReceived, setIsReceived] = useState(false);
  const [data, setData] = useState(null);
  const [appId, setAppId] = useState(null);

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
          const id = Date.now();
          setAppId(id);
          await axios.post('http://localhost:3000/api/v1/dispatch', {
            id,
          });
        }}
      >
        Dispatch long process
      </button>
      {
        appId
        && (
          <p
            style={{
              color: 'blue',
            }}
          >
            ID Send: {appId}
          </p>
        )
      }

      <p
        style={{
          color: isReceived ? 'green' : 'red',
        }}
      >
        {isReceived ? 'Received' : 'Not received'}
      </p>
      {
        data
        && (
          <div>
            <p>
              Message: {data.message}
            </p>
            <p>
              Status: {data.data.status}
            </p>
            <div>
              <p
                style={{
                  color: data.data.id === appId ? 'green' : 'red',
                }}
              >
                ID Receive: {data.data.id} {data.data.id === appId
                ? '(Match)'
                : '(Not match)'}
              </p>
            </div>
          </div>
        )
      }
    </>
  );
}

export default App;
