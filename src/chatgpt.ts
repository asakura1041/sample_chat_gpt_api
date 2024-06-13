import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

interface WorldHeritage {
  name: string;
  registered_year: number;
  description: string;
  type: string;
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

  private createRequestData(country: string): Record<string, any> {
    return {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `
          「${country}」の世界遺産を以下のJSON形式で列挙してください。

          全ての世界遺産ではなく、代表的なものを5つのみ列挙してください。

          他の文章を含めず、JSONデータのみを返してください。
          [
            {
              "name": "世界遺産の名前",
              "registered_year": 登録年,
              "type": "自然遺産 or 文化遺産",
              "description": "説明" // 世界遺産の説明(場所、特徴、何が魅力かなどを詳細に記述してください)
            },
            ...
          ]
          `
        }
      ],
      max_tokens: 3000,
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
    console.log('------------------------------------------------------');
    heritages.forEach(heritage => {
      console.log(`名称: ${heritage.name}`);
      console.log(`登録年: ${heritage.registered_year}年`);
      console.log(`種別: ${heritage.type}`);
      console.log(`説明: ${heritage.description}`);
      console.log('------------------------------------------------------');
    });
  }

  private writeToFile(filename: string, content: string): void {
    fs.writeFileSync(filename, content, 'utf8');
  }

  public async fetchWorldHeritages(country: string) {
    try {
      const data = this.createRequestData(country);
      const response = await axios.post(this.endpoint, data, { headers: this.headers });
      if (response.data?.choices?.length > 0) {
        const rawAnswer = response.data.choices[0].message.content;
        // 生の応答をファイルに書き込み
        this.writeToFile('api_response/rawAnswer.txt', rawAnswer);

        const worldHeritages = this.parseJSONResponse(rawAnswer);
        // 抽出したJSONをファイルに書き込み
        this.writeToFile('api_response/worldHeritages.json', JSON.stringify(worldHeritages, null, 2));

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

// コマンドライン引数から国名を取得
const country = process.argv[2];

if (!country) {
  console.error('国名を指定してください。例: node script.js 日本');
  process.exit(1);
}

// ChatGPTClientのインスタンスを作成し、指定された国の世界遺産を取得
const chatGPTClient = new ChatGPTClient(apiKey!);
chatGPTClient.fetchWorldHeritages(country);
