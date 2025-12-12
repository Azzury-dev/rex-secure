const express = require('express');
const { query } = require('../../shared/db');
const { DEFAULT_CONFIG } = require('../../bot/services/config');
const router = express.Router();

router.get('/', async (_req, res) => {
  const r = await query(`SELECT id, name FROM guild ORDER BY name ASC`);
  res.json(r.rows);
});

router.get('/list/json', async (req, res) => {
  const r = await query(`SELECT id, name FROM guild ORDER BY name ASC`);
  res.json(r.rows);
});

router.get('/:id/config', async (req, res) => {
  const r = await query(`SELECT config_json FROM guild WHERE id = ?`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'guild_not_found' });
  const raw = r.rows[0].config_json;
  try { res.json(typeof raw === 'string' ? JSON.parse(raw) : raw); }
  catch { res.json(DEFAULT_CONFIG); }
});

router.post('/:id/config', async (req, res) => {
  await query(`UPDATE guild SET config_json = ? WHERE id = ?`,
    [JSON.stringify(req.body || {}), req.params.id]);
  res.json({ ok: true });
});

router.get('/:id/incidents', async (req, res) => {
  const r = await query(
    `SELECT id, type, risk_score, started_at, resolved_at
     FROM incident WHERE guild_id = ? ORDER BY id DESC`,
    [req.params.id]
  );
  res.json(r.rows);
});

router.get('/:id/snapshots', async (req, res) => {
  const r = await query(
    `SELECT id, scope, created_at, by_user
     FROM snapshot WHERE guild_id = ? ORDER BY id DESC`,
    [req.params.id]
  );
  res.json(r.rows);
});

module.exports = router;
