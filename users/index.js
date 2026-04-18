const express = require('express');
const axios = require('axios'); // <-- Needed to make a call to rust logic (bots)
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
      // Obtenemos los parámetros
      const positionString = req.query.position;
      
      // SOLUCIÓN 1: Usamos un solo nombre de variable (requestedBotId)
      const requestedBotId = req.query.bot_id || 'random_bot'; 

      // 🛡️ 1. SEGURIDAD: Lista blanca de bots permitidos
      const allowedBots = ['random_bot', 'easy_bot', 'medium_bot', 'hard_bot'];

      // 🛡️ 2. VALIDACIÓN: Ahora sí evalúa la variable correcta
      if (!allowedBots.includes(requestedBotId)) {
          return res.status(400).json({ error: "El bot especificado no es válido." });
      }

      if (!positionString) {
          return res.status(400).json({ error: "Falta el parámetro 'position' en la URL" });
      }

      // Turn it into a JSON
      let rustPayload;
      try {
          rustPayload = JSON.parse(positionString);
      } catch (error) { 
          // SOLUCIÓN 3: Imprimimos el error para que SonarCloud no se queje de la excepción vacía
          console.error("Error parseando position:", error.message);
          return res.status(400).json({ error: "El parámetro position no es un JSON válido" });
      }

      // Make the call to the Rust module
      const RUST_BOT_URL = process.env.BOT_SERVICE_URL || 'http://gamey:4000';
      
      // Al haber pasado por el array 'allowedBots', esta inyección ahora es segura
      const response = await axios.post(`${RUST_BOT_URL}/v1/ybot/choose/${requestedBotId}`, rustPayload);

      // Return with the correct format
      if (response.data.coords) {
          res.json({ coords: response.data.coords });
      } else if (response.data.action) {
          res.json({ action: response.data.action });
      } else {
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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`)
  })
}

module.exports = app;