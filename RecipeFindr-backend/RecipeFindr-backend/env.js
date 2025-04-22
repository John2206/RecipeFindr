require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  openaiApiKey: process.env.OPENAI_API_KEY,
};
