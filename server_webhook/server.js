import {App} from './app.js';
import * as http from 'node:http';
import {Server} from 'socket.io';

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

server.listen(3000, () => {
  console.log('Server webhook listening on port 3000');
});
