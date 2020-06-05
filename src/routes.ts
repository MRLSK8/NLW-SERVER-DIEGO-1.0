import express from 'express';
import knex from './database/connection';

const routes = express.Router();

routes.get('/items', async (request, response) => {
  const items = await knex('items').select('*');

  const serializedItems = items.map((item) => {
    return {
      id: item.id,
      tittle: item.title,
      image_url: `http://localhost:3333/uploads/${item.image}`,
    };
  });

  return response.json(serializedItems);
});

routes.post('/points', async (request, response) => {
  const {
    name,
    email,
    whatsapp,
    city,
    uf,
    latitude,
    longitude,
    items,
  } = request.body;

  const transaction = await knex.transaction();

  const insertedIds = await transaction('points')
    .insert({
      image: 'image-fake',
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude,
    })
    .catch((error) => {
      response.status(500).json({ success: false, error });
    });

  const point_id = insertedIds && insertedIds[0];

  const pointsItems = items.map((item_id: number) => {
    return { item_id, point_id };
  });

  await transaction('points_items').insert(pointsItems);

  return response.json({ success: true });
});

export default routes;
