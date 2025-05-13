const { Op } = require("sequelize");
const User = require("../models/User");
const GiftCode = require("../models/GiftCode");
const Bot = require("../models/Bot");
const PaymentTransaction = require("../models/PaymentTransaction");
const Wallet = require("../models/Wallet");
const Company = require("../models/Company");
const Category = require("../models/Category");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const RecruiterCompanies = require("../models/RecruiterConpanies");
const CareerHandbook = require("../models/CareerHandbook");
const Reviews = require("../models/Reviews");
const BusinessLicenses = require("../models/BusinessLicenses");
const Notifications = require("../models/Notifications");
const NotificationController = require("../controllers/NotificationController");
const mailerService = require("../services/MailerService");
const sequelize = require("../config/database");
const JobApplication = require("../models/JobApplication");

class AdminController {
  constructor() {
    this.generateEducationId = () => {
      return "edu-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateCategoryId = () => {
      return "cat-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateCareerHandbookId = () => {
      return "ch-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateNotificationId = () => {
      return "noti-" + Math.random().toString(36).substr(2, 9);
    };
  }
  randomString(length) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  async countAllUsers(req, res) {
    const users = await User.count({
      where: {
        role: "user",
      },
    });
    return res.json({ count: users });
  }
  // get count user có role là recruiter
  async countAllRecruiterUsers(req, res) {
    const users = await User.count({
      where: {
        role: "recruiter",
      },
    });
    return res.json({ count: users });
  }
  async countAllModels(req, res) {
    const models = await Bot.count({
      where: {
        input_rate: {
          [Op.ne]: null,
        },
        output_rate: {
          [Op.ne]: null,
        },
      },
    });
    return res.json({ count: models });
  }
  async countAllJobs(req, res) {
    const jobs = await Job.count();
    return res.json({ count: jobs });
  }
  async countAllCandidates(req, res) {
    const candidates = await Candidate.count();
    return res.json({ count: candidates });
  }
  async countAllGiftCodes(req, res) {
    const giftCodes = await GiftCode.count();
    return res.json({ count: giftCodes });
  }
  async countAllPaymentTransactions(req, res) {
    const paymentTransactions = await PaymentTransaction.count();
    return res.json({ count: paymentTransactions });
  }

