import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  response.json({ 'Message': 'Hellow World!' });
});

app.listen(3333);
