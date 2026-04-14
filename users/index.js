const express = require('express');
const axios = require('axios'); // <-- AÑADIDO: Necesario para llamar a Rust
const app = express();
app.disable('x-powered-by')
const port = process.env.PORT || 3000;
const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');
const userRoutes = require('./src/modules/user/entry-points/userRoutes');
const matchRoutes = require('./src/modules/match/entry-points/matchRoutes');
const rankingRoutes = require('./src/modules/ranking/entry-points/rankingRoutes');
const gamesaveRoutes = require('./src/modules/gamesave/entry-points/gamesaveRoutes');

const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

try {
  const swaggerDocument = YAML.load(fs.readFileSync('./openapi.yaml', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Ojo: tu ruta es /api-docs (con S)
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
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// --- API DE BOTS (ESTÁNDAR COMPETICIÓN PROFESOR) ---
app.get('/play', async (req, res) => {
  try {
      // 1. Extraemos los parámetros de la URL (Query Params)
      const positionString = req.query.position;
      const bot_id = req.query.bot_id || 'random_bot';

      if (!positionString) {
          return res.status(400).json({ error: "Falta el parámetro 'position' en la URL" });
      }

      // 2. Convertimos el string de la URL a un objeto JSON
      let rustPayload;
      try {
          rustPayload = JSON.parse(positionString);
      } catch (e) {
          return res.status(400).json({ error: "El parámetro position no es un JSON válido" });
      }

      // 3. Llamamos al contenedor de Rust (gamey) enviándole el JSON
      const RUST_BOT_URL = process.env.BOT_SERVICE_URL || 'http://gamey:4000';
      const response = await axios.post(`${RUST_BOT_URL}/v1/ybot/choose/${bot_id}`, rustPayload);

      // 4. Devolvemos EXACTAMENTE el formato que pide el profesor
      if (response.data.coords) {
          res.json({ coords: response.data.coords });
      } else if (response.data.action) {
          res.json({ action: response.data.action });
      } else {
          // Por si Rust devuelve un resign o algo distinto
          res.json(response.data); 
      }

  } catch (error) {
      console.error("Error conectando con Rust:", error.message);
      res.status(502).json({ error: "El motor de juego (Rust) no responde o formato inválido" });
  }
});

app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/ranking', rankingRoutes);
app.use('/gamesaves', gamesaveRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`)
  })
}

module.exports = app;