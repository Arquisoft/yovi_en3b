const express = require('express');

let axios = require('axios');

const app = express();
app.disable('x-powered-by')
const port = process.env.PORT || 3000;

// Keep tests local-only to avoid sandbox/network restrictions in CI.
const isVitest = Boolean(process.env.VITEST || process.env.VITEST_POOL_ID || process.env.NODE_ENV === 'test');
if (isVitest) {
  const originalListen = app.listen.bind(app);
  app.listen = (listenPort, ...args) => {
    if (args.length === 0 || typeof args[0] === 'function') {
      return originalListen(listenPort, '127.0.0.1', ...args);
    }
    return originalListen(listenPort, ...args);
  };
}

const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');
const userRoutes = require('./src/modules/user/entry-points/userRoutes');
const matchRoutes = require('./src/modules/match/entry-points/matchRoutes');
const rankingRoutes = require('./src/modules/ranking/entry-points/rankingRoutes');

const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

try {
  const swaggerDocument = YAML.load(fs.readFileSync('./openapi.yaml', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log(e);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && origin.startsWith('http://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// --- BOTS API ---
app.get('/play', async (req, res) => {
  try {
      const positionString = req.query.position;
      const rawBotId = req.query.bot_id || 'random_bot';

      // Hardcoded values for bot (sequrity)
      const botMap = {
          'random_bot': 'random_bot',
          'easy_bot': 'easy_bot',
          'medium_bot': 'medium_bot',
          'hard_bot': 'hard_bot'
      };
      const safeBotId = botMap[rawBotId];

      if (!safeBotId) {
          return res.status(400).json({ error: "El bot especificado no es válido." });
      }

      if (!positionString) {
          return res.status(400).json({ error: "Falta el parámetro 'position' en la URL" });
      }

      // Turn it into a JSON
      let rustPayload;
      try {
          rustPayload = JSON.parse(positionString);
      } catch (e) {
          return res.status(400).json({ error: "El parámetro position no es un JSON válido" });
      }

      // Make the call to the Rust module

      /*
      const { URL } = require('node:url');

      const ALLOWED_HOSTS = ['gamey', 'localhost', '20.199.16.53'];

      const rawUrl = process.env.DB_HOST || 'http://gamey:4000';
      const parsedUrl = new URL(rawUrl);

      if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
          throw new Error('Invalid BOT_SERVICE_URL');
      }

      const response = await axios.post(
          `${parsedUrl.origin}/v1/ybot/choose/${safeBotId}`,
          rustPayload
      );
      */
      const allowedKeys = ['size', 'turn', 'players', 'layout'];
      const sanitizedPayload = {};
      for (const key of allowedKeys) {
          if (rustPayload[key] !== undefined) {
              sanitizedPayload[key] = rustPayload[key];
          }
      }

      const rustResponse = await axios.post(
          `http://gamey:4000/v1/ybot/choose/${safeBotId}`,
          sanitizedPayload
      );

      // Return with the correct format
      // FIX 2: Usamos rustResponse en lugar de response
      if (rustResponse.data.coords) {
          res.json({ coords: rustResponse.data.coords });
      } else if (rustResponse.data.action) {
          res.json({ action: rustResponse.data.action });
      } else {
          res.json(rustResponse.data); 
      }

  } catch (error) {
      console.error("Error trying to connect to Rust:", error.message);
      res.status(502).json({ error: "Rust module failed" });
  }
});

app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/ranking', rankingRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`)
  })
}

app._setAxios = (mock) => { axios = mock; };
module.exports = app;
