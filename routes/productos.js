import express from 'express';
import db from '../before/database.js'; // Importa la conexión a MySQL con ES Modules

const router = express.Router();

// Obtener todos los productos
router.get('/', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los productos.' });
        res.json(results);
    });
});

// Obtener un producto por ID
router.get('/:id_producto', (req, res) => {
    const { id_producto } = req.params;
    db.query('SELECT * FROM productos WHERE id_producto = ?', [id_producto], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener el producto.' });
        if (results.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(results[0]);
    });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
    const { nombre_producto, descripcion, precio_inicial, imagen_url, id_categoria } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!nombre_producto || !descripcion || !precio_inicial || !id_categoria) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios excepto id_usuario.' });
    }

    // Extraer id_usuario del token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Token no proporcionado o inválido.' });
    }

    const token = authHeader.split(' ')[1];
    let id_usuario;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        id_usuario = decoded.id; // Se asume que el token incluye el campo `id`
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido.' });
    }

    // Crear el objeto del nuevo producto
    const nuevoProducto = {
        nombre_producto,
        descripcion,
        precio_inicial,
        imagen_url,
        id_categoria,
        id_usuario // Asignar automáticamente el id_usuario del token
    };

    // Insertar en la base de datos
    db.query('INSERT INTO productos SET ?', nuevoProducto, (err, results) => {
        if (err) {
            console.error('Error al insertar el producto:', err);
            return res.status(500).json({ error: 'Error al crear el producto.' });
        }
        res.status(201).json({ id_producto: results.insertId, ...nuevoProducto });
    });
});

// Actualizar un producto
router.put('/:id_producto', (req, res) => {
    const { id_producto } = req.params;
    const { nombre, precio, descripcion } = req.body;

    db.query(
        'UPDATE productos SET nombre = ?, precio = ?, descripcion = ? WHERE id_producto = ?',
        [nombre, precio, descripcion, id_producto],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar el producto.' });
            if (results.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
            res.json({ id_producto, nombre, precio, descripcion });
        }
    );
});

// Eliminar un producto
router.delete('/:id_producto', (req, res) => {
    const { id_producto } = req.params;

    db.query('DELETE FROM productos WHERE id_producto = ?', [id_producto], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar el producto.' });
        if (results.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json({ mensaje: 'Producto eliminado con éxito' });
    });
});

// Obtener productos por categoría
router.get('/categoria/:id_categoria', (req, res) => {
    const { id_categoria } = req.params;

    db.query('SELECT * FROM productos WHERE id_categoria = ?', [id_categoria], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los productos por categoría.' });
        res.json(results);
    });
});

// Exportar el router como exportación predeterminada
export default router;
