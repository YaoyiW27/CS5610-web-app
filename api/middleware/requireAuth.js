const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  console.log('Checking authentication...');
  console.log('Session:', req.session);
  console.log('User ID:', req.userId);
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = requireAuth;