  async getAllUsers(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const users = await User.findAndCountAll({
      where: {
        role: "user",
      },
      limit,
      offset,
    });
    return res.json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
    });
  }

  async getAllModels(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const models = await Bot.findAndCountAll({
      where: {
        input_rate: {
          [Op.ne]: null,
        },
        output_rate: {
          [Op.ne]: null,
        },
      },
      limit,
      offset,
    });
    return res.json({
      models: models.rows,
      totalPages: Math.ceil(models.count / limit),
    });
  }
  async getBotsWithInputRate(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const bots = await Bot.findAndCountAll({
      where: {
        input_rate: {
          [Op.ne]: null,
        },
      },
      limit,
      offset,
    });
    return res.json({
      bots: bots.rows,
      totalPages: Math.ceil(bots.count / limit),
    });
  }
  async createModel(req, res) {
    const { name, input_rate, output_rate } = req.body;
    const space_id = this.randomString(6);
    const model = await Bot.create({
      name,
      space_id,
      input_rate,
      output_rate,
    });
    return res.json({ model });
  }
  async editModel(req, res) {
    const { id } = req.params;
    const { input_rate, output_rate } = req.body;
    const model = await Bot.findByPk(id);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    model.input_rate = input_rate;
    model.output_rate = output_rate;
    await model.save();
    return res.json({ model });
  }
  async deleteModel(req, res) {
    const { id } = req.params;
    const model = await Bot.findByPk(id);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    await model.destroy();
    return res.json({ success: true });
  }

  async getAllGiftCodes(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const giftCodes = await GiftCode.findAndCountAll({
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    return res.json({
      giftCodes: giftCodes.rows,
      totalPages: Math.ceil(giftCodes.count / limit),
    });
  }
  // get all categories
  async getAllCategories(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const categories = await Category.findAndCountAll({
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    return res.json({
      categories: categories.rows,
      totalPages: Math.ceil(categories.count / limit),
    });
  }
  // get all jobs
  async getAllJobs(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      // Base query
      const whereClause = status ? { status } : {};

      // Get filtered jobs with pagination
      const jobs = await Job.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      // Get counts for each status
      const counts = {
        active: await Job.count({ where: { status: "Active" } }),
        pending: await Job.count({ where: { status: "Pending" } }),
        closed: await Job.count({ where: { status: "Closed" } }),
      };

      return res.json({
        jobs: jobs.rows,
        totalPages: Math.ceil(jobs.count / limit),
        counts,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  async createGiftCode(req, res) {
    const { amount, code, expired_at } = req.body;
    if (!code) {
      code = this.randomString(6);
    }
    const giftCode = await GiftCode.create({
      code,
      amount,
      expired_at,
    });
    return res.json({ giftCode });
  }
  async editGiftCode(req, res) {
    const { id } = req.params;
    const { amount, code } = req.body;
    const giftCode = await GiftCode.findByPk(id);
    if (!giftCode) {
      return res.status(404).json({ error: "Gift code not found" });
    }
    if (giftCode.is_used) {
      return res.status(400).json({ error: "Cannot edit a used gift code" });
    }
    giftCode.amount = amount;
    giftCode.code = code;
    await giftCode.save();
    return res.json({ giftCode });
  }
  async deleteGiftCode(req, res) {
    const { id } = req.params;
    const giftCode = await GiftCode.findByPk(id);
    if (!giftCode) {
      return res.status(404).json({ error: "Gift code not found" });
    }
    if (giftCode.is_used) {
      return res.status(400).json({ error: "Cannot delete a used gift code" });
    }
    await giftCode.destroy();
    return res.json({ success: true });
  }
  // get all wallets
  async getAllWallets(req, res) {
    const wallets = await Wallet.findAll();
    return res.json({ wallets });
  }

  async getAllPaymentTransactions(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const paymentTransactions = await PaymentTransaction.findAndCountAll({
      where: {
        status: {
          [Op.ne]: "Pending",
        },
      },
      limit,
      offset,
    });

    // Fetch user information for each payment transaction
    const paymentsWithUsers = await Promise.all(
      paymentTransactions.rows.map(async (payment) => {
        const user = await User.findByPk(payment.user_id);
        return {
          payment,
          user: {
            id: user.id,
            name: user.name,
          },
        };
      })
    );
    return res.json({
      payments: paymentsWithUsers,
      totalPages: Math.ceil(paymentTransactions.count / limit),
    });
  }

  async getUserRegistrationStats(req, res) {
    const { year } = req.query;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const users = await User.findAll({
      attributes: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at"))],
      order: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
          "ASC",
        ],
      ],
    });

    const stats = users.map((user) => ({
      month: user.get("month"),
      count: user.get("count"),
    }));

    return res.json({ stats });
  }
  // get all categories
  async getUserRegistrationStats(req, res) {
    const { year } = req.query;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const users = await User.findAll({
      attributes: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at"))],
      order: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
          "ASC",
        ],
      ],
    });

    const stats = users.map((user) => ({
      month: user.get("month"),
      count: user.get("count"),
    }));

    return res.json({ stats });
  }
  async getAllCandidates(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const candidates = await Candidate.findAndCountAll({
      limit,
      offset,
    });

    return res.json({
      candidates: candidates.rows,
      totalPages: Math.ceil(candidates.count / limit),
    });
  }
  // get count candidates
  async getCountCandidates(req, res) {
    const candidates = await Candidate.count();
    return res.json({ count: candidates });
  }
  // get all companies
  async getAllCompanies(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const companies = await Company.findAndCountAll({
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    //get c
    return res.json({
      companies: companies.rows,
      totalPages: Math.ceil(companies.count / limit),
    });
  }
  async getAllRecruiterCompanies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Fetch recruiter companies with pagination
      const recruiterCompanies = await RecruiterCompanies.findAndCountAll({
        limit,
        offset,
        raw: true,
      });

      // Get company_ids and user_ids
      const companyIds = recruiterCompanies.rows.map((rc) => rc.company_id);
      const userIds = recruiterCompanies.rows.map((rc) => rc.user_id);

      // Fetch companies, users, and business licenses
      const [companies, users, businessLicenses] = await Promise.all([
        Company.findAll({
          where: { company_id: companyIds },
          raw: true,
        }),
        User.findAll({
          where: { id: userIds },
          raw: true,
        }),
        BusinessLicenses.findAll({
          where: { company_id: companyIds },
          raw: true,
        })
      ]);

      // Get reviews for each company
      const companyReviews = {};
      for (const companyId of companyIds) {
        const reviews = await Reviews.findAll({
          where: { company_id: companyId },
          raw: true,
        });
        companyReviews[companyId] = reviews;
      }

      // Tạo map để dễ dàng tìm kiếm business license theo company_id
      const businessLicenseMap = businessLicenses.reduce((map, license) => {
        map[license.company_id] = license;
        return map;
      }, {});

      // Map data
      const recruiterCompaniesWithDetails = recruiterCompanies.rows.map(
        (recruiter) => {
          const company = companies.find(
            (c) => c.company_id === recruiter.company_id
          );
          const user = users.find((u) => u.id === recruiter.user_id);

          // Lấy business license chính xác theo company_id
          const businessLicense = businessLicenseMap[recruiter.company_id];

          return {
            ...recruiter,
            company: company
              ? {
                ...company,
                reviews: companyReviews[recruiter.company_id] || [],
                businessLicense: businessLicense || null  // Map business license đúng với company_id
              }
              : null,
            user: user
              ? {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                username: user.username,
                role: user.role,
                avatar: user.avatar,
                created_at: user.created_at,
                updated_at: user.updated_at,
              }
              : null,
          };
        }
      );

      // Log để debug
      console.log("Company IDs:", companyIds);
      console.log("Business Licenses Map:", businessLicenseMap);
      console.log("Mapped Data:", recruiterCompaniesWithDetails.map(rc => ({
        recruiter_id: rc.recruiter_id,
        company_id: rc.company_id,
        businessLicense: rc.company?.businessLicense
      })));

      return res.json({
        recruiterCompanies: recruiterCompaniesWithDetails,
        totalPages: Math.ceil(recruiterCompanies.count / limit),
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // eidt business_license_status by license_id
  async updateBusinessLicenseStatus(req, res) {
    const { license_id } = req.params;
    const { business_license_status } = req.body;
    try {
      const businessLicense = await BusinessLicenses.findByPk(license_id);
      if (!businessLicense) {
        return res.status(404).json({ error: "Business license not found" });
      }
      businessLicense.business_license_status = business_license_status;
      await businessLicense.save();
      return res.json({ businessLicense });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // get all candidates

  // get all reviews
  async getAllReviews(req, res) {
    try {
      const reviews = await Reviews.findAll();
      return res.json({ reviews });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // get all reviews by company id
  async getAllReviewsByCompanyId(req, res) {
    try {
      const { company_id } = req.params;
      const reviews = await Reviews.findAll({
        where: { company_id },
      });
      return res.json({ reviews });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  //   update status recruiter company
  async updateStatusRecruiterCompany(req, res) {
    const { recruiter_id } = req.params;
    const { status } = req.body;
    try {
      const recruiterCompany = await RecruiterCompanies.findByPk(recruiter_id);
      if (!recruiterCompany) {
        return res.status(404).json({ error: "Recruiter company not found" });
      }

      // Validate status
      const validStatuses = ['pending', 'active', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Status must be one of: pending, active, rejected'
        });
      }

      // Lấy thông tin user và company
      const [user, company] = await Promise.all([
        User.findByPk(recruiterCompany.user_id),
        Company.findByPk(recruiterCompany.company_id)
      ]);

      if (!user || !company) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin người dùng hoặc công ty"
        });
      }

      recruiterCompany.status = status;
      await recruiterCompany.save();

      // Tạo thông báo cho nhà tuyển dụng
      await NotificationController.createCompanyStatusNotification(recruiterCompany.user_id, status);

      // Gửi response ngay lập tức
      res.status(200).json({ 
        success: true,
        message: 'Cập nhật trạng thái thành công',
        recruiterCompany 
      });

      // Chuẩn bị và gửi email bất đồng bộ
      process.nextTick(async () => {
        try {
          // Chuẩn bị thông tin cho email
          let statusInfo = {
            title: '',
            description: '',
            color: '',
            icon: '',
            nextSteps: []
          };

          switch(status) {
            case 'active':
              statusInfo = {
                title: 'Tài khoản nhà tuyển dụng đã được kích hoạt',
                description: 'Tài khoản nhà tuyển dụng của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu đăng tin tuyển dụng.',
                color: '#059669',
                icon: '✅',
                nextSteps: [
                  'Đăng tin tuyển dụng mới',
                  'Cập nhật thông tin công ty',
                  'Quản lý các tin tuyển dụng'
                ]
              };
              break;
            case 'pending':
              statusInfo = {
                title: 'Tài khoản nhà tuyển dụng đang chờ xét duyệt',
                description: 'Tài khoản nhà tuyển dụng của bạn đang trong quá trình xét duyệt. Chúng tôi sẽ thông báo kết quả sớm nhất.',
                color: '#f59e0b',
                icon: '⏳',
                nextSteps: [
                  'Chờ phản hồi từ đội ngũ xét duyệt',
                  'Chuẩn bị thông tin công ty',
                  'Kiểm tra email thường xuyên'
                ]
              };
              break;
            case 'rejected':
              statusInfo = {
                title: 'Tài khoản nhà tuyển dụng bị từ chối',
                description: 'Tài khoản nhà tuyển dụng của bạn đã bị từ chối. Vui lòng kiểm tra và cập nhật thông tin theo yêu cầu.',
                color: '#dc2626',
                icon: '⚠️',
                nextSteps: [
                  'Kiểm tra lý do từ chối',
                  'Cập nhật thông tin theo yêu cầu',
                  'Liên hệ hỗ trợ nếu cần thiết'
                ]
              };
              break;
          }

          // Template email
          const emailTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f3f4f6;
              }
              .email-container {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                overflow: hidden;
              }
              .header {
                text-align: center;
                padding: 30px 20px;
                background: linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}30 100%);
                border-bottom: 1px solid ${statusInfo.color}20;
              }
              .header h2 {
                color: ${statusInfo.color};
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .header-icon {
                font-size: 48px;
                margin-bottom: 15px;
              }
              .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 8px 16px;
                border-radius: 50px;
                background-color: ${statusInfo.color}15;
                color: ${statusInfo.color};
                font-weight: 600;
                margin: 15px 0;
                border: 1px solid ${statusInfo.color}30;
              }
              .status-badge span {
                margin-left: 8px;
              }
              .content {
                padding: 30px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1f2937;
              }
              .message {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid ${statusInfo.color};
              }
              .company-details {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .company-details h3 {
                color: #374151;
                margin-top: 0;
                font-size: 18px;
              }
              .next-steps {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .next-steps h3 {
                color: #374151;
                margin-top: 0;
                font-size: 18px;
                display: flex;
                align-items: center;
              }
              .next-steps h3::before {
                content: '📋';
                margin-right: 8px;
              }
              .next-steps ul {
                margin: 15px 0;
                padding-left: 20px;
              }
              .next-steps li {
                margin: 10px 0;
                padding-left: 8px;
                position: relative;
              }
              .next-steps li::before {
                content: '•';
                color: ${statusInfo.color};
                font-weight: bold;
                position: absolute;
                left: -15px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: ${statusInfo.color};
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: 500;
                text-align: center;
                transition: all 0.3s ease;
              }
              .button:hover {
                background-color: ${statusInfo.color}dd;
              }
              .footer {
                text-align: center;
                padding: 20px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.9em;
              }
              .footer p {
                margin: 5px 0;
              }
              .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 20px 0;
              }
              .contact-info {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
              }
              .contact-info a {
                color: ${statusInfo.color};
                text-decoration: none;
              }
              @media (max-width: 600px) {
                body {
                  padding: 10px;
                }
                .content {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <div class="header-icon">${statusInfo.icon}</div>
                <h2>${statusInfo.title}</h2>
              </div>
              
              <div class="content">
                <p class="greeting">Chào ${user.name},</p>
                
                <div class="status-badge">
                  ${statusInfo.icon} <span>${status}</span>
                </div>
                
                <div class="message">
                  <p>${statusInfo.description}</p>
                </div>

                <div class="company-details">
                  <h3>Thông tin công ty:</h3>
                  <p><strong>Tên công ty:</strong> ${company.company_name}</p>
                  <p><strong>Địa chỉ:</strong> ${company.address || 'Chưa cập nhật'}</p>
                  <p><strong>Website:</strong> ${company.website || 'Chưa cập nhật'}</p>
                  <p><strong>Quy mô:</strong> ${company.company_size || 'Chưa cập nhật'}</p>
                </div>
                
                <div class="next-steps">
                  <h3>Các bước tiếp theo</h3>
                  <ul>
                    ${statusInfo.nextSteps.map(step => `<li>${step}</li>`).join('')}
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.FE_URL}/recruiter/dashboard" class="button">
                    Truy cập trang quản lý
                  </a>
                </div>
              </div>

              <div class="footer">
                <p style="font-weight: 600; color: #374151;">JobZone Team</p>
                <div class="divider"></div>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <div class="contact-info">
                  <a href="mailto:support@jobzone.com">📧 support@jobzone.com</a>
                  <a href="tel:+84123456789">📞 0123 456 789</a>
                </div>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} JobZone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
          `;

          // Gửi email thông báo
          await mailerService.sendMail(
            user.email,
            statusInfo.title,
            emailTemplate
          );
        } catch (error) {
          console.error('Error sending email:', error);
        }
      });

    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // update status candidate
  async updateStatusCandidate(req, res) {
    try {
      const { candidate_id } = req.params;
      const { status } = req.body;

      const candidate = await Candidate.findByPk(candidate_id);
      
      if (!candidate) {
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy ứng viên' 
        });
      }

      // Lấy thông tin user
      const user = await User.findByPk(candidate.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng'
        });
      }

      candidate.status = status;
      await candidate.save();

      // Tạo thông báo cho ứng viên
      await NotificationController.createCandidateStatusNotification(candidate.user_id, status);

      // Gửi response ngay lập tức
      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        candidate 
      });

      // Gửi email bất đồng bộ
      process.nextTick(async () => {
        try {
          // Chuẩn bị nội dung email dựa trên trạng thái
          let statusInfo = {
            title: '',
            description: '',
            color: '',
            icon: '',
            nextSteps: []
          };

          switch(status) {
            case 'active':
              statusInfo = {
                title: 'Hồ sơ đã được kích hoạt',
                description: 'Hồ sơ của bạn đã được kích hoạt thành công trên JobZone.',
                color: '#059669',
                icon: '✅',
                nextSteps: [
                  'Cập nhật thông tin hồ sơ thường xuyên',
                  'Tìm kiếm việc làm phù hợp',
                  'Theo dõi các công ty bạn quan tâm'
                ]
              };
              break;
            case 'inactive':
              statusInfo = {
                title: 'Hồ sơ tạm thời bị vô hiệu hóa',
                description: 'Hồ sơ của bạn đã bị vô hiệu hóa tạm thời. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.',
                color: '#dc2626',
                icon: '⚠️',
                nextSteps: [
                  'Kiểm tra email để biết lý do vô hiệu hóa',
                  'Liên hệ hỗ trợ để được giải đáp',
                  'Cập nhật thông tin theo yêu cầu (nếu có)'
                ]
              };
              break;
            case 'pending':
              statusInfo = {
                title: 'Hồ sơ đang chờ xét duyệt',
                description: 'Hồ sơ của bạn đang trong quá trình xét duyệt. Chúng tôi sẽ thông báo kết quả sớm nhất.',
                color: '#f59e0b',
                icon: '⏳',
                nextSteps: [
                  'Kiểm tra email thường xuyên',
                  'Hoàn thiện thêm thông tin hồ sơ (nếu có)',
                  'Chờ phản hồi từ đội ngũ xét duyệt'
                ]
              };
              break;
            default:
              statusInfo = {
                title: 'Cập nhật trạng thái hồ sơ',
                description: `Trạng thái hồ sơ của bạn đã được cập nhật thành: ${status}`,
                color: '#6b7280',
                icon: '📝',
                nextSteps: [
                  'Kiểm tra thông tin hồ sơ',
                  'Cập nhật thông tin nếu cần thiết'
                ]
              };
          }

          // Template email
          const emailTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f3f4f6;
              }
              .email-container {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                overflow: hidden;
              }
              .header {
                text-align: center;
                padding: 30px 20px;
                background: linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}30 100%);
                border-bottom: 1px solid ${statusInfo.color}20;
              }
              .header h2 {
                color: ${statusInfo.color};
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .header-icon {
                font-size: 48px;
                margin-bottom: 15px;
              }
              .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 8px 16px;
                border-radius: 50px;
                background-color: ${statusInfo.color}15;
                color: ${statusInfo.color};
                font-weight: 600;
                margin: 15px 0;
                border: 1px solid ${statusInfo.color}30;
              }
              .status-badge span {
                margin-left: 8px;
              }
              .content {
                padding: 30px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1f2937;
              }
              .message {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid ${statusInfo.color};
              }
              .next-steps {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .next-steps h3 {
                color: #374151;
                margin-top: 0;
                font-size: 18px;
                display: flex;
                align-items: center;
              }
              .next-steps h3::before {
                content: '📋';
                margin-right: 8px;
              }
              .next-steps ul {
                margin: 15px 0;
                padding-left: 20px;
              }
              .next-steps li {
                margin: 10px 0;
                padding-left: 8px;
                position: relative;
              }
              .next-steps li::before {
                content: '•';
                color: ${statusInfo.color};
                font-weight: bold;
                position: absolute;
                left: -15px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: ${statusInfo.color};
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: 500;
                text-align: center;
                transition: all 0.3s ease;
              }
              .button:hover {
                background-color: ${statusInfo.color}dd;
              }
              .footer {
                text-align: center;
                padding: 20px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.9em;
              }
              .footer p {
                margin: 5px 0;
              }
              .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 20px 0;
              }
              .contact-info {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
              }
              .contact-info a {
                color: ${statusInfo.color};
                text-decoration: none;
              }
              @media (max-width: 600px) {
                body {
                  padding: 10px;
                }
                .content {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <div class="header-icon">${statusInfo.icon}</div>
                <h2>${statusInfo.title}</h2>
              </div>
              
              <div class="content">
                <p class="greeting">Chào ${user.name},</p>
                
                <div class="status-badge">
                  ${statusInfo.icon} <span>${status}</span>
                </div>
                
                <div class="message">
                  <p>${statusInfo.description}</p>
                </div>

                <div class="next-steps">
                  <h3>Các bước tiếp theo</h3>
                  <ul>
                    ${statusInfo.nextSteps.map(step => `<li>${step}</li>`).join('')}
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.FE_URL}/candidate/profile" class="button">
                    Xem và cập nhật hồ sơ
                  </a>
                </div>
              </div>

              <div class="footer">
                <p style="font-weight: 600; color: #374151;">JobZone Team</p>
                <div class="divider"></div>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <div class="contact-info">
                  <a href="mailto:support@jobzone.com">📧 support@jobzone.com</a>
                  <a href="tel:+84123456789">📞 0123 456 789</a>
                </div>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} JobZone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
          `;

          // Gửi email thông báo
          await mailerService.sendMail(
            user.email,
            statusInfo.title,
            emailTemplate
          );
        } catch (error) {
          console.error('Error sending email:', error);
        }
      });

    } catch (error) {
      console.error('Error in updateStatusCandidate:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật trạng thái ứng viên'
      });
    }
  }
  // update status job
  async updateStatusJob(req, res) {
    try {
      const { job_id } = req.params;
      const { status } = req.body;
      const job = await Job.findByPk(job_id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy công việc"
        });
      }

      // Lấy thông tin công ty và recruiter
      const company = await Company.findByPk(job.company_id);
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { company_id: job.company_id }
      });
      const recruiter = await User.findByPk(recruiterCompany.user_id);

      if (!company || !recruiter) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin công ty hoặc nhà tuyển dụng"
        });
      }

      job.status = status;
      await job.save();

      // Tạo thông báo cho công việc được duyệt được đóng hoặc hết hạn
      await NotificationController.createJobClosedNotification(job_id, recruiter.id, status, job.title);

      // Gửi response ngay lập tức
      res.json({ 
        success: true,
        message: "Cập nhật trạng thái thành công",
        job 
      });

      // Chuẩn bị và gửi email bất đồng bộ
      process.nextTick(async () => {
        try {
          // Chuẩn bị thông tin cho email
          let statusInfo = {
            title: '',
            description: '',
            color: '',
            icon: '',
            nextSteps: []
          };

          switch(status) {
            case 'active':
              statusInfo = {
                title: 'Tin tuyển dụng đã được kích hoạt',
                description: 'Tin tuyển dụng của bạn đã được phê duyệt và đăng tải thành công trên JobZone.',
                color: '#059669',
                icon: '✅',
                nextSteps: [
                  'Theo dõi các ứng viên nộp đơn',
                  'Cập nhật thông tin tuyển dụng nếu cần',
                  'Phản hồi nhanh chóng khi có ứng viên mới'
                ]
              };
              break;
            case 'inactive':
              statusInfo = {
                title: 'Tin tuyển dụng tạm thời bị vô hiệu hóa',
                description: 'Tin tuyển dụng của bạn đã bị vô hiệu hóa. Vui lòng kiểm tra và cập nhật theo yêu cầu.',
                color: '#dc2626',
                icon: '⚠️',
                nextSteps: [
                  'Kiểm tra lý do vô hiệu hóa',
                  'Cập nhật thông tin theo yêu cầu',
                  'Liên hệ hỗ trợ nếu cần thiết'
                ]
              };
              break;
            case 'pending':
              statusInfo = {
                title: 'Tin tuyển dụng đang chờ xét duyệt',
                description: 'Tin tuyển dụng của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.',
                color: '#f59e0b',
                icon: '⏳',
                nextSteps: [
                  'Chờ phản hồi từ đội ngũ xét duyệt',
                  'Chuẩn bị kế hoạch tuyển dụng',
                  'Kiểm tra email thường xuyên'
                ]
              };
              break;
            case 'expired':
              statusInfo = {
                title: 'Tin tuyển dụng đã hết hạn',
                description: 'Tin tuyển dụng của bạn đã hết hạn đăng tải.',
                color: '#6b7280',
                icon: '⌛',
                nextSteps: [
                  'Đánh giá kết quả tuyển dụng',
                  'Tạo tin tuyển dụng mới nếu cần',
                  'Xem xét gia hạn tin tuyển dụng'
                ]
              };
              break;
            default:
              statusInfo = {
                title: 'Cập nhật trạng thái tin tuyển dụng',
                description: `Trạng thái tin tuyển dụng đã được cập nhật thành: ${status}`,
                color: '#6b7280',
                icon: '📝',
                nextSteps: [
                  'Kiểm tra thông tin tuyển dụng',
                  'Cập nhật nếu cần thiết'
                ]
              };
          }

          // Template email
          const emailTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f3f4f6;
              }
              .email-container {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                overflow: hidden;
              }
              .header {
                text-align: center;
                padding: 30px 20px;
                background: linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}30 100%);
                border-bottom: 1px solid ${statusInfo.color}20;
              }
              .header h2 {
                color: ${statusInfo.color};
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .header-icon {
                font-size: 48px;
                margin-bottom: 15px;
              }
              .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 8px 16px;
                border-radius: 50px;
                background-color: ${statusInfo.color}15;
                color: ${statusInfo.color};
                font-weight: 600;
                margin: 15px 0;
                border: 1px solid ${statusInfo.color}30;
              }
              .status-badge span {
                margin-left: 8px;
              }
              .content {
                padding: 30px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1f2937;
              }
              .message {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid ${statusInfo.color};
              }
              .job-details {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .job-details h3 {
                color: #374151;
                margin-top: 0;
                font-size: 18px;
              }
              .next-steps {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .next-steps h3 {
                color: #374151;
                margin-top: 0;
                font-size: 18px;
                display: flex;
                align-items: center;
              }
              .next-steps h3::before {
                content: '📋';
                margin-right: 8px;
              }
              .next-steps ul {
                margin: 15px 0;
                padding-left: 20px;
              }
              .next-steps li {
                margin: 10px 0;
                padding-left: 8px;
                position: relative;
              }
              .next-steps li::before {
                content: '•';
                color: ${statusInfo.color};
                font-weight: bold;
                position: absolute;
                left: -15px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: ${statusInfo.color};
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: 500;
                text-align: center;
                transition: all 0.3s ease;
              }
              .button:hover {
                background-color: ${statusInfo.color}dd;
              }
              .footer {
                text-align: center;
                padding: 20px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.9em;
              }
              .footer p {
                margin: 5px 0;
              }
              .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 20px 0;
              }
              .contact-info {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
              }
              .contact-info a {
                color: ${statusInfo.color};
                text-decoration: none;
              }
              @media (max-width: 600px) {
                body {
                  padding: 10px;
                }
                .content {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <div class="header-icon">${statusInfo.icon}</div>
                <h2>${statusInfo.title}</h2>
              </div>
              
              <div class="content">
                <p class="greeting">Chào ${recruiter.name},</p>
                
                <div class="status-badge">
                  ${statusInfo.icon} <span>${status}</span>
                </div>
                
                <div class="message">
                  <p>${statusInfo.description}</p>
                </div>

                <div class="job-details">
                  <h3>Thông tin tin tuyển dụng:</h3>
                  <p><strong>Vị trí:</strong> ${job.title}</p>
                  <p><strong>Công ty:</strong> ${company.company_name}</p>
                  <p><strong>Địa điểm:</strong> ${job.location || 'Chưa cập nhật'}</p>
                  <p><strong>Mức lương:</strong> ${job.salary || 'Thỏa thuận'}</p>
                  ${job.deadline ? `<p><strong>Hạn nộp hồ sơ:</strong> ${new Date(job.deadline).toLocaleDateString('vi-VN')}</p>` : ''}
                </div>
                
                <div class="next-steps">
                  <h3>Các bước tiếp theo</h3>
                  <ul>
                    ${statusInfo.nextSteps.map(step => `<li>${step}</li>`).join('')}
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.FE_URL}/job-detail/${job.job_id}" class="button">
                    Xem chi tiết tin tuyển dụng
                  </a>
                </div>
              </div>

              <div class="footer">
                <p style="font-weight: 600; color: #374151;">JobZone Team</p>
                <div class="divider"></div>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <div class="contact-info">
                  <a href="mailto:support@jobzone.com">📧 support@jobzone.com</a>
                  <a href="tel:+84123456789">📞 0123 456 789</a>
                </div>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} JobZone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
          `;

          // Gửi email thông báo
          await mailerService.sendMail(
            recruiter.email,
            statusInfo.title,
            emailTemplate
          );
        } catch (error) {
          console.error('Error sending email:', error);
        }
      });

    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  async editJob(req, res) {
    const { id } = req.params;
    const {
      title,
      description,
      salary,
      location,
      company_id,
      status,
      deadline,
      quantity,
      rank,
      education,
      experience,
    } = req.body;
    try {
      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      job.title = title;
      job.description = description;
      job.salary = salary;
      job.location = location;
      job.company_id = company_id;
      job.status = status;
      job.deadline = deadline;
      job.quantity = quantity;
      job.rank = rank;
      job.education = education;
      job.experience = experience;
      await job.save();
      return res.json({ job });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // get company detail by company id
  async getCompanyDetailByCompanyId(req, res) {
    const { id } = req.params;
    try {
      const company = await Company.findByPk(id);
      return res.json({ company });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  async getAllCareerHandbooks(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const careerHandbooks = await CareerHandbook.findAndCountAll({
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    return res.json({
      careerHandbooks: careerHandbooks.rows,
      totalPages: Math.ceil(careerHandbooks.count / limit),
    });
  }

  async getUserDetail(req, res) {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ user });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // create category
  async createCategory(req, res) {
    try {
      const { category_name, description } = req.body;
      const category = await Category.create({
        category_id: this.generateCategoryId(),
        category_name,
        description,
        created_at: new Date(),
        created_by: "admin",
        last_modified_by: "admin",
        version: 1,
      });
      return res.json({ category });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // edit category by category id
  async editCategory(req, res) {
    try {
      const { category_id } = req.params;
      const { category_name, description, last_modified_by } = req.body;

      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      category.category_name = category_name;
      category.description = description;
      category.last_modified_by = last_modified_by;
      await category.save();

      return res.json({ category });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // delete category by category id
  async deleteCategory(req, res) {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    await category.destroy();
    return res.json({ success: true });
  }
  // create career handbook
  async createCareerHandbook(req, res) {
    try {
      const { title, category_id, content } = req.body;
      const careerHandbook = await CareerHandbook.create({
        post_id: this.generateCareerHandbookId(),
        title,
        category_id,
        content,
        created_at: new Date(),
        created_by: "admin",
        last_modified_by: "admin",
        version: 1,
        status: "draft",
        isFeatured: false,
      });
      return res.json({ careerHandbook });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // edit career handbook by post_id
  async editCareerHandbook(req, res) {
    const { post_id } = req.params;
    const { title, category_id, content, last_modified_by } = req.body;
    try {
      const careerHandbook = await CareerHandbook.findByPk(post_id);
      if (!careerHandbook) {
        return res.status(404).json({ error: "Career handbook not found" });
      }
      careerHandbook.title = title;
      careerHandbook.category_id = category_id;
      careerHandbook.content = content;
      careerHandbook.last_modified_by = last_modified_by;
      await careerHandbook.save();
      return res.json({ careerHandbook });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // delete career handbook by post_id
  async deleteCareerHandbook(req, res) {
    try {
      const { post_id } = req.params;
      const careerHandbook = await CareerHandbook.findByPk(post_id);
      await careerHandbook.destroy();
      return res.json({ success: true });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // get job statistics by month
  async getJobStatisticsByMonth(req, res) {
    const { year } = req.query;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    try {
      const jobs = await Job.findAll({
        attributes: [
          [sequelize.fn("MONTH", sequelize.col("created_at")), "month"],
          [sequelize.fn("COUNT", sequelize.col("job_id")), "count"],
        ],
        where: {
          created_at: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.fn("MONTH", sequelize.col("created_at"))],
        order: [
          [sequelize.fn("MONTH", sequelize.col("created_at")), "ASC"],
        ],
      });

      const stats = jobs.map((job) => ({
        month: job.get("month"),
        count: job.get("count"),
      }));

      return res.json({ stats });
    } catch (error) {
      console.error("Error in getJobStatisticsByMonth:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // get candidate statistics 
  async getCandidateStatistics(req, res) {
    try {
      const { year, month } = req.query;
      
      // Calculate start and end dates for the month
      let startDate, endDate;
      if (month) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0); // Last day of the specified month
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
      }

      // Total number of candidates
      const totalCandidates = await Candidate.count();
      
      // Actively searching candidates
      const activelySearching = await Candidate.count({
        where: { is_actively_searching: true }
      });
      
      // Searchable candidates
      const searchable = await Candidate.count({
        where: { is_searchable: true }
      });
      
      // Active candidates (with status = 'active')
      const activeCandidates = await Candidate.count({
        where: { status: 'active' }
      });
      
      // New candidates created in current month/year
      const newCandidates = await Candidate.count({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Candidates by month for the current year
      const candidatesByMonth = await Candidate.findAll({
        attributes: [
          [sequelize.fn("MONTH", sequelize.col("created_at")), "month"],
          [sequelize.fn("COUNT", sequelize.col("candidate_id")), "count"]
        ],
        where: {
          created_at: {
            [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)]
          }
        },
        group: [sequelize.fn("MONTH", sequelize.col("created_at"))],
        order: [[sequelize.fn("MONTH", sequelize.col("created_at")), "ASC"]]
      });
      
      const monthlyStats = candidatesByMonth.map(stat => ({
        month: stat.get("month"),
        count: stat.get("count")
      }));
      
      return res.json({
        totalCandidates,
        activelySearching,
        searchable,
        activeCandidates,
        newCandidates,
        candidatesByMonth: monthlyStats
      });
    } catch (error) {
      console.error("Error in getCandidateStatistics:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
  
  // get candidates by status stats
  async getCandidatesByStatusStats(req, res) {
    try {
      const statuses = await Candidate.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("candidate_id")), "count"]
        ],
        group: ["status"],
        where: {
          status: {
            [Op.ne]: null
          }
        }
      });
      
      const stats = statuses.map(status => ({
        status: status.get("status"),
        count: status.get("count")
      }));
      
      return res.json({ stats });
    } catch (error) {
      console.error("Error in getCandidatesByStatusStats:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
  
  // get candidates by industry stats
  async getCandidatesByIndustryStats(req, res) {
    try {
      const industries = await Candidate.findAll({
        attributes: [
          "industry",
          [sequelize.fn("COUNT", sequelize.col("candidate_id")), "count"]
        ],
        group: ["industry"],
        where: {
          industry: {
            [Op.ne]: null
          }
        }
      });
      
      const stats = industries.map(industry => ({
        industry: industry.get("industry"),
        count: industry.get("count")
      }));
      
      return res.json({ stats });
    } catch (error) {
      console.error("Error in getCandidatesByIndustryStats:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
  // get recruiter statistics
  async getRecruiterStatistics(req, res) {
    try {
      const { year, month } = req.query;
      
      // Calculate start and end dates for the month
      let startDate, endDate;
      if (month) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0); // Last day of the specified month
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
      }

      // Total number of recruiters (users with role 'recruiter')
      const totalRecruiters = await User.count({
        where: { role: 'recruiter' }
      });
      
      // Total number of companies
      const totalCompanies = await Company.count();
      
      // Companies by status
      const pendingCompanies = await RecruiterCompanies.count({
        where: { status: 'pending' }
      });
      
      const activeCompanies = await RecruiterCompanies.count({
        where: { status: 'active' }
      });
      
      const rejectedCompanies = await RecruiterCompanies.count({
        where: { status: 'rejected' }
      });
      
      // New recruiters created in current month/year
      const newRecruiters = await User.count({
        where: {
          role: 'recruiter',
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // New companies created in current month/year
      const newCompanies = await Company.count({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Companies by month for the current year
      const companiesByMonth = await Company.findAll({
        attributes: [
          [sequelize.fn("MONTH", sequelize.col("created_at")), "month"],
          [sequelize.fn("COUNT", sequelize.col("company_id")), "count"]
        ],
        where: {
          created_at: {
            [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)]
          }
        },
        group: [sequelize.fn("MONTH", sequelize.col("created_at"))],
        order: [[sequelize.fn("MONTH", sequelize.col("created_at")), "ASC"]]
      });
      
      const monthlyStats = companiesByMonth.map(stat => ({
        month: stat.get("month"),
        count: stat.get("count")
      }));

      // Get business license statistics
      const businessLicenseStats = {
        pending: await BusinessLicenses.count({
          where: { business_license_status: 'pending' }
        }),
        verified: await BusinessLicenses.count({
          where: { business_license_status: 'verified' }
        }),
        rejected: await BusinessLicenses.count({
          where: { business_license_status: 'rejected' }
        })
      };
      
      return res.json({
        totalRecruiters,
        totalCompanies,
        pendingCompanies,
        activeCompanies,
        rejectedCompanies,
        newRecruiters,
        newCompanies,
        companiesByMonth: monthlyStats,
        businessLicenseStats
      });
    } catch (error) {
      console.error("Error in getRecruiterStatistics:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
  
  // get companies by plan stats
  async getCompaniesByPlanStats(req, res) {
    try {
      const plans = await Company.findAll({
        attributes: [
          "plan",
          [sequelize.fn("COUNT", sequelize.col("company_id")), "count"]
        ],
        group: ["plan"]
      });
      
      const stats = plans.map(plan => ({
        plan: plan.get("plan"),
        count: plan.get("count")
      }));
      
      return res.json({ stats });
    } catch (error) {
      console.error("Error in getCompaniesByPlanStats:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
  
  // get companies by business license status stats
  async getCompaniesByLicenseStats(req, res) {
    try {
      // Get counts from the BusinessLicenses table
      const licenseCounts = await BusinessLicenses.findAll({
        attributes: [
          "business_license_status",
          [sequelize.fn("COUNT", sequelize.col("license_id")), "count"]
        ],
        group: ["business_license_status"]
      });
      
      // Get total companies count
      const totalCompanies = await Company.count();
      
      // Get total companies with license (any status)
      const companiesWithLicense = await BusinessLicenses.count({
        distinct: true,
        col: 'company_id'
      });
      
      // Calculate companies without license
      const companiesWithoutLicense = totalCompanies - companiesWithLicense;
      
      // Format the response
      const stats = licenseCounts.map(status => ({
        status: status.get("business_license_status"),
        count: status.get("count")
      }));
      
      // Add companies without license to the stats
      stats.push({
        status: 'no_license',
        count: companiesWithoutLicense
      });
      
      return res.json({ stats });
    } catch (error) {
      console.error("Error in getCompaniesByLicenseStats:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
  
  // get company registration trend (weekly for current month)
  async getCompanyRegistrationTrend(req, res) {
    try {
      const { year, month } = req.query;
      
      // Calculate start and end dates for the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the specified month
      
      // Get all companies created in the month
      const companies = await Company.findAll({
        attributes: [
          [sequelize.fn("DAY", sequelize.col("created_at")), "day"],
          [sequelize.fn("COUNT", sequelize.col("company_id")), "count"]
        ],
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [sequelize.fn("DAY", sequelize.col("created_at"))],
        order: [[sequelize.fn("DAY", sequelize.col("created_at")), "ASC"]]
      });
      
      // Group by week
      const weeks = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Initialize weeks array (4 or 5 weeks depending on month)
      const numWeeks = Math.ceil(daysInMonth / 7);
      for (let i = 0; i < numWeeks; i++) {
        weeks.push({ week: i + 1, count: 0 });
      }
      
      // Fill in the counts
      companies.forEach(company => {
        const day = parseInt(company.get("day"));
        const weekIndex = Math.floor((day - 1) / 7);
        if (weekIndex >= 0 && weekIndex < weeks.length) {
          weeks[weekIndex].count += parseInt(company.get("count"));
        }
      });
      
      return res.json({ 
        year,
        month,
        weeks
      });
    } catch (error) {
      console.error("Error in getCompanyRegistrationTrend:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Lấy thống kê CV ứng tuyển mới 
  async getNewJobApplicationsStats(req, res) {
    try {
      const { company_id, since } = req.query;
      
      // Xác định thời điểm bắt đầu
      let startDate;
      if (since === 'today') {
        // Lấy ngày hôm nay lúc 00:00:00
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else if (since === 'yesterday') {
        // Lấy ngày hôm qua lúc 00:00:00
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
      } else if (since === 'week') {
        // Lấy 7 ngày trước 
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (since === 'hour') {
        // Lấy 1 giờ trước
        startDate = new Date();
        startDate.setHours(startDate.getHours() - 1);
      } else {
        // Mặc định 24 giờ qua
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
      }
      
      // Định nghĩa điều kiện tìm kiếm
      const whereClause = {
        applied_at: {
          [Op.gte]: startDate
        }
      };
      
      // Nếu có company_id, thêm điều kiện lọc theo công ty
      if (company_id) {
        // Đầu tiên lấy tất cả job_id của công ty
        const companyJobs = await Job.findAll({
          attributes: ['job_id'],
          where: { company_id },
          raw: true
        });
        
        const jobIds = companyJobs.map(job => job.job_id);
        
        if (jobIds.length > 0) {
          whereClause.job_id = {
            [Op.in]: jobIds
          };
        } else {
          // Nếu công ty không có job nào, trả về 0
          return res.json({
            newApplications: 0,
            byStatus: [],
            recentApplications: []
          });
        }
      }
      
      // Đếm số lượng đơn mới
      const totalNewApplications = await JobApplication.count({
        where: whereClause
      });
      
      // Thống kê theo trạng thái
      const applicationsByStatus = await JobApplication.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('application_id')), 'count']
        ],
        where: whereClause,
        group: ['status']
      });
      
      // Lấy 10 đơn ứng tuyển gần nhất
      const recentApplications = await JobApplication.findAll({
        where: whereClause,
        order: [['applied_at', 'DESC']],
        limit: 10,
        include: [
          {
            model: Job,
            attributes: ['title', 'company_id'],
            required: true
          }
        ]
      });
      
      // Map dữ liệu để trả về
      const formattedByStatus = applicationsByStatus.map(status => ({
        status: status.status,
        count: parseInt(status.get('count'))
      }));
      
      return res.json({
        newApplications: totalNewApplications,
        byStatus: formattedByStatus,
        recentApplications: recentApplications
      });
      
    } catch (error) {
      console.error("Error in getNewJobApplicationsStats:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
}
module.exports = new AdminController();
