const express = require('express');
const router = express.Router();

// Dashboard Sayfası
router.get('/', (req, res) => {
    req.app.locals.db.all('SELECT * FROM notes ORDER BY id DESC', [], (err, notes) => {
        if (err) {
            console.error(err);
            notes = [];
        }
        res.render('dashboard', { 
            notes: notes,
            username: req.session.user,
            fullName: req.session.fullName, 
            authorization: req.session.auth

        });
    });
});

// Yeni not ekle
router.post('/add-note', (req, res) => {
    const { note_text } = req.body;
    req.app.locals.db.run(
        'INSERT INTO notes (content) VALUES (?)',
        [note_text],
        (err) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/dashboard');
        }
    );
});

// Not silme route'u ekle
router.post('/delete-note/:id', (req, res) => {
    const noteId = req.params.id;
    req.app.locals.db.run('DELETE FROM notes WHERE id = ?', [noteId], (err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/dashboard');
    });
});

// PATCH metodu ile güncelleme
router.put('/update-note/:id/:content', (req, res) => {
    const noteId = req.params.id;
    const newContent = req.params.content;
    
    req.app.locals.db.run(
        'UPDATE notes SET content = ? WHERE id = ?',
        [newContent, noteId],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Güncelleme sırasında bir hata oluştu' });
                return;
            }
            res.json({ success: true, message: 'Not başarıyla güncellendi' });
        }
    );
});



module.exports = router; 