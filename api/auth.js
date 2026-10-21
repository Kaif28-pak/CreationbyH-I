export default function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const clientId = process.env.OAUTH_CLIENT_ID;

  if (!clientId) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`
      <!doctype html>
      <html>
      <head><title>OAUTH_CLIENT_ID Missing</title></head>
      <body style="font-family: sans-serif; background: #fdf2f4; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 5px solid #d81159;">
          <h2 style="color: #d81159; margin-top: 0;">Vercel Setup: OAUTH_CLIENT_ID Missing</h2>
          <p>Aapke Vercel project ki <strong>Settings &rarr; Environment Variables</strong> mai <code>OAUTH_CLIENT_ID</code> add karna baqi hai.</p>
          <ol style="line-height: 1.8;">
            <li>GitHub OAuth App se <strong>Client ID</strong> copy karein.</li>
            <li>Vercel Dashboard mai apne project ki <strong>Settings &rarr; Environment Variables</strong> par jayein.</li>
            <li>Key: <code>OAUTH_CLIENT_ID</code> aur Value paste kar ke <strong>Save</strong> karein.</li>
            <li>Usi tarha <code>OAUTH_CLIENT_SECRET</code> bhi add karein.</li>
            <li>Vercel Dashboard ke <strong>Deployments</strong> tab mai ja kar latest deployment par <strong>Redeploy</strong> click karein.</li>
          </ol>
        </div>
      </body>
      </html>
    `);
  }

  const redirectUri = `${protocol}://${host}/api/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;

  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
}
