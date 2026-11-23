import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini AI client server-side with v1beta for TTS models
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // TTS API endpoint using gemini-3.8-flash-lite-tts
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceName, styleInstructions } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'กรุณากรอกข้อความบทบรรยายสารคดี' });
      }

      const voice = voiceName || 'Bodi';
      const style = styleInstructions || 'Thai male voice, deep, authoritative, and mysterious tone, similar to a high-end world-class documentary narrator. Moderate speaking pace, clear articulation, with short, dramatic pauses after sentences to build suspense.';

      console.log(`[TTS] Generating audio with model gemini-3.8-flash-lite-tts (v1beta), voice: ${voice}`);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error('ไม่พบข้อมูลเสียงจากโมเดล Gemini TTS');
      }

      res.json({ success: true, audioBase64: base64Audio });
    } catch (error: any) {
      console.error('TTS Generation Error:', error);
      res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการสร้างเสียงบรรยาย' });
    }
  });

  // Script Assistant API endpoint
  app.post('/api/script-assist', async (req, res) => {
    try {
      const { prompt, tone } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'กรุณาระบุหัวข้อหรือไอเดีย' });
      }

      const systemPrompt = 'คุณเป็นผู้กำกับและนักเขียนบทสารคดีระดับโลก เขียนสคริปต์บรรยายภาษาไทยที่ทรงพลัง ลึกลับ น่าติดตาม มีการเว้นจังหวะ (dramatic pauses) เหมาะสำหรับการบันทึกเสียงพากย์';
      const userPrompt = `หัวข้อ: ${prompt}\nโทนเสียง/สไตล์: ${tone || 'สารคดีเชิงลึก ลึกลับ น่าติดตาม'}\nโปรดเขียนบทบรรยายความยาวประมาณ 1-2 นาที พร้อมคำแนะนำการเว้นวรรคน้ำเสียงในวงเล็บ`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      res.json({ success: true, script: response.text });
    } catch (error: any) {
      console.error('Script Assist Error:', error);
      res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการสร้างบทบรรยาย' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' ? {} : false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
