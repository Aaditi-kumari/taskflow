const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const r = req.user.role === 'Admin'
      ? await db.query('SELECT * FROM tasks ORDER BY due_date')
      : await db.query('SELECT * FROM tasks WHERE assignee_id=$1 ORDER BY due_date', [req.user.id]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, project_id, assignee_id, status, priority, due_date } = req.body;
    const r = await db.query('INSERT INTO tasks(title,project_id,assignee_id,status,priority,due_date,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, project_id, assignee_id || req.user.id, status || 'To Do', priority || 'Med', due_date, req.user.id]);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const r = await db.query('UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admins only' });
    await db.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;