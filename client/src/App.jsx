import {useEffect, useState} from 'react';
import {socket} from './socket.js';
import axios from 'axios';
import {Box, Button, Typography} from '@mui/material';

export const App = () => {
  const [isReceived, setIsReceived] = useState(false);
  const [data, setData] = useState(null);
  const [appId, setAppId] = useState(null);

  // https://socket.io/how-to/use-with-react
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function webhookEvent(data) {
      if (data.data.id === appId) {
        setIsReceived(true);
        setData(data);
      }
    }

    socket.on('webhook', webhookEvent);

    return () => {
      // https://socket.io/how-to/use-with-react#dependencies
      socket.off('webhook', webhookEvent);
    };
  }, [appId]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '50vh',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Button
        variant="contained"
        onClick={async () => {
          const id = Date.now();
          setAppId(id);
          await axios.post('http://localhost:3000/api/v1/dispatch', {
            id,
          });
        }}
      >
        Dispatch long process
      </Button>
      {
        appId
        && (
          <Typography
            sx={{
              color: 'blue',
            }}
          >
            ID Send: {appId}
          </Typography>
        )
      }
      <Typography
        sx={{
          color: isReceived ? 'green' : 'red',
        }}
      >
        {isReceived ? 'Received' : 'Not received'}
      </Typography>
      {
        data
        && (
          <Box>
            <Typography>
              Message: {data.message}
            </Typography>
            <Typography>
              Status: {data.data.status}
            </Typography>
            <Box>
              <Typography
                sx={{
                  color: data.data.id === appId ? 'green' : 'red',
                }}
              >
                ID Receive: {data.data.id} {data.data.id === appId
                ? '(Match)'
                : '(Not match)'}
              </Typography>
            </Box>
          </Box>
        )
      }
    </Box>
  );
};
