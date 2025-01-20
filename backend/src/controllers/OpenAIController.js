const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const TokenUsage = require("../models/TokenUsage");
const Wallet = require("../models/Wallet");
const fileService = require("../services/FileService");
const OpenAI = require("openai");
require("dotenv").config();
class OpenAIController {
  constructor() {
    this.client = new OpenAI(process.env.OPENAI_API_KEY);
  }
  calculateCharacters(prompt) {
    const characters = prompt.length;
    return characters;
  }
  async calculateImageTokenCost(imageUrl, detail = "low") {
    if (detail === "low") {
      return 85;
    }
  }
  async streamChatCompletion(req, res) {
    const prompt = req.query.prompt;
    const model = req.query.model;
    const user_id = req.user.id;
    const chat_id = req.query.chat_id;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt là bắt buộc." });
    }
    if (!model) {
      return res.status(400).json({ error: "Model là bắt buộc." });
    }
    const bot = await Bot.findOne({ where: { name: model } });
    if (!bot) {
      return res.status(404).json({ error: "Không tìm thấy bot." });
    }
    const stream = await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true },
    });
    const collectedMessages = [];
    try {
      for await (const chunk of stream.iterator()) {
        const chunkMessage = chunk?.choices?.[0]?.delta?.content;
        const chunkUsage = chunk?.usage;
        if (chunkMessage) {
          collectedMessages.push(chunkMessage);
          process.stdout.write(chunkMessage);
          res.write(`data: ${JSON.stringify(chunkMessage)}\n\n`);
        }
        if (chunkUsage) {
          const id = chunk.id;
          const completionTokens = chunkUsage?.completion_tokens || 0;
          const promptTokens = chunkUsage?.prompt_tokens || 0;
          const totalTokens = chunkUsage?.total_tokens || 0;

          const conversation = await Conversation.create({
            id: id,
            bot_id: bot.id,
            user_id: user_id,
            status: "completed",
            completed_at: new Date().getTime(),
          });

          // Create token usage record
          await TokenUsage.create({
            user_id: user_id,
            conversation_id: conversation.id,
            bot_id: bot.id,
            token_count: totalTokens,
            input_count: promptTokens,
            output_count: completionTokens,
          });

          // Update wallet balance
          const wallet = await Wallet.findOne({ where: { user_id: user_id } });
          if (!wallet) {
            throw new Error(`Không tìm thấy ví cho user_id: ${user_id}`);
          }
          let total_price =
            promptTokens * bot.input_rate + completionTokens * bot.output_rate;
          if (total_price < 0) {
            total_price = 1;
          }
          wallet.balance -= total_price;
          await wallet.save();
        }
      }
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify("Lỗi trong quá trình xử lý")}\n\n`);
      res.end();
    }
  }
  async streamChat(req, res) {
    const prompt = req.query.prompt;
    const model = req.query.model;
    const user_id = req.user.id;
    if (!prompt) {
      res.write(`data: ${JSON.stringify("Prompt là bắt buộc.")}\n\n`);
      res.end();
      return;
    }
    if (!model) {
      res.write(`data: ${JSON.stringify("Model là bắt buộc.")}\n\n`);
      res.end();
      return;
    }
    const bot = await Bot.findOne({ where: { name: model } });
    if (!bot) {
      res.write(`data: ${JSON.stringify("Không tìm thấy bot.")}\n\n`);
      return res.end();
    }
    const stream = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "assistant", content: "Bạn là chuyên gia về lĩnh vực kinh doanh, marketing" },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true },
    });
    const collectedMessages = [];

    try {
      for await (const chunk of stream.iterator()) {
        const chunkMessage = chunk?.choices?.[0]?.delta?.content;
        const chunkUsage = chunk?.usage;
        if (chunkMessage) {
          collectedMessages.push(chunkMessage);
          res.write(`data: ${JSON.stringify(chunkMessage)}\n\n`);
        }
        if (chunkUsage) {
          const id = chunk.id;
          const completionTokens = chunkUsage?.completion_tokens || 0;
          const promptTokens = chunkUsage?.prompt_tokens || 0;
          const totalTokens = chunkUsage?.total_tokens || 0;

          const conversation = await Conversation.create({
            id: id,
            bot_id: bot.id,
            user_id: user_id,
            status: "completed",
            completed_at: new Date().getTime(),
            content: collectedMessages.join(""),
          });

          // Create token usage record
          await TokenUsage.create({
            user_id: user_id,
            conversation_id: conversation.id,
            bot_id: bot.id,
            token_count: totalTokens,
            input_count: promptTokens,
            output_count: completionTokens,
          });

          // Update wallet balance
          const wallet = await Wallet.findOne({ where: { user_id: user_id } });
          if (!wallet) {
            throw new Error(`Không tìm thấy ví cho user_id: ${user_id}`);
          }
          let total_price =
            promptTokens * bot.input_rate + completionTokens * bot.output_rate;
          if (total_price < 0) {
            total_price = 1;
          }
          wallet.balance -= total_price;
          await wallet.save();
        }
      }
      res.end();
      return;
    } catch (error) {
      res.write(`data: ${JSON.stringify("Lỗi trong quá trình xử lý")}\n\n`);
      res.end();
    }
  }
  async streamChatImage(req, res) {
    const prompt = req.query.prompt;
    const imageUrl = req.query.image_url;
    const model = req.query.model;
    const user_id = req.user.id;
    if (!imageUrl) {
      res.write(`data: ${JSON.stringify("URL hình ảnh là bắt buộc.")}\n\n`);
      res.end();
      return;
    }
    if (!prompt) {
      res.write(`data: ${JSON.stringify("Prompt là bắt buộc.")}\n\n`);
      res.end();
      return;
    }
    if (!model) {
      res.write(`data: ${JSON.stringify("Model là bắt buộc.")}\n\n`);
      res.end();
      return;
    }
    const bot = await Bot.findOne({ where: { name: model } });
    if (!bot) {
      res.write(`data: ${JSON.stringify("Không tìm thấy bot.")}\n\n`);
      res.end();
      return;
    }
    const stream = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "assistant", content: "bạn là chuyên gia về lĩnh vực phân tích ảnh" },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true },
    });
    const collectedMessages = [];

    try {
      for await (const chunk of stream.iterator()) {
        const chunkMessage = chunk?.choices?.[0]?.delta?.content;
        const chunkUsage = chunk?.usage;
        if (chunkMessage) {
          collectedMessages.push(chunkMessage);
          process.stdout.write(chunkMessage);
          res.write(`data: ${JSON.stringify(chunkMessage)}\n\n`);
        }
        if (chunkUsage) {
          const id = chunk.id;
          const completionTokens = chunkUsage?.completion_tokens || 0;
          const promptTokens = chunkUsage?.prompt_tokens || 0;
          const totalTokens = chunkUsage?.total_tokens || 0;
          const conversation = await Conversation.create({
            id: id,
            bot_id: bot.id,
            user_id: user_id,
            status: "completed",
            completed_at: new Date().getTime(),
            content: collectedMessages.join(""),
          });

          // Create token usage record
          await TokenUsage.create({
            user_id: user_id,
            conversation_id: conversation.id,
            bot_id: bot.id,
            token_count: totalTokens,
            input_count: promptTokens,
            output_count: completionTokens,
          });

          // Update wallet balance
          const wallet = await Wallet.findOne({ where: { user_id: user_id } });
          if (!wallet) {
            throw new Error(`Không tìm thấy ví cho user_id: ${user_id}`);
          }
          const immageTokenCost = await this.calculateImageTokenCost(
            imageUrl,
            "low"
          );
          let total_price =
            promptTokens * bot.input_rate +
            completionTokens * bot.output_rate +
            immageTokenCost;
          if (total_price < 0) {
            total_price = 1;
          }
          wallet.balance -= total_price;
          await wallet.save();
        }
      }
      res.end();
      return;
    } catch (error) {
      res.write(`data: ${JSON.stringify("Lỗi trong quá trình xử lý")}\n\n`);
      res.end();
    }
  }
  async uploadFile(req, res) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File là bắt buộc." });
    }
    const blob = new Blob([file.buffer], { type: file.mimetype });
    const image_url = await fileService.uploadFile(blob, "image");
    return res.json({ image_url });
  }
  async textToImage(req, res) {
    const prompt = req.query.prompt;
    const user_id = req.user.id;
    const numCharacters = this.calculateCharacters(prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt là bắt buộc." });
    }
    try {
      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      
      const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
      const bot = await Bot.findOne({ where: { name: "dall-e-3" } });
      wallet.balance -= 2000;
      await wallet.save();

      const conversation = await Conversation.create({
        id: new Date().getTime().toString() + user_id,
        bot_id: bot.id,
        user_id: user_id,
        status: "completed",
        completed_at: new Date().getTime(),
        content: response.data[0].url,
      });

      await TokenUsage.create({
        user_id: user_id,
        conversation_id: conversation.id,
        bot_id: bot.id,
        token_count: 2000,
        input_count: numCharacters,
        output_count: numCharacters,
      });
      return res.json({
        image: response.data[0].url,
      });
    } catch (error) {
      console.error("Lỗi khi tạo hình ảnh:", error);
      res.status(500).json({ error: "Không thể tạo hình ảnh." });
    }
  }
  async saveImage(req, res) {
    const image = req.body.image;
    if (!image) {
      return res.status(400).json({ error: "Image là bắt buộc." });
    }

    try {
      const image_url = await fileService.uploadFile(image, "image");
      return res.json({ image_url });
    } catch (error) {
      console.error("Lỗi khi lưu hình ảnh:", error);
      return res.status(500).json({ error: "Không thể lưu hình ảnh." });
    }
  }

  async textToVoice(req, res) {
    const prompt = req.body.prompt;
    const model = req.body.model;
    const voice = req.body.voice;
    const user_id = req.user.id;
    const numCharacters = this.calculateCharacters(prompt);
    if (!prompt) {
      return res.status(400).json({ error: "Prompt là bắt buộc." });
    }
    const bot = await Bot.findOne({ where: { name: model } });
    if (!bot) {
      return res.status(404).json({ error: "Không tìm thấy bot." });
    }
    try {
      const response = await this.client.audio.speech.create({
        model,
        voice,
        input: prompt,
      });
      const speech = await fileService.uploadFile(response, "video");
      const conversation = await Conversation.create({
        id: new Date().getTime().toString() + user_id,
        bot_id: bot.id,
        user_id: user_id,
        status: "completed",
        completed_at: new Date().getTime(),
        content: speech.url,
      });
      await TokenUsage.create({
        user_id: user_id,
        conversation_id: conversation.id,
        bot_id: bot.id,
        token_count: numCharacters,
        input_count: numCharacters,
        output_count: numCharacters,
      });

      const wallet = await Wallet.findOne({ where: { user_id } });
      wallet.balance -= numCharacters * bot.output_rate;
      return res.status(200).json({ speech });
    } catch (error) {
      console.error("Lỗi khi tạo âm thanh:", error);
      res.status(500).json({ error: "Không thể tạo âm thanh." });
    }
  }

  countConversations(req, res) {
    const user_id = req.user.id;
    Conversation.count({ where: { user_id } })
      .then((count) => {
        res.json({ count });
      })
      .catch((error) => {
        console.error("Error during count conversation:", error);
        res.status(500).json({ error: "Failed to count conversation." });
      });
  }
  getBalance(req, res) {
    const user_id = req.user.id;
    Wallet.findOne({ where: { user_id } })
      .then((wallet) => {
        res.json({ balance: wallet.balance, expired_at: wallet.expired_at });
      })
      .catch((error) => {
        console.error("Error during get balance:", error);
        res.status(500).json({ error: "Failed to get balance." });
      });
  }
}

module.exports = new OpenAIController();
