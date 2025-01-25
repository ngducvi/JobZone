const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Job = require("../models/Job");
const TokenUsage = require("../models/TokenUsage");
const bcrypt = require("bcryptjs");
const jwtService = require("../services/JWTService"); // Import the JWT service
const mailerService = require("../services/MailerService"); // Import the Mailer service
const cacheService = require("../services/CacheService"); // Import the Cache service
const Common = require("../helpers/Common");
const { Op } = require("sequelize");
const PaymentTransaction = require("../models/PaymentTransaction");
const Conversation = require("../models/Conversation");
const Bot = require("../models/Bot");
const Candidate = require("../models/Candidate");
const CategoriesPost = require("../models/CategoriesPost");
const CareerHandbook = require("../models/CareerHandbook");
const Company = require("../models/Company");
const SavedJob = require("../models/SavedJob");
const JobApplication = require("../models/JobApplication");
const ViewedJob = require("../models/ViewedJob");
const CvTemplates = require("../models/CvTemplates");
const TemplateTypes = require("../models/TemplateTypes");
const TemplateTypeVariant = require("../models/TemplateTypeVariant");
const TemplateFields = require("../models/TemplateFields");
const UserCv = require("../models/UserCv");
const CandidateCv = require("../models/CandidateCv");
const Category = require("../models/Category");
const CvFieldValues = require("../models/CvFieldValues");

