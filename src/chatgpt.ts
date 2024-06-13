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
  model: 'gpt-4o',
  messages: [
    {
      role: 'user',
      content: `
      以下の形式で、日本の世界遺産をJSONのみで列挙してください。
      他の文章を含めず、JSONデータのみを返してください。
      [
        {
          "name": "世界遺産の名前",
          "registered_year": 登録年,
          "description": "説明"
        },
        ...
      ]
      
      例として、以下のように返答してください:
      [
        {
          "name": "屋久島",
          "registered_year": 1993,
          "description": "屋久島は、鹿児島県に位置する亜熱帯性の島で、その美しい森林と生態系で知られています。"
        },
        {
          "name": "白神山地",
          "registered_year": 1993,
          "description": "白神山地は、青森県と秋田県にまたがる広大な山岳地帯で、ブナの原生林が広がっています。"
        }
      ]`
    }
  ],
  max_tokens: 1000,
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
