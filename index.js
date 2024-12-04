import express from 'express';
import { PORT } from './config.js';
import { UserRepository } from './user-repository.js';
import db from './before/database.js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import z from 'zod';
import bodyParser from 'body-parser';
import { JWT_SECRET } from './config.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());


// Configuración de Multer
const storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se almacenarán las imágenes
},
filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
},
});
const upload = multer({ storage: storage });

// Importar rutas
import productosRouter from './routes/productos.js';
app.use('/api/productos', productosRouter);

import categoriasRouter from './routes/categorias.js'
app.use('/api/categorias', categoriasRouter);

// Endpoint para subir imágenes y guardar productos
app.post('/api/productos', upload.single('image'), (req, res) => {
const { nombre_producto, descripcion, precio_inicial, id_categoria, id_usuario } = req.body;

  // Verificar si se subió la imagen
if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen.' });
}

  // Ruta de la imagen subida
const imagenUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  // Query SQL para insertar el producto
const query = `
    INSERT INTO productos (nombre_producto, descripcion, precio_inicial, imagen_url, id_categoria, id_usuario)
    VALUES (?, ?, ?, ?, ?, ?)
`;
const values = [nombre_producto, descripcion, precio_inicial, imagenUrl, id_categoria, id_usuario];

  // Ejecutar la consulta
db.query(query, values, (err, result) => {
    if (err) {
    console.error('Error al guardar el producto:', err);
    return res.status(500).json({ error: 'Error al guardar el producto.' });
    }

    res.status(200).json({
    message: 'Producto guardado con éxito',
    id_producto: result.insertId,
    imagen_url: imagenUrl,
    });
});
});

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static('uploads'));

// Ruta principal
app.get('/', (req, res) => {
res.send('<h1>Hello Vic!</h1>');
});


// Esquema Zod para validación
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Ruta para registro
app.post('/register', async (req, res) => {
  try {
      const validatedData = registerSchema.parse(req.body);
      const id = await UserRepository.create(validatedData);
      res.json({ id });
  } catch (error) {
      if (error instanceof z.ZodError) {
          res.status(400).json({ errors: error.errors });
      } else {
          res.status(400).send(error.message);
      }
  }
});

// Ruta para login
app.post('/login', async (req, res) => {
  try {
    console.log('Cuerpo recibido:', req.body); // Verifica el contenido de req.body
    const validatedData = loginSchema.parse(req.body);
    const user = await UserRepository.login(validatedData);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Error de Zod:', error.errors);
      res.status(400).json({ errors: error.errors });
    } else {
      console.log('Otro error:', error.message);
      res.status(401).send(error.message);
    }
  }
});

// Conexión a la base de datos
db.getConnection((err) => {
if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
} else {
    console.log('Conexión exitosa a la base de datos');
    // Arrancar el servidor solo si la conexión es exitosa
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}
});
 