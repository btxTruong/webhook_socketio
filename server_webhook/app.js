import express from 'express';
import axios from 'axios';
import cors from 'cors';
import globalConfig from '../global_config.json' assert {type: 'json'};

export const App = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.post('/api/v1/webhook', (req, res) => {
    const {app} = req;

    const io = app.get('socketIO');
    io.emit('webhook', {
      message: req.body.message,
      data: req.body.data,
    });

    res.status(200).end();
  });

  app.post('/api/v1/dispatch', async (req, res) => {
    await axios.post(`http://localhost:${globalConfig.apiDispatchPort}/api/v1/long-process`, {
      id: req.body.id,
    });
    res.status(200).send('Webhook received');
  });

  return app;
};
