const express = require('express');
const router = express.Router();
const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = new Clerk({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // 使用Clerk处理GitHub OAuth回调
    const session = await clerk.createSession({
      strategy: "oauth_github",
      code
    });

    // 设置session cookie
    res.cookie('__session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    });

    res.redirect('/search');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/login?error=github_auth_failed');
  }
});

// Facebook OAuth callback
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // 使用Clerk处理Facebook OAuth回调
    const session = await clerk.createSession({
      strategy: "oauth_facebook",
      code
    });

    // 设置session cookie
    res.cookie('__session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    });

    res.redirect('/search');
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.redirect('/login?error=facebook_auth_failed');
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const sessionToken = await clerk.createSession({
      identifier,
      password,
    });
    
    res.cookie('__session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 注册路由
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const user = await clerk.users.createUser({
      emailAddress: email,
      password,
      firstName,
      lastName
    });

    res.json({ success: true, userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 登出路由
router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('__session');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;