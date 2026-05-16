const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const r = req.user.role === 'Admin'
      ? await db.query('SELECT * FROM projects ORDER BY id')
      : await db.query('SELECT p.* FROM projects p JOIN project_members pm ON p.id=pm.project_id WHERE pm.user_id=$1', [req.user.id]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admins only' });
    const { name, desc, color, members } = req.body;
    const p = await db.query('INSERT INTO projects(name,description,color,created_by) VALUES($1,$2,$3,$4) RETURNING *', [name, desc, color, req.user.id]);
    const proj = p.rows[0];
    for (const uid of [req.user.id, ...(members || [])]) {
      await db.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [proj.id, uid]);
    }
    res.json(proj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admins only' });
    await db.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;