import pool from "../config/database.js";

export const categoryUpdate = async (req, res) => {
    const categoryObject = req.body;
  
    // Validate input
    const keys = Object.keys(categoryObject);
    if (keys.length !== 7) {
      return res.status(400).json({ message: 'Exactly 7 categories are required.' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Get first 7 row IDs
      const { rows: existingRows } = await client.query('SELECT id FROM category ORDER BY id LIMIT 7');
  
      if (existingRows.length < 7) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Category table must have at least 7 rows to update.' });
      }
  
      // Sort keys to ensure consistent order (optional but recommended)
      const sortedKeys = keys.sort();
  
      // Update each row
      for (let i = 0; i < 7; i++) {
        const rowId = existingRows[i].id;
        const categoryValue = categoryObject[sortedKeys[i]];
  
        await client.query(
          'UPDATE category SET category = $1, updatedAt = NOW() WHERE id = $2',
          [categoryValue, rowId]
        );
      }
  
      // Fetch updated rows
      const { rows: updatedRows } = await client.query(
        'SELECT * FROM category WHERE id = ANY($1::int[]) ORDER BY id',
        [existingRows.map(r => r.id)]
      );
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Categories updated successfully.', data: updatedRows });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
      res.status(500).json({ message: 'Failed to update categories.', error: error.message });
    } finally {
      client.release();
    }
  };

export const getCategory = async (req, res) => {
    const client = await pool.connect();
  
    try {
      const { rows } = await client.query(
        'SELECT id, category, createdAt, updatedAt, createdBy FROM category ORDER BY id LIMIT 7'
      );
  
      if (rows.length < 7) {
        return res.status(400).json({ message: 'Less than 7 categories found.' });
      }
  
      res.status(200).json({ message: 'Categories retrieved successfully.', data: rows });
  
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      res.status(500).json({ message: 'Error retrieving categories.', error: error.message });
    } finally {
      client.release();
    }
  };
  