/**
 * AUTH PARTIAL  (src/templates/partials/auth.js)
 * Returns additional files when --auth is set.
 * Produces JWT register/login routes + authenticate middleware.
 * Uses an in-memory user store as a stub — replace with a DB model.
 */
export function authFiles(lang, _variant) {
  if (lang !== 'nodejs') return {}; // Python/Go auth stubs left as TODO

  return {
    'src/middleware/auth.middleware.js': `import jwt        from 'jsonwebtoken';
import { config } from '../config/index.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'No token provided' } });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};
`,

    'src/routes/auth.routes.js': `import { Router } from 'express';
import bcrypt        from 'bcryptjs';
import jwt           from 'jsonwebtoken';
import { config }   from '../config/index.js';

const router = Router();

// ⚠ In-memory store — replace with a DB-backed User model before going to production
const _users = [];

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(422).json({ error: 'username and password required' });
    }
    if (_users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { id: String(Date.now()), username, password: hash };
    _users.push(user);
    res.status(201).json({ success: true, data: { id: user.id, username } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = _users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, username },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.json({ success: true, data: { token } });
  } catch (e) { next(e); }
});

export default router;
`,
  };
}
