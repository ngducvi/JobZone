const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const TokenUsage = require("../models/TokenUsage");
const Wallet = require("../models/Wallet");
const fileService = require("../services/FileService");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Supplier = require("../models/Supplier");
const Common = require("../helpers/Common");
const {Op} = require("sequelize");

require("dotenv").config();
class OpenAIController {
  constructor() {
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
  async configClientSupplier(bot) {
    const supplier = await Supplier.findOne({ where: { id: bot.supplier_id } });
    if (!supplier) {
      return null;
    }
    if (supplier.id === "openai") {
      this.client = new OpenAI({
        apiKey: supplier.api_key,
      });
    }
    else if (supplier.id === "anthropic") {
      this.client = new Anthropic({
        apiKey: supplier.api_key,
      });
    }
    else {
      this.client = new OpenAI({
        apiKey: supplier.api_key,
        baseURL: supplier.base_url,
      });
    }
    return supplier;
  }
  async streamChat(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const prompt = req.query.prompt;
    const model = req.query.model;
    console.log('Stream Chat Request:', { prompt, model });

    if (!prompt) {
        console.log('Error: Prompt is required');
        res.write(`data: ${JSON.stringify("Prompt là bắt buộc.")}\n\n`);
        res.end();
        return;
    }
    if (!model) {
        console.log('Error: Model is required');
        res.write(`data: ${JSON.stringify("Model là bắt buộc.")}\n\n`);
        res.end();
        return;
    }

    const bot = await Bot.findOne({ where: { name: model } });
    if (!bot) {
        console.log('Error: Bot not found for model:', model);
        res.write(`data: ${JSON.stringify("Không tìm thấy bot.")}\n\n`);
        return res.end();
    }

    const supplier = await this.configClientSupplier(bot);
    if (!supplier) {
        console.log('Error: Supplier not found for bot:', bot.id);
        res.write(`data: ${JSON.stringify("Không tìm thấy nhà cung cấp.")}\n\n`);
        res.end();
        return;
    }

    try {
        console.log('Starting chat stream with supplier:', supplier.id);
        if (supplier.id == "anthropic") {
            const collectedMessages = [];
            let stream = await this.client.messages.create({
                model,
                messages: [
                    { role: "user", content: prompt },
                ],
                max_tokens: 4096,
                stream: true
            });
            let inputTokens = 0;
            let outputTokens = 0;
            for await (const messageStreamEvent of stream) {
                if (messageStreamEvent.type === "message_start") {
                    console.log("message_start:", messageStreamEvent);
                    inputTokens = messageStreamEvent.message.usage.input_tokens;
                }
                else if (messageStreamEvent.type === "content_block_delta") {
                    const chunkMessage = messageStreamEvent.delta.text;
                    if (chunkMessage) {
                        collectedMessages.push(chunkMessage);
                        res.write(`data: ${JSON.stringify(chunkMessage)}\n\n`);
                    }
                }
                else if (messageStreamEvent.type === "message_delta") {
                }
            }
            return;
        }
        else {
            let stream = await this.client.chat.completions.create({
                model,
                messages: [
                    { role: "assistant", content: "Bạn là chuyên gia về lĩnh vực đó" },
                    { role: "user", content: prompt },
                ],
                stream: true,
                stream_options: { include_usage: true },
            });
            const collectedMessages = [];
            for await (const chunk of stream.iterator()) {
                const chunkMessage = chunk?.choices?.[0]?.delta?.content;
                const chunkUsage = chunk?.usage;
                if (chunkMessage) {
                    collectedMessages.push(chunkMessage);
                    res.write(`data: ${JSON.stringify(chunkMessage)}\n\n`);
                }
                if (chunkUsage) {
                }
            }
        }
        res.end();
        return;
    } catch (error) {
        console.error('Error in streamChat:', error);
        res.write(`data: ${JSON.stringify("Lỗi trong quá trình xử lý")}\n\n`);
        res.end();
    }
  }
  async getBase64FromUrl(url) {
    try {
      const response = await fetch(url);  
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }
  
  async streamChatImage(req, res) {
    const prompt = req.query.prompt;
    const imageUrl = req.query.image_url;
    const model = req.query.model;
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
      return res.end();
    }
    const supplier = await this.configClientSupplier(bot);
    if (!supplier) {
      res.write(`data: ${JSON.stringify("Không tìm thấy nhà cung cấp.")}\n\n`);
      res.end();
      return;
    }
    const base64Image = await this.getBase64FromUrl(imageUrl);
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
                url: base64Image,
              },
            },
          ],
        },
      ],
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
          const id = Common.generateToken(10);
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
      console.log(error);
      res.write(`data: ${JSON.stringify("Lỗi trong quá trình xử lý")}\n\n`);
      res.end();
    }
  }
    async messege(req, res) {
    try {
        const prompt = req.body.prompt || req.query.prompt;
        const model = req.body.model || req.query.model;
        const user_id = req.user.id;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt là bắt buộc." });
        }
        if (!model) {
            return res.status(400).json({ message: "Model là bắt buộc." });
        }

        const bot = await Bot.findOne({ where: { name: model } });
        if (!bot) {
            return res.status(404).json({ message: "Không tìm thấy bot." });
        }

        const supplier = await this.configClientSupplier(bot);
        if (!supplier) {
            return res.status(404).json({ message: "Không tìm thấy nhà cung cấp." });
        }

        let responseContent = "";
        let inputTokens = 0;
        let outputTokens = 0;

        if (supplier.id === "anthropic") {
            const stream = await this.client.messages.create({
                model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 100000,
                stream: false, // No streaming
            });

            inputTokens = stream.usage.input_tokens;
            outputTokens = stream.usage.output_tokens;
            responseContent = stream.message.content;
        } else {
            const completion = await this.client.chat.completions.create({
                model,
                messages: [
                    { role: "assistant", content: "Bạn là chuyên gia về lĩnh vực kinh doanh, marketing" },
                    { role: "user", content: prompt },
                ],
                stream: false, // No streaming
            });

            responseContent = completion.choices[0].message.content;
            inputTokens = completion.usage.prompt_tokens;
            outputTokens = completion.usage.completion_tokens;
        }

        // Save conversation
        const conversation = await Conversation.create({
            id: Common.generateToken(10),
            bot_id: bot.id,
            user_id: user_id,
            status: "completed",
            completed_at: new Date().getTime(),
            content: responseContent,
        });

        // Save token usage
        await TokenUsage.create({
            user_id: user_id,
            conversation_id: conversation.id,
            bot_id: bot.id,
            token_count: inputTokens + outputTokens,
            input_count: inputTokens,
            output_count: outputTokens,
        });

        // Update wallet balance
        // const wallet = await Wallet.findOne({ where: { user_id: user_id } });
        // if (!wallet) {
        //     return res.status(404).json({ message: `Không tìm thấy ví cho user_id: ${user_id}` });
        // }

        // let total_price = inputTokens * bot.input_rate + outputTokens * bot.output_rate;
        // if (total_price < 0) total_price = 1;
        // wallet.balance -= total_price;
        // await wallet.save();
        return res.json({ response: responseContent });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi trong quá trình xử lý" });
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
    const bot = await Bot.findOne({ where: { name: "dall-e-3" } });
    if (!bot) {
      return res.status(404).json({ error: "Không tìm thấy bot." });
    }
    const supplier = await this.configClientSupplier(bot);
    if (!supplier) {
      return res.status(400).json({ error: "Không tìm thấy nhà cung cấp." });
    }
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
      console.log(response);
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
    const bot = await Bot.findOne({ where: { name: model } });
    if (!bot) {
      return res.status(404).json({ error: "Không tìm thấy bot." });
    }
    const supplier = await this.configClientSupplier(bot);
    if (!supplier) {
      return res.status(400).json({ error: "Không tìm thấy nhà cung cấp." });
    }
    const numCharacters = this.calculateCharacters(prompt);
    if (!prompt) {
      return res.status(400).json({ error: "Prompt là bắt buộc." });
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
        content: speech.secure_url,
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
      await wallet.save();
      return res.status(200).json({ speech });
    } catch (error) {
      console.error("Lỗi khi tạo âm thanh:", error);
      res.status(500).json({ error: "Không thể tạo âm thanh." });
    }
  }

  countConversations(req, res) {
    const user_id = req.user.id;
    Conversation.count({ where: { user_id, method_used:"website" } })
      .then((count) => {
        res.json({ count });
      })
      .catch((error) => {
        console.error("Error during count conversation:", error);
        res.status(500).json({ error: "Failed to count conversation." });
      });
  }
  countConversationsMonth(req, res) {
    const user_id = req.user.id;
    // Lấy timestamp đầu và cuối tháng
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    Conversation.findAndCountAll({
      where: {
        user_id,
        method_used: "website",
        created_at: {
          [Op.between]: [firstDay.getTime(), lastDay.getTime()]
        }
      },
      order: [['created_at', 'DESC']]
    })
      .then(result => {
        res.json({
          count: result.count,
          conversations: result.rows,
          created_at: firstDay,
          updated_at: lastDay,
        });
      })
      .catch(error => {
        console.error("Error getting conversations:", error);
        res.status(500).json({ error: "Failed to get conversations" });
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