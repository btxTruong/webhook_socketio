import express from 'express';
import axios from 'axios';
import cors from 'cors';
import globalConfig from '../global_config.json' assert {type: 'json'};
import authConfig from '../auth_config.json' assert {type: 'json'};

import {auth} from 'express-oauth2-jwt-bearer';

const checkJwt = auth(
  {
    audience: authConfig.audience,
    issuerBaseURL: `https://${authConfig.domain}/`,
    algorithms: ['RS256'],
  });

export const App = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.post('/api/v1/webhook', (req, res) => {
    const {app} = req;
    const socketId = req.body.data.socketId;

    const io = app.get('socketIO');
    io.to(socketId).emit('webhook', {
      message: req.body.message,
      data: req.body.data,
    });

    res.status(200).end();
  });

  app.post('/api/v1/dispatch', checkJwt, async (req, res) => {
    axios.post(
      `http://localhost:${globalConfig.apiDispatchPort}/api/v1/long-process`, {
        socketId: req.body.socketId,
      });
    res.status(200).end();
  });

  return app;
};
