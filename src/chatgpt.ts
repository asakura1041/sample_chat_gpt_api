import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const endpoint = 'https://api.openai.com/v1/chat/completions';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};

const data = {
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello, who won the world series in 2020?' }],
  max_tokens: 50,
};

async function callChatGPT() {
  try {
    const response = await axios.post(endpoint, data, { headers });
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const answer = response.data.choices[0].message.content;
      console.log('ChatGPT Answer:', answer);
    } else {
      console.log('No answer received from ChatGPT.');
    }
  } catch (error) {
    console.error('Error calling ChatGPT:', error);
  }
}

callChatGPT();
