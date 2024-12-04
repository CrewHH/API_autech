import express from 'express';
import db from '../before/database.js';

const router = express.Router();

// Obtener todas las categorías
router.get('/', (req, res) => {
  const query = 'SELECT * FROM categorias';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      res.status(500).json({ error: 'Error al obtener categorías' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Agregar una nueva categoría
router.post('/', (req, res) => {
  const { nombre_categoria, descripcion } = req.body;
  if (!nombre_categoria) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }
  const query = 'INSERT INTO categorias (nombre_categoria, descripcion) VALUES (?, ?)';
  const values = [nombre_categoria, descripcion || null];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al agregar categoría:', err);
      res.status(500).json({ error: 'Error al agregar categoría' });
    } else {
      res.status(201).json({ message: 'Categoría agregada con éxito', id_categoria: result.insertId });
    }
  });
});

// Actualizar una categoría existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_categoria, descripcion } = req.body;
  const query = 'UPDATE categorias SET nombre_categoria = ?, descripcion = ? WHERE id_categoria = ?';
  const values = [nombre_categoria, descripcion || null, id];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar categoría:', err);
      res.status(500).json({ error: 'Error al actualizar categoría' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Categoría no encontrada' });
    } else {
      res.status(200).json({ message: 'Categoría actualizada con éxito' });
    }
  });
});

// Eliminar una categoría
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM categorias WHERE id_categoria = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar categoría:', err);
      res.status(500).json({ error: 'Error al eliminar categoría' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Categoría no encontrada' });
    } else {
      res.status(200).json({ message: 'Categoría eliminada con éxito' });
    }
  });
});

export default router;