exports.echo = (req, res) => {
  try {
    const info = {
      method: req.method,
      path: req.path,
      headers: req.headers,
      query: req.query,
      body: req.body,
      ip: req.ip || (req.connection && req.connection.remoteAddress)
    };
    res.json({ ok: true, received: info });
  } catch (err) {
    console.error('❌ Debug Echo Error:', err);
    res.status(500).json({ ok: false, message: 'Debug route error', error: err.stack });
  }
};
