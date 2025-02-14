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

class AdminController {
  constructor() {}
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
        active: await Job.count({ where: { status: 'Active' } }),
        pending: await Job.count({ where: { status: 'Pending' } }),
        closed: await Job.count({ where: { status: 'Closed' } })
      };
      
      return res.json({
        jobs: jobs.rows,
        totalPages: Math.ceil(jobs.count / limit),
        counts
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
  // get all companies
  async getAllCompanies(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const companies = await Company.findAndCountAll({
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
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
        raw: true, // Thêm raw: true để lấy plain object
      });

      // Lấy danh sách company_ids và user_ids
      const companyIds = recruiterCompanies.rows.map((rc) => rc.company_id);
      const userIds = recruiterCompanies.rows.map((rc) => rc.user_id);

      // Fetch companies và users
      const [companies, users] = await Promise.all([
        Company.findAll({
          where: { company_id: companyIds },
          raw: true,
        }),
        User.findAll({
          where: { id: userIds },
          raw: true,
        }),
      ]);

      // Map data
      const recruiterCompaniesWithDetails = recruiterCompanies.rows.map(
        (recruiter) => {
          const company = companies.find(
            (c) => c.company_id === recruiter.company_id
          );
          const user = users.find((u) => u.id === recruiter.user_id);

          return {
            ...recruiter,
            company,
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
  //   update status recruiter company
  async updateStatusRecruiterCompany(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const recruiterCompany = await RecruiterCompanies.findByPk(id);
      if (!recruiterCompany) {
        return res.status(404).json({ error: "Recruiter company not found" });
      }
    recruiterCompany.status = status;
    await recruiterCompany.save();
      return res.json({ recruiterCompany });
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
}
module.exports = new AdminController();
