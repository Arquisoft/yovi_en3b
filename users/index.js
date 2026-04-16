const express = require('express');
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

app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/ranking', rankingRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`)
  })
}

module.exports = app




