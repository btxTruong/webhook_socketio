import {App} from './app.js';
import * as http from 'node:http';
import {Server} from 'socket.io';

import globalConfig from "../global_config.json" assert {type: "json"};

const app = App();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('socketIO', io);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(globalConfig.apiWebsocketPort, () => {
  console.log(`Server webhook listening on port ${globalConfig.apiWebsocketPort}`);
});
