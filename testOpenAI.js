const axios = require("axios");
require("dotenv").config();
console.log("API Key:", process.env.OPENAI_API_KEY); // Check if it's loaded


async function testOpenAI() {
  try {
    const response = await axios.get("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });
    console.log("✅ API Key is valid!");
    console.log(response.data);
  } catch (error) {
    console.error("❌ API Key Test Failed:", error.response?.data || error.message);
  }
}

testOpenAI();
