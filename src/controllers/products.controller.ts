import { Request, Response } from 'express';
import { pool } from '../conf/dbConnection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE active = TRUE');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error interno de conexión a la base de datos' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido. Debe ser un entero positivo.' });
    return;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ? AND active = TRUE',
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado o inactivo' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, price, stock, description, brand, img } = req.body;

  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({ error: 'El precio debe ser un número mayor a cero.' });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, stock, description, brand || null, img || null]
    );
    res.status(201).json({ message: 'Producto creado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar el producto' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
const id = parseInt(req.params.id as string);
  const { name, price, stock, description, brand, img } = req.body;

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }
  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({ error: 'El precio debe ser un número mayor a cero.' });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE',
      [name, price, stock, description, brand || null, img || null, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado o inactivo' });
      return;
    }
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE',
      [id]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado o ya estaba inactivo' });
      return;
    }
    res.json({ message: 'Baja lógica aplicada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja el producto' });
  }
};

export const changePrice = async (req: Request, res: Response): Promise<void> => {

const id = parseInt(req.params.id as string);

  const { price } = req.body;

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }
  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({ error: 'El precio debe ser un número mayor a cero.' });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET price = ? WHERE id = ? AND active = TRUE',
      [price, id]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado o inactivo' });
      return;
    }
    res.json({ message: 'Precio modificado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el precio' });
  }
};
