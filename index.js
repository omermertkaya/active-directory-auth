const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
// SQLite'ı import et
const sqlite3 = require('sqlite3').verbose();

// Veritabanı bağlantısını oluştur
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata:', err);
    } else {
        console.log('Veritabanına başarıyla bağlandı');
        // Örnek tablo oluşturma
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT
        )`);
    }
});

// Route'ları import et
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');

// db'yi global olarak kullanılabilir yap
app.locals.db = db;

// Route'ları kullan
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});