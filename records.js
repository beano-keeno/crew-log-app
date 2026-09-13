const { kv } = require('@vercel/kv');

const KEY = 'crew-log-records';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const records = (await kv.get(KEY)) || [];
      res.status(200).json({ records });
      return;
    }

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const records = (body && body.records) || [];
      if (!Array.isArray(records)) {
        res.status(400).json({ error: 'records must be an array' });
        return;
      }
      await kv.set(KEY, records);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    // Most likely cause: no KV/Redis database connected to this project yet.
    res.status(500).json({
      error: String((err && err.message) || err),
      hint: 'Make sure a KV (Redis) database is connected to this Vercel project under Storage.'
    });
  }
};
