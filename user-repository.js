import DBLocal from 'db-local';
const { Schema } = new DBLocal({ path: './db' });
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SALT_ROUNDS, JWT_SECRET } from './config.js';
import z from 'zod';

// Esquemas de validación usando Zod
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters long');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
const emailSchema = z.string().email('Invalid email address');

// Obtener el directorio actual equivalente a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construir la ruta al archivo JSON
const USERS_DB = path.join(__dirname, './db/user.json');

console.log('Ruta a USERS_DB:', USERS_DB);

export class UserRepository {
    static async readUsers() {
        try {
            const data = await fs.readFile(USERS_DB, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') return []; // Si el archivo no existe, retorna una lista vacía
            throw error; // Propaga otros errores
        }
    }

    static async writeUsers(users) {
        await fs.writeFile(USERS_DB, JSON.stringify(users, null, 2));
    }

    // Método para registrar un usuario
    static async create({ username, password, email }) {
        // Validar usando Zod
        usernameSchema.parse(username);
        passwordSchema.parse(password);
        emailSchema.parse(email);

        const users = await this.readUsers();

        // Verificar si el username o email ya existen
        const userExists = users.some((user) => user.username === username || user.email === email);
        if (userExists) {
            throw new Error('Username or email already exists');
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1, // Generar un ID único
            username,
            email,
            password: hashedPassword,
        };

        users.push(newUser);
        await this.writeUsers(users);
        return newUser.id; // Retorna el ID del nuevo usuario
    }

    // Método para iniciar sesión con email y password
    static async login({ email, password }) {
        // Validar usando Zod
        emailSchema.parse(email);
        passwordSchema.parse(password);

        const users = await this.readUsers();

        // Buscar el usuario por email
        const user = users.find((u) => u.email === email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Comparar la contraseña ingresada con la almacenada
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        return { id: user.id, username: user.username, email: user.email, token };
    }
}
