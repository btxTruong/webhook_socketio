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
    const roomId = req.body.data.roomId;

    const io = app.get('socketIO');
    io.to(roomId).emit('webhook', {
      message: req.body.message,
      data: req.body.data,
    });

    res.status(200).end();
  });

  app.post('/api/v1/dispatch', checkJwt, async (req, res) => {
    axios.post(
      `http://localhost:${globalConfig.apiDispatchPort}/api/v1/long-process`, {
        roomId: req.body.roomId,
      });
    res.status(200).end();
  });

  return app;
};
