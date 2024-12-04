import mysql from 'mysql2';

// Crear conexión
const pool = mysql.createPool({
    host: 'localhost', // Cambia según tu configuración
    user: 'root', // Cambia por tu usuario de MySQL
    password: '', // Cambia por tu contraseña
    database: 'app_autech' // Cambia por tu base de datos
});

// Exportar el pool para reutilizarlo
export default pool;
