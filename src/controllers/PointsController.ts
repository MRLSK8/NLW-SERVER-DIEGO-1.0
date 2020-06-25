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

    try {
      await knex.transaction(async (trx) => {
        const point = {
          image: request.file.filename,
          name,
          email,
          whatsapp,
          city,
          uf,
          latitude,
          longitude,
        };

        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0];

        const pointsItems = items
          .split(',')
          .map((item: String) => Number(item.trim()))
          .map((item_id: Number) => {
            return { item_id, point_id };
          });

        await trx('points_items').insert(pointsItems);

        return response.json({ id: point_id, ...point });
      });
    } catch (error) {
      return response.status(400).json({ Error: error });
    }
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ Message: 'Point not found' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://localhost:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id);

    return response.json({ point: serializedPoint, items });
  }

  async showAll(request: Request, response: Response) {
    const points = await knex('points').select('*');

    if (!points) {
      return response.status(400).json({ Message: 'Points not found' });
    }

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://localhost:3333/uploads/${point.image}`,
      };
    });

    return response.json({ point: serializedPoints });
  }

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'points_items.point_id')
      .whereIn('points_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    if (!points) {
      return response.status(400).json({ Message: 'No points found' });
    }

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://localhost:3333/uploads/${point.image}`,
      };
    });

    return response.json({ point: serializedPoints });
  }
}

export default PointsController;
