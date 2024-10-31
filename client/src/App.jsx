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

  // https://socket.io/how-to/use-with-react
  useEffect(() => {
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
        onClick={async () => {
          const token = await getAccessTokenSilently();
          socket.auth = {token};
          socket.connect();
          const id = Date.now();
          setAppId(id);
          await axios.post(
            `http://localhost:${globalConfig.apiWebsocketPort}/api/v1/dispatch`,
            {
              id,
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
