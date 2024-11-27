import express from 'express';
import { PORT } from './config.js';
import { UserRepository } from './user-repository.js';
import db from './before/database.js';

const app = express();
app.use(express.json())

import productosRouter from './routes/productos.js';
app.use('/api/productos', productosRouter);

app.get('/',(req,res ) => {
    res.send('<h1>Hello Vic!</h1>')
});

app.post('/login', async (req,res) =>{
    const { username , password } = req.body
    try{
        const user = await UserRepository.login({ username , password }) 
    } catch(error){
        res.status(401).send(error.message)
    }
    });


app.post('/register', async (req,res) =>{
    const { username , password } = req.body
    console.log({ username , password })

    try{
        const id = await UserRepository.create({ username , password })
        res.send({ id })
    } catch(error){
        res.status(400).send(error.message)
    }
});
app.post('/logout', (req,res) =>{});
app.post('/protected', (req,res) =>{});

db.getConnection((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    } else {
        console.log('Conexión exitosa a la base de datos');
        // Arrancar servidor solo si la conexión es exitosa
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        });
    }
});
