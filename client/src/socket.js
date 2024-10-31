import {io} from 'socket.io-client';

import globalConfig from '../../global_config.json';

export const socket = io(`http://localhost:${globalConfig.apiWebsocketPort}`, {
  autoConnect: false,
});
