import express from 'express';
import * as http from 'node:http';
import axios from 'axios';
import cors from 'cors';

import globalConfig from '../global_config.json' assert {type: 'json'};

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

app.post('/api/v1/long-process', (req, res) => {
  setTimeout(async () => {
    await axios.post('http://localhost:3000/api/v1/webhook', {
      message: 'Long process completed',
      data: {
        status: 'success',
        id: req.body.id,
      },
    });
    res.status(200).send('Long process completed');
  }, 10000);
});

server.listen(globalConfig.apiDispatchPort, () => {
  console.log(
    `Server dispatcher listening on port ${globalConfig.apiDispatchPort}`);
});