class UserController {
  constructor() {}
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res
          .status(404)
          .send({ message: "Không tìm thấy người dùng", code: -1 });
      }
      user.password = undefined; // Remove password from response
      res.status(200).send({
        message: "Người dùng được tìm thấy",
        code: 1,
        user,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async verifyEmail(req, res) {
    const token = req.query.token;
    const user = cacheService.get(token);
    if (!user) {
      return res.redirect(
        `${process.env.FE_URL}/user/verify-email?status=failure`
      );
    }

    user.is_email_verified = true;
    await user.save();
    cacheService.delete(token);
    const wallet = new Wallet({
      user_id: user.id,
      balance: 5000,
      expired_at: new Date(new Date().setDate(new Date().getDate() + 5)),
    });
    await wallet.save();
    return res.redirect(
      `${process.env.FE_URL}/user/verify-email?token?${token}&status=success`
    );
  }
  async forgetPassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({
        message: "Không tìm thấy người dùng",
        code: -1,
      });
    }
    const token = Common.generateToken();
    cacheService.set(token, user);
    mailerService.sendMail(
      user.email,
      "Đặt lại mật khẩu của bạn",
      `
            <p>Chào ${user.name},</p>
            <p> Bạn có 5 phút để đặt lại mật khẩu của mình.</p>
            <p>Nhấp vào <a href="${process.env.BASE_URL}/user/reset-password?token=${token}&status=success">đây</a> để đặt lại mật khẩu của bạn.</p>
            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`
    );
    return res.status(200).send({
      message: "Vui lòng kiểm tra email của bạn",
      code: 1,
    });
  }
  async resetPassword(req, res) {
    const token = req.query.token;
    const user = cacheService.get(token);
    if (!user) {
      return res.redirect(
        `${process.env.FE_URL}/?action=reset_password&status=failure`
      );
    }

    const password = Common.generateToken(8);
    user.password = await bcrypt.hash(password, 8);
    await user.save();
    cacheService.delete(token);
    return res.redirect(
      `${process.env.FE_URL}/login?action=reset_password&status=success&password=${password}&email=${user.email}`
    );
  }

  async changePassword(req, res) {
    const { old_password, new_password, re_password, email } = req.body;
    if (new_password !== re_password) {
      return res.status(400).send({ message: "Mật khẩu không khớp", code: -1 });
    }
    const isValid = Common.regexStrongPassword(new_password);
    if (!isValid) {
      return res.status(400).send({
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số",
        code: -1,
      });
    }
    const user = await User.findOne({ where: { email } });
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ message: "Mật khẩu không hợp lệ", code: -1 });
    }
    user.password = await bcrypt.hash(new_password, 8);
    await user.save();
    return res
      .status(200)
      .send({ message: "Đổi mật khẩu thành công", code: 1 });
  }

  async updatePassword(req, res) {
    const { old_password, new_password, re_password } = req.body;
    if (new_password !== re_password) {
      return res.status(400).send({ message: "Mật khẩu không khớp", code: -1 });
    }
    const isValid = Common.regexStrongPassword(new_password);
    if (!isValid) {
      return res.status(400).send({
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số",
        code: -1,
      });
    }
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ message: "Mật khẩu hiện tại không hợp lệ", code: -1 });
    }
    user.password = await bcrypt.hash(new_password, 8);
    await user.save();
    return res
      .status(200)
      .send({ message: "Đổi mật khẩu thành công", code: 1 });
  }

  async updateUser(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "phone"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Cập nhật không hợp lệ!" });
    }

    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).send({ message: "Không tìm thấy người dùng" });
      }

      updates.forEach((update) => (user[update] = req.body[update]));

      await user.save();
      res.status(200).send({
        message: "Người dùng đã được cập nhật",
        code: 1,
        user,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async login(req, res) {
    try {
      const { account, password } = req.body;

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { phone: account },
            { email: account },
            { username: account },
          ],
        },
      });

      if (!user) {
        return res.status(404).send({
          message: "Không tìm thấy người dùng",
          isValid: false,
          code: -1,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Mật khẩu không hợp lệ", isValid: false, code: -1 });
      }
      const token = jwtService.generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      user.password = undefined;
      res.status(200).send({
        message: "Đăng nhập thành công",
        code: 1,
        user,
        token,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  async logout(req, res) {
    try {
      return res.status(200).send({ message: "Đăng xuất thành công", code: 1 });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  async registerUser(req, res) {
    try {
      const { re_password, username, email, password, phone, name } = req.body;
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ phone: phone }, { email: email }, { username: username }],
        },
      });

      if (existingUser) {
        if (existingUser.phone === phone) {
          return res
            .status(400)
            .send({ message: "Số điện thoại đã tồn tại", code: -1 });
        }
        if (existingUser.email === email) {
          return res
            .status(400)
            .send({ message: "Email đã tồn tại", code: -1 });
        }
        if (existingUser.username === username) {
          return res
            .status(400)
            .send({ message: "Tên người dùng đã tồn tại", code: -1 });
        }
      }
      if (password !== re_password) {
        return res
          .status(400)
          .send({ message: "Mật khẩu không khớp", code: -1 });
      }
      const token = Common.generateToken();
      const user = new User({ username, email, password, phone, name });
      const { message, isValid } = Common.checkValidUserInfo(user);
      if (!isValid) {
        return res.status(400).send({
          message: message,
          code: -1,
        });
      }
      user.password = await bcrypt.hash(password, 8);
      cacheService.set(token, user);
      mailerService.sendMail(
        user.email,
        "Xác minh email của bạn",
        `
                <p>Chào ${user.name},</p>
                <p> Bạn có 5 phút để xác minh email của mình.</p>
                <p>Nhấp vào <a href="${process.env.BASE_URL}/user/verify-email?token=${token}&status=success">đây</a> để xác minh email của bạn.</p>
                <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`
      );
      res.status(201).send({
        message: "Vui lòng xác minh email của bạn",
        code: 1,
      });
    } catch (error) {
      res.status(400).send({
        message: error.message,
        code: -1,
      });
    }
  }

  async getAllGiftCodes(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const giftCodes = await GiftCode.findAndCountAll({
      limit,
      offset,
    });
    return res.json({
      giftCodes: giftCodes.rows,
      totalPages: Math.ceil(giftCodes.count / limit),
    });
  }
  // get all danh mục bài viết
  async getAllCategoriesPost(req, res) {
    const categoriesPost = await CategoriesPost.findAll();
    return res.status(200).send({
      message: "Thông tin chi tiết hồ sơ ứng viên",
      code: 1,
      categoriesPost,
    });
  }

  async getAllPaymentTransactions(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const paymentTransactions = await PaymentTransaction.findAndCountAll({
        limit,
        offset,
        where: { user_id: req.user.id, status: "success" },
      });
      return res.json({
        paymentTransactions: paymentTransactions.rows,
        totalPages: Math.ceil(paymentTransactions.count / limit),
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }

  async checkBalance(req, res) {
    const user = await User.findByPk(req.user.id);
    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (wallet.balance < 1000) {
      return res.status(400).send({
        message: "Số dư không đủ",
        code: -1,
      });
    }
    next();
  }

  async getAllConversations(req, res) {
    const { page = 1, limit = 9 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await Conversation.findAndCountAll({
      where: {
        user_id: req.user.id,
        content: { [Op.ne]: null },
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      conversations: conversations.rows,
      totalPages: Math.ceil(conversations.count / limit),
    });
  }
  async getUsageHistory(req, res) {
    // get token usage history of the user
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const tokenUsages = await TokenUsage.findAndCountAll({
        where: { user_id: req.user.id },
        limit,
        offset,
        order: [["usage_date", "DESC"]],
      });

      const botIds = tokenUsages.rows.map((usage) => usage.bot_id);
      const bots = await Bot.findAll({
        where: { id: botIds },
      });

      const tokenUsagesWithRates = tokenUsages.rows.map((usage) => {
        const bot = bots.find((b) => b.id === usage.bot_id);
        return {
          ...usage.toJSON(),
          input_rate: bot ? bot.input_rate : null,
          output_rate: bot ? bot.output_rate : null,
        };
      });

      return res.json({
        tokenUsages: tokenUsagesWithRates,
        totalPages: Math.ceil(tokenUsages.count / limit),
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  async getAllSavedJobsByUser(req, res) {
    // get token usage history of the user
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const savedJobs = await SavedJob.findAndCountAll({
        where: { user_id: req.user.id },
        limit,
        offset,
        // order: [["created_at", "DESC"]],
      });
      const jobIds = savedJobs.rows.map((savedJob) => savedJob.job_id);
      const jobs = await Job.findAll({
        where: { job_id: jobIds },
      });
      const savedJobsWithDetails = savedJobs.rows.map((savedJob) => {
        const jobDetail = jobs.find((j) => j.job_id === savedJob.job_id);
        return {
          ...savedJob.toJSON(),
          job: jobDetail,
        };
      });
      // get title of company from company_id
      const companyIds = savedJobsWithDetails.map(
        (savedJob) => savedJob.job.company_id
      );
      const companies = await Company.findAll({
        where: { company_id: companyIds },
      });
      const savedJobsWithCompanies = savedJobsWithDetails.map((savedJob) => {
        const company = companies.find(
          (c) => c.company_id === savedJob.job.company_id
        );
        return {
          ...savedJob,
          company_name: company.company_name,
          company_logo: company.logo,
        };
      });
      return res.json({
        savedJobs: savedJobsWithCompanies,
        totalPages: Math.ceil(savedJobs.count / limit),
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // SELECT * FROM career_handbook WHERE category_id = '1';
  async getCareerHandbookByCategoryId(req, res) {
    try {
      const careerHandbook = await CareerHandbook.findAll({
        where: { category_id: req.params.category_id },
      });
      return res.json({ careerHandbook });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  
  // get all cv templates với category
  async getAllCvTemplates(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const cvTemplates = await CvTemplates.findAndCountAll({
      limit,
      offset,
    });
    const templateIds = cvTemplates.rows.map(
      (cvTemplate) => cvTemplate.template_id
    );
    const templateTypeVariants = await TemplateTypeVariant.findAll({
      where: { template_id: templateIds },
    });
    // get all template_type theo template_id thông qua template_type_variants
    const templateTypes = await TemplateTypeVariant.findAll({
      where: { template_id: templateIds },
    });
    const cvTemplatesWithTemplateTypes = cvTemplates.rows.map((cvTemplate) => {
      const templateType = templateTypes.find(
        (t) => t.template_id === cvTemplate.template_id
      );
      return {
        ...cvTemplate.toJSON(),
        type_id: templateTypeVariants
          .filter((t) => t.template_id === cvTemplate.template_id)
          .map((t) => t.type_id),
      };
    });

    return res.json({
      cvTemplates: cvTemplatesWithTemplateTypes,
      totalPages: Math.ceil(cvTemplates.count / limit),
    });
  }
 
  // get all company 
  async getAllCompany(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const companies = await Company.findAndCountAll({
        limit,
        offset,
      });
      return res.json({
        companies: companies.rows,
        totalPages: Math.ceil(companies.count / limit),
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get all template fields by template_id
  async getAllTemplateFieldsByTemplateId(req, res) {
    try {
      const templateFields = await TemplateFields.findAll({
        where: { template_id: req.params.template_id },
      });
      return res.json({ templateFields });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get all cv field values by cv_id
  async getAllCvFieldValuesByCvId(req, res) {
    try {
      const cvFieldValues = await CvFieldValues.findAll({
        where: { cv_id: req.params.cv_id },
      });
      return res.json({ cvFieldValues });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get template by template_id
  async getTemplateById(req, res) {
    try {
      const template = await CvTemplates.findByPk(req.params.template_id);
      return res.json({ template });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get all user cv by user_id
  async getAllUserCvByUserId(req, res) {
    try {
      const userCv = await UserCv.findAll({ where: { user_id: req.user.id } });
      return res.json({ userCv });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  async getAllCandidateCvByUserId(req, res) {
    try {
      const candidateCv = await CandidateCv.findAll({
        where: { user_id: req.user.id },
      });
      return res.json({ candidateCv });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get recommended jobs by user
  async getAllSuitableJobsByUser(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const candidateCvs = await CandidateCv.findAll({
      where: { user_id: req.user.id },
      limit,
      offset,
    });

    try {
      // Lấy CV mới nhất của ứng viên (nếu có)
      const candidateCv = candidateCvs[0];
      if (!candidateCv) {
        return res.json({
          suitableJobs: [],
          totalJobs: 0,
          totalPages: 0,
        });
      }

      // 2. Lấy danh sách jobs và categories
      const [jobs, categories] = await Promise.all([
        Job.findAll(),
        Category.findAll(),
      ]);

      // 3. Lọc jobs theo cv_categories
      let filteredJobIds = [];
      if (candidateCv.cv_categories) {
        const candidateCategories = candidateCv.cv_categories
          .split(",")
          .map((c) => c.trim());

        // Lọc các category phù hợp
        const matchedCategories = categories.filter((category) =>
          candidateCategories.includes(category.category_id.toString())
        );

        // Lấy job_ids từ các category phù hợp
        filteredJobIds = matchedCategories.map((cat) => cat.category_id);
      }

      // 4. Lọc jobs theo category và other conditions
      const filteredJobs = jobs.filter((job) => {
        if (filteredJobIds.length > 0) {
          return filteredJobIds.includes(job.category_id);
        }
        return true; // Nếu không có category filter thì lấy tất cả
      });

      // 5. Lấy thông tin companies
      const companies = await Company.findAll();

      // 6. Kết hợp jobs với companies
      const suitableJobsWithCompany = filteredJobs.map((job) => {
        const company = companies.find((c) => c.company_id === job.company_id);
        return {
          ...job.toJSON(),
          Company: company ? company.toJSON() : null,
        };
      });

      // 7. Sắp xếp theo thời gian tạo mới nhất và giới hạn số lượng
      const sortedJobs = suitableJobsWithCompany
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(offset, offset + limit); // Giới hạn 10 jobs

      return res.json({
        suitableJobs: sortedJobs,
        totalJobs: sortedJobs.length,
        totalPages: Math.ceil(sortedJobs.length / limit),
      });
    } catch (error) {
      console.error("Error in getAllSuitableJobsByUser:", error);
      return res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }
  // get job detail by job_id
  async getJobDetailByJobId(req, res) {
    try {
      const job = await Job.findByPk(req.params.job_id);
      const company = await Company.findByPk(job.company_id);
      return res.json({ job, company });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
 // get company detail by company_id
 async getCompanyDetailByCompanyId(req, res) {
  try {
    const company = await Company.findByPk(req.params.company_id);
    return res.json({ company });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: -1,
    });
  }
}
  // get all viewed jobs by user
  async getAllViewedJobsByUser(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const viewedJobs = await ViewedJob.findAndCountAll({
      where: { user_id: req.user.id },
      limit,
      offset,
    });
    const jobIds = viewedJobs.rows.map((savedJob) => savedJob.job_id);
    const jobs = await Job.findAll({
      where: { job_id: jobIds },
    });
    const savedJobsWithDetails = viewedJobs.rows.map((savedJob) => {
      const jobDetail = jobs.find((j) => j.job_id === savedJob.job_id);
      return {
        ...savedJob.toJSON(),
        job: jobDetail,
      };
    });
    return res.json({
      viewedJobs: savedJobsWithDetails,
      totalPages: Math.ceil(viewedJobs.count / limit),
    });
  }
  // get all applied jobs by user
  async getAllAppliedJobsByUser(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const appliedJobs = await JobApplication.findAndCountAll({
      where: { user_id: req.user.id },
      limit,
      offset,
    });
    return res.json({
      appliedJobs: appliedJobs.rows,
      totalPages: Math.ceil(appliedJobs.count / limit),
    });
  }

  // get all career handbook
  async getAllCareerHandbook(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const careerHandbook = await CareerHandbook.findAndCountAll({
      limit,
      offset,
    });
    return res.json({
      careerHandbook: careerHandbook.rows,
      totalPages: Math.ceil(careerHandbook.count / limit),
    });
  }
  // get all top company
  async getAllTopCompany(req, res) {
    const { page = 1, limit = 9 } = req.query;
    const offset = (page - 1) * limit;
    const topCompany = await Company.findAndCountAll({
      limit,
      offset,
    });
    return res.json({
      topCompany: topCompany.rows,
      totalPages: Math.ceil(topCompany.count / limit),
    });
  }

  // get all jobs
  async getAllJobs(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const jobs = await Job.findAndCountAll({
      limit,
      offset,
    });
    return res.json({
      jobs: jobs.rows,
      totalPages: Math.ceil(jobs.count / limit),
    });
  }
  // get all featured career handbook
  async getAllFeaturedCareerHandbook(req, res) {
    const careerHandbook = await CareerHandbook.findAll({
      where: { isFeatured: true },
    });
    return res.status(200).send({
      message: "Thông tin chi tiết hồ sơ ứng viên",
      code: 1,
      careerHandbook,
    });
  }
  async getMostRecentConversations(req, res) {
    const { page = 1, limit = 3 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await Conversation.findAndCountAll({
      where: {
        user_id: req.user.id,
        content: { [Op.ne]: null },
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      conversations: conversations.rows,
      totalPages: Math.ceil(conversations.count / limit),
    });
  }
  // Xem thông tin chi tiết của conversation
  async getConversationDetail(req, res) {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return res.status(404).send({
        message: "Không tìm thấy cuộc trò chuyện",
        code: -1,
      });
    }
    return res.status(200).send({
      message: "Thông tin chi tiết cuộc trò chuyện",
      code: 1,
      conversation,
    });
  }
  // get all candidate profile
  async getAllCandidateProfile(req, res) {
    const candidates = await Candidate.findAll();
    return res.status(200).send({
      message: "Thông tin chi tiết hồ sơ ứng viên",
      code: 1,
      candidates,
    });
  }

  // get candidate profile by user_id
  async getCandidateProfile(req, res) {
    const candidate = await Candidate.findOne({
      where: { user_id: req.user.id },
    });
    return res.status(200).send({
      message: "Thông tin chi tiết hồ sơ ứng viên",
      code: 1,
      candidate,
    });
  }
}

module.exports = new UserController();
