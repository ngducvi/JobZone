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
  // update status candidate
  async updateStatusCandidate(req, res) {
    try {
      const { candidate_id } = req.params;
      const { status } = req.body;
      const candidate = await Candidate.findByPk(candidate_id);
      candidate.status = status;
      await candidate.save();
      return res.json({ candidate });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // update status job
  async updateStatusJob(req, res) {
    try {
      const { job_id } = req.params;
      const { status } = req.body;
      const job = await Job.findByPk(job_id);
      job.status = status;
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
}
module.exports = new AdminController();
