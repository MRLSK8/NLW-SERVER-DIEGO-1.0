import { Request, Response } from 'express';
import knex from '../database/connection';

// index, show, update, delete
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
}

export default PointsController;
