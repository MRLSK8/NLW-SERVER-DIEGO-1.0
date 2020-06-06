import { Request, Response } from 'express';
import knex from '../database/connection';

// create, index, show, update, delete
class PointsController {
  async create(request: Request, response: Response) {
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

    const point = {
      image: 'image-fake',
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude,
    };

    const insertedIds = await transaction('points')
      .insert(point)
      .catch((error: Error) => {
        response.status(500).json({ success: false, error });
      });

    const point_id = insertedIds && insertedIds[0];

    const pointsItems = items.map((item_id: number) => {
      return { item_id, point_id };
    });

    await transaction('points_items').insert(pointsItems);

    return response.json({ id: point_id, ...point });
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ Message: 'Point not found' });
    }

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id);

    return response.json({ point, items });
  }

  async index(request: Request, response: Response) {
    const points = await knex('points').select('*');

    if (!points) {
      return response.status(400).json({ Message: 'Points not found' });
    }

    return response.json(points);
  }
}

export default PointsController;
