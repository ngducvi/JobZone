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
const CandidateLanguages = require("../models/CandidateLanguages");
const CandidateExperiences = require("../models/CandidateExperiences");
const CandidateEducation = require("../models/CandidateEducation");
const CandidateCertifications = require("../models/CandidateCertifications");
const CandidateProjects = require("../models/CandidateProjects");

class UserController {
  constructor() {
    this.generateEducationId = () => {
      return 'edu-' + Math.random().toString(36).substr(2, 9);
    };
    this.generateExperienceId = () => {
      return 'exp-' + Math.random().toString(36).substr(2, 9);
    };
    this.generateLanguagesId = () => {
      return 'lang-' + Math.random().toString(36).substr(2, 9);
    };
    this.generateCertificationsId = () => {
      return 'cert-' + Math.random().toString(36).substr(2, 9);
    };
    this.generateProjectsId = () => {
      return 'proj-' + Math.random().toString(36).substr(2, 9);
    };
    this.generateApplicationId = () => {
      return 'app-' + Math.random().toString(36).substr(2, 9);
    };
    this.generateJobId = () => {
      return 'job-' + Math.random().toString(36).substr(2, 9);
    };
  }
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
  // get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();
      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
      code: 1,
      categories,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
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
      // get title,logo of company from company_id bên trong job:
      const companyId = company.company_id;
      const companyName = company.company_name;
      const companyLogo = company.logo;
      const companySize = company.size;
      const companyIndustry = company.industry;
      const companyAddress = company.address;
      return res.json({ job, companyId, companyName, companyLogo, companySize, companyIndustry, companyAddress });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get all jobs by company_id
  async getAllJobsByCompanyId(req, res) {
    try {
      const jobs = await Job.findAll({ where: { company_id: req.params.company_id } });
      return res.json({ jobs });
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
    // get title of company from company_id
    const companyIds = savedJobsWithDetails.map(
      (savedJob) => savedJob.job.company_id
    );
    const companies = await Company.findAll({
      where: { company_id: companyIds },
    });
    const viewedJobsWithCompanies = savedJobsWithDetails.map((savedJob) => {
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
      viewedJobs: viewedJobsWithCompanies,
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
    const jobIds = appliedJobs.rows.map((appliedJob) => appliedJob.job_id);
    const jobs = await Job.findAll({
      where: { job_id: jobIds },
    });
    const appliedJobsWithDetails = appliedJobs.rows.map((appliedJob) => {
      const jobDetail = jobs.find((j) => j.job_id === appliedJob.job_id);
      return {
        ...appliedJob.toJSON(),
        job: jobDetail,
      };
    });
    // get title of company from company_id
    const companyIds = appliedJobsWithDetails.map(
      (appliedJob) => appliedJob.job.company_id
    );
    const companies = await Company.findAll({
      where: { company_id: companyIds },
    });
    const appliedJobsWithCompanies = appliedJobsWithDetails.map((appliedJob) => {
      const company = companies.find(
        (c) => c.company_id === appliedJob.job.company_id
      );
      return {
        ...appliedJob,
        company_name: company.company_name,
        company_logo: company.logo,
      };
    });

    return res.json({
      appliedJobs: appliedJobsWithCompanies,
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
  // get all candidate languages
  async getAllCandidateLanguages(req, res) {
    const candidateLanguages = await CandidateLanguages.findAll();
    return res.status(200).send({
      message: "Thông tin chi tiết hồ sơ ứng viên",
      code: 1,
      candidateLanguages,
    });
  }
  // get candidate languages by candidate_id
  async getCandidateLanguagesByCandidateId(req, res) {
    try {
      const candidateLanguages = await CandidateLanguages.findAll({
        where: { candidate_id: req.params.candidate_id },
      });
      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
        code: 1,
        candidateLanguages,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get candidate experiences by candidate_id
  async getCandidateExperiencesByCandidateId(req, res) {
    try {
      const candidateExperiences = await CandidateExperiences.findAll({
        where: { candidate_id: req.params.candidate_id },
      });
      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
        code: 1,
        candidateExperiences,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get candidate education by candidate_id
  async getCandidateEducationByCandidateId(req, res) {
    try {
      const candidateEducation = await CandidateEducation.findAll({
        where: { candidate_id: req.params.candidate_id },
      });
      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
        code: 1,
        candidateEducation,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get candidate certifications by candidate_id
  async getCandidateCertificationsByCandidateId(req, res) {
    try {
      const candidateCertifications = await CandidateCertifications.findAll({
        where: { candidate_id: req.params.candidate_id },
      });
      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
        code: 1,
        candidateCertifications,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get candidate projects by candidate_id
  async getCandidateProjectsByCandidateId(req, res) {
    try {
      const candidateProjects = await CandidateProjects.findAll({
        where: { candidate_id: req.params.candidate_id },
      });
      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
        code: 1,
        candidateProjects,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  
  // create candidate education with candidate_id
  async createCandidateEducationWithCandidateId(req, res) {
    try {
      const candidateEducation = await CandidateEducation.create({
        id: this.generateEducationId(),
        candidate_id: req.params.candidate_id,
        institution: req.body.institution,
        degree: req.body.degree,
        field_of_study: req.body.field_of_study,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        grade: req.body.grade,
        activities: req.body.activities
      });

      return res.status(200).send({
        message: "Tạo thông tin học vấn thành công",
        code: 1,
        candidateEducation
      });
    } catch (error) {
      console.error("Error creating education:", error);
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }

  // create candidate experience with candidate_id
  async createCandidateExperienceWithCandidateId(req, res) {
    try {
      console.log('Sending data:', req.body); // Log data trước khi gửi
      const candidateExperience = await CandidateExperiences.create({
        id: this.generateExperienceId(),
        candidate_id: req.params.candidate_id,
        company_name: req.body.company_name,
        job_title: req.body.job_title,
        job_description: req.body.job_description,
        achievements: req.body.achievements,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        position: req.body.position // Thêm position
      });
      return res.status(200).send({
        message: "Tạo thông tin kinh nghiệm thành công",
        code: 1,
        candidateExperience,
      });
    } catch (error) {
      console.error('Error details:', error); // Log chi tiết lỗi
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // create candidate certifications with candidate_id
  async createCandidateCertificationsWithCandidateId(req, res) {
    try {
      const candidateCertifications = await CandidateCertifications.create({
        id: this.generateCertificationsId(),
        candidate_id: req.params.candidate_id,
        certification_name: req.body.certification_name,
        issuing_organization: req.body.issuing_organization,
        issue_date: req.body.issue_date,
        expiry_date: req.body.expiry_date,
        credential_id: req.body.credential_id,
        credential_url: req.body.credential_url
      });
      return res.status(200).send({
        message: "Tạo thông tin chứng chỉ thành công",
        code: 1,
        candidateCertifications
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // create candidate projects with candidate_id
  async createCandidateProjectsWithCandidateId(req, res) {
    try {
      const candidateProjects = await CandidateProjects.create({
        id: this.generateProjectsId(),
        candidate_id: req.params.candidate_id,
        project_name: req.body.project_name,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        role: req.body.role,
        technologies_used: req.body.technologies_used,
        project_url: req.body.project_url
      });
      return res.status(200).send({
        message: "Tạo thông tin dự án thành công",
        code: 1,
        candidateProjects
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // post job với job_id với company_id và category_id
  async postJobWithJobId(req, res) {
    try {
      const job = await Job.create({
        job_id: this.generateJobId(),
        ...req.body,
        company_id: req.body.company_id,
        category_id: req.body.category_id
      });
      return res.json({ job: job });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // create candidate languages with candidate_id
  async createCandidateLanguagesWithCandidateId(req, res) {
    try {
      const candidateLanguages = await CandidateLanguages.create({
        id: this.generateLanguagesId(),
        candidate_id: req.params.candidate_id,
        language: req.body.language,
        proficiency: req.body.proficiency
      });
      return res.status(200).send({
        message: "Tạo thông tin ngôn ngữ thành công",
        code: 1,
        candidateLanguages
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // edit candidate education
  async editCandidateEducation(req, res) {
    try {
      const education_id = req.params.id; // Lấy id từ params
      const updateData = req.body;
      
      const candidateEducation = await CandidateEducation.findByPk(education_id);
      
      if (!candidateEducation) {
        return res.status(404).send({
          message: "Không tìm thấy thông tin học vấn",
          code: -1
        });
      }

      await candidateEducation.update(updateData);
      
      return res.status(200).send({
        message: "Cập nhật thông tin học vấn thành công",
        code: 1,
        candidateEducation
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // edit candidate projects
  async editCandidateProjects(req, res) {
    try {
      const projects_id = req.params.id;
      const updateData = req.body;
      const candidateProjects = await CandidateProjects.findByPk(projects_id);
      await candidateProjects.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin dự án thành công",
        code: 1,
        candidateProjects
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // edit candidate certifications
  async editCandidateCertifications(req, res) {
    try {
      const certifications_id = req.params.id;
      const updateData = req.body;
      const candidateCertifications = await CandidateCertifications.findByPk(certifications_id);
      await candidateCertifications.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin chứng chỉ thành công",
        code: 1,
        candidateCertifications
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // edit candidate 
  async editCandidate(req, res) {
    try {
      const candidate_id = req.params.id;
      const updateData = req.body;
      const candidate = await Candidate.findByPk(candidate_id);
      await candidate.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin ứng viên thành công",
        code: 1,
        candidate
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }


  // edit candidate languages
  async editCandidateLanguages(req, res) {
    try {
      const languages_id = req.params.id;
      const updateData = req.body;
      const candidateLanguages = await CandidateLanguages.findByPk(languages_id);
      await candidateLanguages.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin ngôn ngữ thành công",
        code: 1,
        candidateLanguages
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // edit candidate experience
  async editCandidateExperience(req, res) {
    try {
      const experience_id = req.params.id;
      const updateData = req.body;
      const candidateExperience = await CandidateExperiences.findByPk(experience_id);
      await candidateExperience.update(updateData);
    return res.status(200).send({
        message: "Cập nhật thông tin kinh nghiệm thành công",
        code: 1,
        candidateExperience,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
   // edit is_searchable and is_actively_searching
  async editIsSearchableAndIsActivelySearching(req, res) {
    try {
      const candidate_id = req.params.id;
      const updateData = req.body;
      const candidate = await Candidate.findByPk(candidate_id);
      await candidate.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin ứng viên thành công",
        code: 1,
        candidate
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // delete candidate languages by id
  async deleteCandidateLanguagesById(req, res) {
    try {
      const languages_id = req.params.id;
      const candidateLanguages = await CandidateLanguages.findByPk(languages_id);
      await candidateLanguages.destroy();
      return res.status(200).send({
        message: "Xóa thông tin ngôn ngữ thành công",
        code: 1
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // delete candidate projects by id
  async deleteCandidateProjectsById(req, res) {
    try {
      const projects_id = req.params.id;
      const candidateProjects = await CandidateProjects.findByPk(projects_id);
      await candidateProjects.destroy();
      return res.status(200).send({
        message: "Xóa thông tin dự án thành công",
        code: 1
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // delete candidate certifications by id
  async deleteCandidateCertificationsById(req, res) {
    try {
      const certifications_id = req.params.id;
      const candidateCertifications = await CandidateCertifications.findByPk(certifications_id);
      await candidateCertifications.destroy();
      return res.status(200).send({
        message: "Xóa thông tin chứng chỉ thành công",
        code: 1
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // delete candidate experience by id
  async deleteCandidateExperienceById(req, res) {
    try {
      const experience_id = req.params.id;
      const candidateExperience = await CandidateExperiences.findByPk(experience_id);
      await candidateExperience.destroy();
      return res.status(200).send({
        message: "Xóa thông tin kinh nghiệm thành công",
        code: 1
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // delete candidate education by id
  async deleteCandidateEducationById(req, res) {
    try {
      const education_id = req.params.id;
      const candidateEducation = await CandidateEducation.findByPk(education_id);
      await candidateEducation.destroy();
      return res.status(200).send({
        message: "Xóa thông tin học vấn thành công",
        code: 1
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // lọc theo các điều kiện
  async filterJobs(req, res) {
    try {
      const {
        category_id,
        experience,
        salary,
        working_time,
        working_location,
        datePosted,
        location,
        rank,
        education
      } = req.query;

      let whereClause = {};

      // Filter by category
      if (category_id && category_id !== 'all') {
        whereClause.category_id = category_id;
      }

      // Filter by experience
      if (experience && experience !== 'all') {
        whereClause.experience = experience;
      }

      // Filter by working time
      if (working_time && working_time !== 'all') {
        whereClause.working_time = working_time;
      }

      // Filter by working location
      if (working_location && working_location !== 'all') {
        whereClause.working_location = working_location;
      }

      // Filter by location
      if (location) {
        whereClause.location = {
          [Op.like]: `%${location}%`
        };
      }

      // Filter by rank
      if (rank && rank !== 'all') {
        whereClause.rank = rank;
      }

      // Filter by education
      if (education && education !== 'all') {
        whereClause.education = education;
      }

      // Filter by date posted
      if (datePosted && datePosted !== 'all') {
        const now = new Date();
        switch (datePosted) {
          case 'last_hour':
            whereClause.created_at = {
              [Op.gte]: new Date(now - 60 * 60 * 1000)
            };
            break;
          case 'last_24h':
            whereClause.created_at = {
              [Op.gte]: new Date(now - 24 * 60 * 60 * 1000)
            };
            break;
          case 'last_7d':
            whereClause.created_at = {
              [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000)
            };
            break;
          case 'last_14d':
            whereClause.created_at = {
              [Op.gte]: new Date(now - 14 * 24 * 60 * 60 * 1000)
            };
            break;
          case 'last_30d':
            whereClause.created_at = {
              [Op.gte]: new Date(now - 30 * 24 * 60 * 60 * 1000)
            };
            break;
        }
      }

      // Filter by salary range
      if (salary && salary !== 'all') {
        whereClause.salary = salary;
      }

      const jobs = await Job.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        jobs: jobs,
        totalJobs: jobs.length
      });

    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
      });
    }
  }
  // Lưu job
  async saveJob(req, res) {
    try {
      const userId = req.user.id;
      const jobId = req.params.job_id;

      // Kiểm tra job có tồn tại không
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({
          message: "Không tìm thấy công việc",
          code: -1
        });
      }

      // Kiểm tra xem đã lưu chưa
      const existingSave = await SavedJob.findOne({
        where: {
          user_id: userId,
          job_id: jobId
        }
      });

      if (existingSave) {
        return res.status(400).json({
          message: "Bạn đã lưu công việc này rồi",
          code: -1
        });
      }

      // Tạo bản ghi mới
      const savedJob = await SavedJob.create({
        saved_id: `saved-${Date.now()}`,
        user_id: userId,
        job_id: jobId,
        saved_date: new Date()
      });

      res.status(201).json({
        message: "Lưu công việc thành công",
        code: 1,
        savedJob
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Bỏ lưu job
  async unsaveJob(req, res) {
    try {
      const userId = req.user.id;
      const jobId = req.params.job_id;

      const result = await SavedJob.destroy({
        where: {
          user_id: userId,
          job_id: jobId
        }
      });

      if (result === 0) {
        return res.status(404).json({
          message: "Không tìm thấy công việc đã lưu",
          code: -1
        });
      }

      res.status(200).json({
        message: "Bỏ lưu công việc thành công",
        code: 1
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Kiểm tra job đã được lưu chưa
  async isJobSaved(req, res) {
    try {
      const userId = req.user.id;
      const jobId = req.params.job_id;

      const savedJob = await SavedJob.findOne({
        where: {
          user_id: userId,
          job_id: jobId
        }
      });

      res.status(200).json({
        isSaved: !!savedJob,
        code: 1
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Thêm job vào lịch sử xem
  async addViewedJob(req, res) {
    try {
      const userId = req.user.id;
      const jobId = req.params.job_id;

      // Kiểm tra job có tồn tại không
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({
          message: "Không tìm thấy công việc",
          code: -1
        });
      }

      // Kiểm tra xem đã xem job này chưa
      const existingView = await ViewedJob.findOne({
        where: {
          user_id: userId,
          job_id: jobId
        }
      });

      if (existingView) {
        // Nếu đã xem rồi thì cập nhật thời gian xem
        await existingView.update({
          viewed_date: new Date()
        });
      } else {
        // Nếu chưa xem thì tạo mới
        await ViewedJob.create({
          viewed_id: `viewed-${Date.now()}`,
          user_id: userId,
          job_id: jobId,
          viewed_date: new Date()
        });
      }

      res.status(200).json({
        message: "Đã thêm vào lịch sử xem",
        code: 1
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Xóa tất cả lịch sử xem
  async clearViewedJobs(req, res) {
    try {
      const userId = req.user.id;

      await ViewedJob.destroy({
        where: {
          user_id: userId
        }
      });

      res.status(200).json({
        message: "Đã xóa toàn bộ lịch sử xem",
        code: 1
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Xóa một job khỏi lịch sử xem
  async deleteViewedJob(req, res) {
    try {
      const userId = req.user.id;
      const jobId = req.params.job_id;

      const result = await ViewedJob.destroy({
        where: {
          user_id: userId,
          job_id: jobId
        }
      });

      if (result === 0) {
        return res.status(404).json({
          message: "Không tìm thấy job trong lịch sử xem",
          code: -1
        });
      }

      res.status(200).json({
        message: "Đã xóa job khỏi lịch sử xem",
        code: 1
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Thêm vào UserController
  async applyForJob(req, res) {
    const { job_id } = req.body;
    const userId = req.user.id;

    try {
      // Kiểm tra xem công việc có tồn tại không
      const job = await Job.findByPk(job_id);
      if (!job) {
        return res.status(404).json({
          message: "Không tìm thấy công việc",
          code: -1,
        });
      }

      // Kiểm tra xem ứng viên đã nộp đơn cho công việc này chưa
      const existingApplication = await JobApplication.findOne({
        where: {
          user_id: userId,
          job_id: job_id,
        },
      });

      if (existingApplication) {
        return res.status(400).json({
          message: "Bạn đã nộp đơn cho công việc này rồi",
          code: -1,
        });
      }

      // Tạo đơn ứng tuyển mới
      const application = await JobApplication.create({
        application_id: this.generateApplicationId(),
        user_id: userId,
        job_id: job_id,
        applied_at: new Date(),
        status: 'Đang xét duyệt',
      });

      return res.status(201).json({
        message: "Nộp đơn thành công",
        code: 1,
        application,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }

  // Thêm vào UserController
  async checkApplicationStatus(req, res) {
    const { job_id } = req.params;
    const userId = req.user.id;

    try {
      const application = await JobApplication.findOne({
        where: {
          user_id: userId,
          job_id: job_id,
        },
      });

      if (application) {
        return res.status(200).json({
          message: "Bạn đã ứng tuyển cho công việc này.",
          code: 1,
          applied: true,
        });
      } else {
        return res.status(200).json({
          message: "Bạn chưa ứng tuyển cho công việc này.",
          code: 1,
          applied: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }

  // Thêm vào UserController
  async withdrawApplication(req, res) {
    const { job_id } = req.body;
    const userId = req.user.id;

    try {
      const application = await JobApplication.findOne({
        where: {
          user_id: userId,
          job_id: job_id,
        },
      });

      if (!application) {
        return res.status(404).json({
          message: "Không tìm thấy đơn ứng tuyển",
          code: -1,
        });
      }

      await application.destroy();

      return res.status(200).json({
        message: "Đơn ứng tuyển đã được hủy thành công",
        code: 1,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }
}

module.exports = new UserController();
