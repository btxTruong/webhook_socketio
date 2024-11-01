import {useEffect, useState} from 'react';
import {socket} from './socket.js';
import axios from 'axios';
import {Box, Button, Typography} from '@mui/material';
import globalConfig from '../../global_config.json';
import {useAuth0} from '@auth0/auth0-react';

export const App = () => {
  const {
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  const [isReceived, setIsReceived] = useState(false);
  const [data, setData] = useState(null);
  const [appId, setAppId] = useState(null);
  const [socketId, setSocketId] = useState(null);

  const reset = () => {
    setIsReceived(false);
    setData(null);
    setAppId(null);
  }

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getAccessTokenSilently();
      if (token && !socket.connected) {
        socket.auth = {token};
        socket.connect();
      }
    };
    connectSocket().catch(console.error);
  }, [getAccessTokenSilently, isAuthenticated]);

  // https://socket.io/how-to/use-with-react
  useEffect(() => {
    return () => {
      try {
        socket.disconnect();
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  useEffect(() => {
    function webhookEvent(data) {
      setIsReceived(true);
      setData(data);
    }

    function onConnect() {
      setSocketId(socket.id);
    }

    socket.on('connect', onConnect);
    socket.on('webhook', webhookEvent);

    return () => {
      // should in order
      socket.off('connect', onConnect);
      // https://socket.io/how-to/use-with-react#dependencies
      socket.off('webhook', webhookEvent);
    };
  }, [appId]);

  if (!isAuthenticated) {
    return <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '50vh',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography>
        Login to continue
      </Typography>
    </Box>;
  }

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
        disabled={!socketId}
        onClick={async () => {
          reset();
          const token = await getAccessTokenSilently();
          setAppId(socketId);
          await axios.post(
            `http://localhost:${globalConfig.apiWebsocketPort}/api/v1/dispatch`,
            {
              socketId,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
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
              marginTop: 2,
            }}
          >
            ID Send: {appId}
          </Typography>
        )
      }
      <Typography
        sx={{
          color: isReceived ? 'green' : 'red',
          marginTop: 2,
        }}
      >
        {isReceived ? 'Received' : 'Not received'}
      </Typography>
      {
        data
        && (
          <Box
            sx={{
              marginTop: 2,
            }}
          >
            <Typography>
              Message: {data.message}
            </Typography>
            <Typography>
              Status: {data.data.status}
            </Typography>
            <Box
              sx={{
                marginTop: 1,
              }}
            >
              <Typography
                sx={{
                  color: data.data.socketId === appId ? 'green' : 'red',
                }}
              >
                ID Receive: {data.data.socketId} {data.data.socketId === appId
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
