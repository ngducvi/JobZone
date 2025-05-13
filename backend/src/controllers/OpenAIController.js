const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const Wallet = require("../models/Wallet");
const fileService = require("../services/FileService");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Supplier = require("../models/Supplier");
const Common = require("../helpers/Common");
const { Op } = require("sequelize");

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

          // // Create token usage record
          // await TokenUsage.create({
          //   user_id: user_id,
          //   conversation_id: conversation.id,
          //   bot_id: bot.id,
          //   token_count: totalTokens,
          //   input_count: promptTokens,
          //   output_count: completionTokens,
          // });

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
      // await TokenUsage.create({
      //   user_id: user_id,
      //   conversation_id: conversation.id,
      //   bot_id: bot.id,
      //   token_count: inputTokens + outputTokens,
      //   input_count: inputTokens,
      //   output_count: outputTokens,
      // });

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

      // await TokenUsage.create({
      //   user_id: user_id,
      //   conversation_id: conversation.id,
      //   bot_id: bot.id,
      //   token_count: 2000,
      //   input_count: numCharacters,
      //   output_count: numCharacters,
      // });
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
      // await TokenUsage.create({
      //   user_id: user_id,
      //   conversation_id: conversation.id,
      //   bot_id: bot.id,
      //   token_count: numCharacters,
      //   input_count: numCharacters,
      //   output_count: numCharacters,
      // });

      const wallet = await Wallet.findOne({ where: { user_id } });
      wallet.balance -= numCharacters * bot.output_rate;
      await wallet.save();
      return res.status(200).json({ speech });
    } catch (error) {
      console.error("Lỗi khi tạo âm thanh:", error);
      res.status(500).json({ error: "Không thể tạo âm thanh." });
    }
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
  async matchScore(req, res) {
    const { candidate, job, model } = req.body;
    const prompt = `
Dựa trên thông tin sau, hãy đánh giá mức độ phù hợp của ứng viên với công việc theo các tiêu chí sau và trả về kết quả dưới dạng JSON:

1. Kỹ năng (30%):
- Đánh giá mức độ phù hợp giữa kỹ năng của ứng viên và yêu cầu công việc
- Xem xét các kỹ năng chuyên môn và kỹ năng mềm

2. Kinh nghiệm (25%):
- So sánh số năm kinh nghiệm với yêu cầu
- Đánh giá sự phù hợp của kinh nghiệm làm việc trước đây
- Xem xét ngành nghề và vị trí công việc trước đây

3. Mức lương (15%):
- So sánh mức lương hiện tại và mong muốn với mức lương công việc
- Đánh giá khả năng thỏa thuận lương

4. Địa điểm làm việc (10%):
- Đánh giá sự phù hợp về địa điểm làm việc
- Xem xét khả năng di chuyển

5. Trình độ học vấn (10%):
- So sánh trình độ học vấn với yêu cầu
- Đánh giá các chứng chỉ liên quan

6. Tính cách và mục tiêu (10%):
- Đánh giá sự phù hợp về mục tiêu nghề nghiệp
- Xem xét tính cách và văn hóa làm việc

Thông tin ứng viên:
- Tên: ${candidate.name}
- Vị trí ứng tuyển: ${job.title}
- Kinh nghiệm: ${candidate.experience}
- Kỹ năng: ${candidate.skills}
- Mức lương hiện tại: ${candidate.current_salary}
- Mức lương mong muốn: ${candidate.expected_salary}
- Địa điểm: ${candidate.location}
- Trình độ học vấn: ${candidate.qualifications}
- Mục tiêu nghề nghiệp: ${candidate.career_objective}
- Khả năng di chuyển: ${candidate.willing_to_relocate ? 'Có' : 'Không'}

Thông tin công việc:
- Tiêu đề: ${job.title}
- Mô tả: ${job.description}
- Yêu cầu: ${job.job_requirements}
- Kỹ năng cần thiết: ${job.skills}
- Mức lương: ${job.salary}
- Địa điểm: ${job.location}
- Trình độ yêu cầu: ${job.education}
- Kinh nghiệm yêu cầu: ${job.experience}
- Hình thức làm việc: ${job.working_location}

Hãy trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "score": 85,
  "details": {
    "skills": {
      "score": 90,
      "reason": "Ứng viên có kỹ năng SQL và MySQL phù hợp với yêu cầu công việc"
    },
    "experience": {
      "score": 80,
      "reason": "Có 2 năm kinh nghiệm phù hợp với yêu cầu"
    },
    "salary": {
      "score": 70,
      "reason": "Mức lương mong muốn cao hơn mức lương công việc"
    },
    "location": {
      "score": 60,
      "reason": "Cần di chuyển từ Sài Gòn đến Miami"
    },
    "education": {
      "score": 100,
      "reason": "Đáp ứng yêu cầu về trình độ học vấn"
    },
    "personality": {
      "score": 85,
      "reason": "Mục tiêu nghề nghiệp phù hợp với vị trí"
    }
  },
  "overall_reason": "Ứng viên có kỹ năng và kinh nghiệm phù hợp, nhưng cần xem xét về mức lương và địa điểm làm việc",
  "suggestions": [
    "Có thể thương lượng về mức lương",
    "Cần xác nhận về khả năng di chuyển",
    "Nên phỏng vấn để đánh giá kỹ năng thực tế"
  ]
}`;

    try {
      const bot = await Bot.findOne({ where: { name: model } });
      await this.configClientSupplier(bot);
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Bạn là một chuyên gia tuyển dụng. Hãy phân tích và đánh giá mức độ phù hợp của ứng viên với công việc." },
          { role: "user", content: prompt }
        ],
        stream: false,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Raw content:', content);
        return res.status(500).json({ error: "Lỗi khi phân tích kết quả từ AI" });
      }

      return res.json(result);
    } catch (error) {
      console.error('Error in matchScore:', error);
      return res.status(500).json({ error: "Lỗi khi tính toán % phù hợp" });
    }
  }

  async compareCandidates(req, res) {
    const { candidates, job, model } = req.body;

    const prompt = `
Hãy so sánh các ứng viên sau đây cho vị trí ${job.title} và trả về kết quả dưới dạng JSON:

Thông tin công việc:
- Tiêu đề: ${job.title}
- Mô tả: ${job.description}
- Yêu cầu: ${job.job_requirements}
- Kỹ năng cần thiết: ${job.skills}
- Mức lương: ${job.salary}
- Địa điểm: ${job.location}
- Trình độ yêu cầu: ${job.education}
- Kinh nghiệm yêu cầu: ${job.experience}

Thông tin ứng viên:
${candidates.map((candidate, index) => `
Ứng viên ${index + 1}:
- Tên: ${candidate.name}
- Kinh nghiệm: ${candidate.experience}
- Kỹ năng: ${candidate.skills}
- Mức lương hiện tại: ${candidate.current_salary}
- Mức lương mong muốn: ${candidate.expected_salary}
- Địa điểm: ${candidate.location}
- Trình độ học vấn: ${candidate.qualifications}
- Mục tiêu nghề nghiệp: ${candidate.career_objective}
`).join('\n')}

Hãy trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "comparison": {
    "overall": {
      "best_candidate": "Tên ứng viên",
      "reason": "Lý do tại sao ứng viên này phù hợp nhất"
    },
    "candidates": [
      {
        "name": "Tên ứng viên",
        "rank": 1,
        "strengths": [
          "Điểm mạnh 1",
          "Điểm mạnh 2"
        ],
        "weaknesses": [
          "Điểm yếu 1",
          "Điểm yếu 2"
        ],
        "fit_score": 85,
        "recommendation": "Đề xuất cho ứng viên này"
      }
    ]
  },
  "summary": {
    "key_differences": [
      "Khác biệt chính 1",
      "Khác biệt chính 2"
    ],
    "recommendations": [
      "Đề xuất 1",
      "Đề xuất 2"
    ]
  }
}`;

    try {
      const bot = await Bot.findOne({ where: { name: model } });
      await this.configClientSupplier(bot);
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Bạn là một chuyên gia tuyển dụng. Hãy so sánh và đánh giá các ứng viên một cách khách quan." },
          { role: "user", content: prompt }
        ],
        stream: false,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Raw content:', content);
        return res.status(500).json({ error: "Lỗi khi phân tích kết quả từ AI" });
      }

      return res.json(result);
    } catch (error) {
      console.error('Error in compareCandidates:', error);
      return res.status(500).json({ error: "Lỗi khi so sánh ứng viên" });
    }
  }

  async findSimilarCandidates(req, res) {
    const { idealCandidate, candidatesList, model, searchCriteria } = req.body;

    const prompt = `
Là một chuyên gia tuyển dụng, hãy phân tích danh sách ứng viên và tìm những người phù hợp nhất với mẫu ứng viên lý tưởng. Trả về kết quả dưới dạng JSON.

Mẫu ứng viên lý tưởng:
- Kinh nghiệm: ${idealCandidate.experience || "Không yêu cầu cụ thể"}
- Kỹ năng: ${idealCandidate.skills || "Không yêu cầu cụ thể"}
- Vị trí công việc: ${idealCandidate.position || "Không yêu cầu cụ thể"}
- Công ty hiện tại: ${idealCandidate.company || "Không yêu cầu cụ thể"}
- Trình độ học vấn: ${idealCandidate.education || "Không yêu cầu cụ thể"}
- Mức lương mong muốn: ${idealCandidate.salary || "Không yêu cầu cụ thể"}
- Địa điểm: ${idealCandidate.location || "Không yêu cầu cụ thể"}
- Ngành nghề: ${idealCandidate.industry || "Không yêu cầu cụ thể"}

Tiêu chí tìm kiếm ưu tiên:
${searchCriteria ? searchCriteria.map(criteria => `- ${criteria}`).join('\n') : `
- Kỹ năng phù hợp
- Kinh nghiệm phù hợp
- Ngành nghề phù hợp
- Mức lương phù hợp
- Địa điểm phù hợp`}

Danh sách ứng viên để đánh giá:
${candidatesList.map((candidate, index) => `
Ứng viên ${index + 1}:
- ID: ${candidate.candidate_id}
- Tên: ${candidate.name}
- Kinh nghiệm: ${candidate.experience || "Chưa cập nhật"}
- Kỹ năng: ${candidate.skills || "Chưa cập nhật"}
- Vị trí hiện tại: ${candidate.current_job_title || "Chưa cập nhật"}
- Công ty hiện tại: ${candidate.current_company || "Chưa cập nhật"}
- Trình độ học vấn: ${candidate.education || "Chưa cập nhật"}
- Mức lương mong muốn: ${candidate.expected_salary || "Chưa cập nhật"}
- Địa điểm: ${candidate.location || "Chưa cập nhật"}
- Ngành nghề: ${candidate.industry || "Chưa cập nhật"}
`).join('\n')}

Hãy trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "similar_candidates": [
    {
      "candidate_id": "id của ứng viên",
      "name": "Tên ứng viên",
      "match_score": 85,
      "match_reasons": [
        "Lý do phù hợp 1",
        "Lý do phù hợp 2"
      ],
      "gap_analysis": [
        "Điểm cần cải thiện 1",
        "Điểm cần cải thiện 2"
      ]
    }
  ],
  "analysis": {
    "total_candidates": 10,
    "high_match_candidates": 3,
    "medium_match_candidates": 5,
    "low_match_candidates": 2,
    "key_skills_missing": [
      "Kỹ năng còn thiếu 1",
      "Kỹ năng còn thiếu 2"
    ],
    "recommendations": [
      "Đề xuất 1 cho việc tìm kiếm",
      "Đề xuất 2 cho việc tìm kiếm"
    ]
  }
}`;

    try {
      const bot = await Bot.findOne({ where: { name: model } });
      await this.configClientSupplier(bot);
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Bạn là một chuyên gia tuyển dụng. Hãy tìm kiếm và đánh giá ứng viên phù hợp một cách chuyên nghiệp." },
          { role: "user", content: prompt }
        ],
        stream: false,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Raw content:', content);
        return res.status(500).json({ error: "Lỗi khi phân tích kết quả từ AI" });
      }

      return res.json(result);
    } catch (error) {
      console.error('Error in findSimilarCandidates:', error);
      return res.status(500).json({ error: "Lỗi khi tìm ứng viên tương tự" });
    }
  }

  async screenCandidates(req, res) {
    const { candidates, job, model, screeningCriteria } = req.body;

    const prompt = `
Là một chuyên gia tuyển dụng, hãy sàng lọc tự động các ứng viên sau cho vị trí ${job.title} dựa trên các tiêu chí đã cho và trả về kết quả dưới dạng JSON:

Thông tin công việc:
- Tiêu đề: ${job.title}
- Mô tả: ${job.description}
- Yêu cầu: ${job.job_requirements}
- Kỹ năng cần thiết: ${job.skills}
- Mức lương: ${job.salary}
- Địa điểm: ${job.location}
- Trình độ yêu cầu: ${job.education}
- Kinh nghiệm yêu cầu: ${job.experience}

Tiêu chí sàng lọc:
${screeningCriteria ? screeningCriteria.join('\n') : `
- Mức độ phù hợp kỹ năng tối thiểu
- Kinh nghiệm tối thiểu
- Khả năng đáp ứng về mặt lương
- Địa điểm làm việc phù hợp
- Trình độ học vấn phù hợp`}

Thông tin ứng viên:
${candidates.map((candidate, index) => `
Ứng viên ${index + 1}:
- Tên: ${candidate.name}
- Kinh nghiệm: ${candidate.experience}
- Kỹ năng: ${candidate.skills}
- Mức lương hiện tại: ${candidate.current_salary}
- Mức lương mong muốn: ${candidate.expected_salary}
- Địa điểm: ${candidate.location}
- Trình độ học vấn: ${candidate.qualifications}
- Mục tiêu nghề nghiệp: ${candidate.career_objective}
`).join('\n')}

Hãy trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "screening_results": [
    {
      "name": "Tên ứng viên",
      "status": "pass/review/reject",
      "reasons": [
        "Lý do 1 cho trạng thái",
        "Lý do 2 cho trạng thái"
      ],
      "score": 85,
      "recommendation": "Đề xuất hành động tiếp theo cho ứng viên này",
      "suggested_interview_questions": [
        "Câu hỏi phỏng vấn 1",
        "Câu hỏi phỏng vấn 2"
      ]
    }
  ],
  "summary": {
    "passed": 5,
    "review": 3,
    "rejected": 2,
    "recommendations": [
      "Đề xuất chung 1 cho quá trình sàng lọc",
      "Đề xuất chung 2 cho quá trình sàng lọc"
    ]
  }
}`;

    try {
      const bot = await Bot.findOne({ where: { name: model } });
      await this.configClientSupplier(bot);
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Bạn là một chuyên gia tuyển dụng. Hãy sàng lọc tự động các ứng viên một cách chuyên nghiệp và khách quan." },
          { role: "user", content: prompt }
        ],
        stream: false,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Raw content:', content);
        return res.status(500).json({ error: "Lỗi khi phân tích kết quả từ AI" });
      }

      return res.json(result);
    } catch (error) {
      console.error('Error in screenCandidates:', error);
      return res.status(500).json({ error: "Lỗi khi sàng lọc ứng viên" });
    }
  }

  async analyzeJobForCandidate(req, res) {
    const { job, candidateProfile, model = "gpt-4o-mini" } = req.body;

    if (!job || !candidateProfile) {
      return res.status(400).json({ error: "Thông tin công việc và hồ sơ ứng viên là bắt buộc" });
    }

    const prompt = `
Với vai trò là một cố vấn nghề nghiệp AI, hãy phân tích tin tuyển dụng này cho ứng viên và đưa ra những nhận xét chi tiết.

THÔNG TIN CÔNG VIỆC:
- Vị trí: ${job.title}
- Công ty: ${job.company_name || "Không xác định"}
- Mô tả: ${job.description}
- Yêu cầu: ${job.job_requirements}
- Lương: ${job.salary || "Không xác định"}
- Địa điểm: ${job.location || "Không xác định"}
- Phúc lợi: ${job.benefits || "Không xác định"}

HỒ SƠ ỨNG VIÊN:
- Kỹ năng: ${candidateProfile.skills || "Không xác định"}
- Kinh nghiệm: ${candidateProfile.experience || "Không xác định"}
- Học vấn: ${candidateProfile.education || "Không xác định"}
- Vị trí hiện tại: ${candidateProfile.current_job_title || "Không xác định"}
- Công ty hiện tại: ${candidateProfile.current_company || "Không xác định"}

Dựa trên thông tin trên, vui lòng cung cấp các nội dung sau dưới dạng JSON:
1. Phân tích chi tiết sự phù hợp giữa hồ sơ ứng viên và yêu cầu công việc
2. Phân tích khoảng cách về kỹ năng
3. Lời khuyên ứng tuyển cá nhân hóa
4. Các câu hỏi phỏng vấn tiềm năng mà ứng viên có thể gặp
5. Lời khuyên về thương lượng lương nếu có

Trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "match_analysis": {
    "overall_match_score": 85,
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "gaps": ["Khoảng cách 1", "Khoảng cách 2"],
    "detailed_skills_match": {
      "matched_skills": ["Kỹ năng 1", "Kỹ năng 2"],
      "missing_skills": ["Kỹ năng 3", "Kỹ năng 4"],
      "partially_matched_skills": ["Kỹ năng 5 (lý do phù hợp một phần)"]
    }
  },
  "application_tips": [
    "Lời khuyên 1",
    "Lời khuyên 2"
  ],
  "interview_questions": [
    {
      "question": "Câu hỏi 1?",
      "reasoning": "Tại sao câu hỏi này có thể được hỏi",
      "preparation_tips": "Cách chuẩn bị cho câu hỏi này"
    },
    {
      "question": "Câu hỏi 2?",
      "reasoning": "Tại sao câu hỏi này có thể được hỏi",
      "preparation_tips": "Cách chuẩn bị cho câu hỏi này"
    }
  ],
  "salary_advice": {
    "market_insights": "Thông tin về mức lương cho vị trí này",
    "negotiation_tips": [
      "Lời khuyên 1",
      "Lời khuyên 2"
    ]
  },
  "summary": "Tóm tắt ngắn gọn về phân tích tổng thể và các khuyến nghị chính"
}`;

    try {
      const bot = await Bot.findOne({ where: { name: model } });
      await this.configClientSupplier(bot);
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Bạn là một cố vấn nghề nghiệp chuyên giúp các ứng viên phân tích tin tuyển dụng. Hãy đưa ra những nhận xét chi tiết và thiết thực." },
          { role: "user", content: prompt }
        ],
        stream: false,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Lỗi phân tích JSON:', parseError);
        console.error('Nội dung thô:', content);
        return res.status(500).json({ error: "Lỗi khi phân tích phản hồi từ AI" });
      }

      return res.json(result);
    } catch (error) {
      console.error('Lỗi trong analyzeJobForCandidate:', error);
      return res.status(500).json({ error: "Lỗi khi phân tích công việc cho ứng viên" });
    }
  }
}

module.exports = new OpenAIController();