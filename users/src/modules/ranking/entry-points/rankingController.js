const rankingService = require('../domain/rankingService');

const add = async (req, res) => {
  try {
    const { userId, totalMatches, winMatches, score } = req.body;
    if (!userId) throw new Error('userId is required');
    const result = await rankingService.addStats(userId, { totalMatches, winMatches, score });
    res.status(201).json({ message: 'Ranking added/updated', ranking: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalMatches, winMatches, score } = req.body;
    const result = await rankingService.setStats(userId, { totalMatches, winMatches, score });
    res.status(200).json({ message: 'Ranking updated', ranking: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await rankingService.getRanking(userId);
    if (!result) return res.status(404).json({ error: 'Ranking not found' });
    res.json({ ranking: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { add, update, get };
