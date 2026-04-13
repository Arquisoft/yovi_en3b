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

// --- AÑADIDO: RUTA TRADUCTORA PARA LOS BOTS ---
app.post('/play', async (req, res) => {
  try {
      const { bot_id, position } = req.body;

      if (!position) {
          return res.status(400).json({ error: "Falta el campo 'position'" });
      }

      // TRADUCCIÓN: Convertimos "R"/"B" del profesor a 0/1 para tu Rust
      const mappedTurn = position.turn === 'R' ? 0 : 1;

      // JSON exacto que espera tu compañero
      const rustPayload = {
          size: position.size,
          turn: mappedTurn,
          players: ["R", "B"], 
          layout: position.layout
      };

      const targetBot = bot_id || 'random_bot';
      const RUST_BOT_URL = process.env.BOT_SERVICE_URL || 'http://gamey:4000';
      
      // Llamada al contenedor de Rust
      const response = await axios.post(`${RUST_BOT_URL}/v1/ybot/choose/${targetBot}`, rustPayload);

      // TRADUCCIÓN: Formato final "x,y,z"
      const { x, y, z } = response.data.coords;
      res.json({ move: `${x},${y},${z}` });

  } catch (error) {
      console.error("Error conectando con Rust:", error.message);
      res.status(502).json({ error: "El motor de juego (Rust) no responde o el formato es incorrecto" });
  }
});
// ----------------------------------------------

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