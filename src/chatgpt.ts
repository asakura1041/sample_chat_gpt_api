import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface WorldHeritage {
  name: string;
  registered_year: number;
  description: string;
}

class ChatGPTClient {
  private apiKey: string;
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
  }

  private createRequestData(): Record<string, any> {
    return {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `日本の世界遺産を以下のJSON形式で列挙してください。
          他の文章を含めず、JSONデータのみを返してください。
          [
            {
              "name": "世界遺産の名前",
              "registered_year": 登録年,
              "description": "説明"
            },
            ...
          ]
          例:
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
            },
            ...
          ]`
        }
      ],
      max_tokens: 1500,
    };
  }

  private parseJSONResponse(response: string): WorldHeritage[] {
    try {
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const jsonStart = cleanedResponse.indexOf('[');
      const jsonEnd = cleanedResponse.lastIndexOf(']') + 1;
      const jsonString = jsonStart !== -1 && jsonEnd !== -1 ? cleanedResponse.slice(jsonStart, jsonEnd) : '';
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }

  private logWorldHeritages(heritages: WorldHeritage[]): void {
    heritages.forEach(heritage => {
      console.log(`Name: ${heritage.name}`);
      console.log(`Registered Year: ${heritage.registered_year}`);
      console.log(`Description: ${heritage.description}`);
      console.log('----------------------');
    });
  }

  public async fetchWorldHeritages() {
    try {
      const data = this.createRequestData();
      const response = await axios.post(this.endpoint, data, { headers: this.headers });
      if (response.data?.choices?.length > 0) {
        const rawAnswer = response.data.choices[0].message.content;
        console.log('Raw Answer:', rawAnswer);
        const worldHeritages = this.parseJSONResponse(rawAnswer);
        console.log('World Heritages:', worldHeritages);
        this.logWorldHeritages(worldHeritages);
      } else {
        console.log('No answer received from ChatGPT.');
      }
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
    }
  }
}

// 環境変数からAPIキーを取得
const apiKey = process.env.OPENAI_API_KEY;

// ChatGPTClientのインスタンスを作成し、世界遺産を取得
const chatGPTClient = new ChatGPTClient(apiKey!);
chatGPTClient.fetchWorldHeritages();
