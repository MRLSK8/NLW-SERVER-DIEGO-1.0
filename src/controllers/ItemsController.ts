import { Request, Response } from 'express';
import knex from '../database/connection';
import url from '../utils/url';

// index, show, update, delete
class ItemController {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');

    const serializedItems = items.map((item) => {
      return {
        id: item.id,
        tittle: item.title,
        image_url: `${url}uploads/${item.image}`,
      };
    });

    return response.json(serializedItems);
  }
}

export default ItemController;
