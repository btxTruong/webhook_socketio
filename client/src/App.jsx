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
  const [isRoomJoined, setIsRoomJoined] = useState(false);

  const reset = () => {
    setIsReceived(false);
    setData(null);
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
    const appId = 'app-goood1'
    setAppId(appId);
    socket.emit('join-room', appId);
  }, []);

  useEffect(() => {
    function onRoomJoined(data) {
      console.log('>> already joined room', data);
      setIsRoomJoined(true);
    }

    socket.on('joined-room', onRoomJoined);

    return () => {
      // should in order
      socket.off('joined-room', onRoomJoined);
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
        disabled={!socketId || !isRoomJoined}
        onClick={async () => {
          reset();
          const token = await getAccessTokenSilently();
          await axios.post(
            `http://localhost:${globalConfig.apiWebsocketPort}/api/v1/dispatch`,
            {
              roomId: appId,
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
                  color: data.data.roomId === appId ? 'green' : 'red',
                }}
              >
                ID Receive: {data.data.roomId} {data.data.roomId === appId
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
