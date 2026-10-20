export default async function handler(req, res) {
  const code = req.query.code;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send('Authorization code missing from query.');
  }

  if (!clientId || !clientSecret) {
    return res.status(500).send('OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET missing.');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send(`GitHub OAuth Error: ${data.error_description || data.error}`);
    }

    const token = data.access_token;
    const provider = 'github';

    const htmlContent = `
<!doctype html>
<html>
<body>
  <p>Authorizing with GitHub... Please wait.</p>
  <script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:${provider}:success:${JSON.stringify({ token, provider })}',
          e.origin
        );
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:${provider}", "*");
    })();
  </script>
</body>
</html>
    `.trim();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(htmlContent);
  } catch (err) {
    res.status(500).send(`Server error: ${err.message}`);
  }
}
