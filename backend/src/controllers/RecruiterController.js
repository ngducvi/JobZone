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
const RecruiterCompanies = require("../models/RecruiterConpanies");
const { v4: uuid } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const fs = require("fs");
const BusinessLicenses = require("../models/BusinessLicenses");
const Notifications = require("../models/Notifications");

class RecruiterController {
  constructor() {
    this.generateEducationId = () => {
      return "edu-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateExperienceId = () => {
      return "exp-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateLanguagesId = () => {
      return "lang-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateCertificationsId = () => {
      return "cert-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateProjectsId = () => {
      return "proj-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateApplicationId = () => {
      return "app-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateJobId = () => {
      return "job-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateBusinessLicenseId = () => {
      return "bl-" + Math.random().toString(36).substr(2, 9);
    };
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

      const recruiter = await User.findOne({
        where: {
          [Op.or]: [
            { phone: account },
            { email: account },
            { username: account },
          ],
          role: "recruiter",
        },
      });
      console.log("recruiter", recruiter);
      if (!recruiter) {
        return res.status(404).send({
          message: "Không tìm thấy người dùng",
          isValid: false,
          code: -1,
        });
      }

      const isMatch = await bcrypt.compare(password, recruiter.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Mật khẩu không hợp lệ", isValid: false, code: -1 });
      }
      const token = jwtService.generateToken({
        id: recruiter.id,
        username: recruiter.username,
        role: recruiter.role,
      });
      recruiter.password = undefined;
      res.status(200).send({
        message: "Đăng nhập thành công",
        code: 1,
        recruiter,
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
  // get all recruiter_companies
  async getAllRecruiterCompanies(req, res) {
    try {
      const recruiterCompanies = await RecruiterCompanies.findAll({
        where: { user_id: req.user.id },
      });
      const companyIds = recruiterCompanies.map(
        (company) => company.company_id
      );

      // Fetch additional company details based on companyIds
      const companies = await Company.findAll({
        where: { company_id: companyIds },
      });

      return res.json({ recruiterCompanies, companies });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;

      // Lấy company_id của recruiter
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { user_id: userId },
      });
      if (!recruiterCompany) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin công ty",
          code: -1,
        });
      }
      const companyId = recruiterCompany.company_id;
      // Lấy tất cả jobs của company
      const jobs = await Job.findAll({ where: { company_id: companyId } });

      // jobs count
      const totalJobs = jobs.length;
      // get count job application
      const totalApplications = await JobApplication.count({
        where: { job_id: { [Op.in]: jobs.map((job) => job.job_id) } },
      });
      // get count job với status active
      const totalActiveJobs = await Job.count({
        where: { company_id: companyId, status: "active" },
      });
      // get count job_application với applied_at 7 days ago
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const totalApplications7DaysAgo = await JobApplication.count({
        where: {
          job_id: { [Op.in]: jobs.map((job) => job.job_id) },
          applied_at: { [Op.gte]: sevenDaysAgo },
        },
      });

      // get plan user
      const user = await User.findByPk(userId);
      const plan = user.plan;
      return res.json({
        jobs,
        totalJobs,
        totalApplications,
        totalActiveJobs,
        totalApplications7DaysAgo,
        plan,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // get all jobs by company_id
  async getAllJobsByCompanyId(req, res) {
    try {
      const companyId = req.params.company_id;
      const jobs = await Job.findAll({ where: { company_id: companyId } });
      return res.json({ jobs: jobs });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }

  // get all job_application by job_id
  async getAllJobApplicationsByJobId(req, res) {
    try {
      const jobId = req.params.job_id;
      const jobApplications = await JobApplication.findAll({
        where: { job_id: jobId },
      });

      // Lấy tất cả user_id từ jobApplications
      const userIds = jobApplications.map(
        (jobApplication) => jobApplication.user_id
      );

      // Lấy thông tin người dùng
      const users = await User.findAll({ where: { id: { [Op.in]: userIds } } });

      // Lấy thông tin ứng viên
      const candidates = await Candidate.findAll({
        where: { user_id: { [Op.in]: userIds } },
      });

      // Kết hợp thông tin người dùng và ứng viên vào jobApplications
      const applicationsWithDetails = jobApplications.map((application) => {
        const user = users.find((u) => u.id === application.user_id);
        const candidate = candidates.find(
          (c) => c.user_id === application.user_id
        );
        return {
          ...application.get({ plain: true }),
          user: user || null, // Thêm thông tin người dùng vào kết quả
          candidate: candidate || null, // Thêm thông tin ứng viên vào kết quả
        };
      });

      return res.json({ jobApplications: applicationsWithDetails });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  // get all candidate
  async getAllCandidate(req, res) {
    try {
      const candidates = await Candidate.findAll();
      const userIds = candidates.map((candidate) => candidate.user_id);
      const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ["id", "name", "email", "phone", "created_at"], // Only select needed fields
      });

      const candidateIds = candidates.map(
        (candidate) => candidate.candidate_id
      );
      const candidateExperiences = await CandidateExperiences.findAll({
        where: { candidate_id: { [Op.in]: candidateIds } },
      });
      const candidateEducation = await CandidateEducation.findAll({
        where: { candidate_id: { [Op.in]: candidateIds } },
      });
      const candidateCertifications = await CandidateCertifications.findAll({
        where: { candidate_id: { [Op.in]: candidateIds } },
      });
      const candidateProjects = await CandidateProjects.findAll({
        where: { candidate_id: { [Op.in]: candidateIds } },
      });
      const candidateLanguages = await CandidateLanguages.findAll({
        where: { candidate_id: { [Op.in]: candidateIds } },
      });
      const candidateCvs = await CandidateCv.findAll({
        where: { user_id: { [Op.in]: userIds } },
      });

      // Replace user_id with user object in candidates
      const candidatesWithUsers = candidates.map((candidate) => {
        const candidateObj = candidate.get({ plain: true }); // Convert to plain object
        const user = users.find((user) => user.id === candidate.user_id);
        const candidateExperienceList = candidateExperiences.filter(
          (experience) => experience.candidate_id === candidate.candidate_id
        );
        const candidateEducationList = candidateEducation.filter(
          (education) => education.candidate_id === candidate.candidate_id
        );
        const candidateCertificationList = candidateCertifications.filter(
          (certification) =>
            certification.candidate_id === candidate.candidate_id
        );
        const candidateProjectList = candidateProjects.filter(
          (project) => project.candidate_id === candidate.candidate_id
        );
        const candidateLanguageList = candidateLanguages.filter(
          (language) => language.candidate_id === candidate.candidate_id
        );
        const candidateCvList = candidateCvs.filter(
          (cv) => cv.user_id === candidate.user_id
        );
        delete candidateObj.user_id; // Remove user_id
        return {
          ...candidateObj,
          user: user,
          candidateExperiences: candidateExperienceList, // Changed to an array of experiences
          candidateEducation: candidateEducationList,
          candidateCertifications: candidateCertificationList,
          candidateProjects: candidateProjectList,
          candidateLanguages: candidateLanguageList,
          candidateCvs: candidateCvList,
        };
      });

      return res.status(200).json({
        message: "Lấy danh sách ứng viên thành công",
        code: 1,
        candidates: candidatesWithUsers,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Lỗi khi lấy danh sách ứng viên",
        code: -1,
        error: error.message,
      });
    }
  }

  // edit job_application status
  async editJobApplicationStatus(req, res) {
    try {
      const { job_application_id, status } = req.body;
      const jobApplication = await JobApplication.findByPk(job_application_id);
      jobApplication.status = status;
      await jobApplication.save();
      return res.json({ message: "Cập nhật trạng thái thành công", code: 1 });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // get job_application by job_id
  async getJobApplicationByJobId(req, res) {
    try {
      const jobId = req.params.job_id;
      const jobApplications = await JobApplication.findAll({
        where: { job_id: jobId },
      });
      const userIds = jobApplications.map(
        (jobApplication) => jobApplication.user_id
      );
      const users = await User.findAll({ where: { id: { [Op.in]: userIds } } });
      return res.json({ jobApplications: jobApplications, users: users });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // get candidate detail by candidate_id
  async getCandidateDetailByCandidateId(req, res) {
    try {
      const candidateId = req.params.candidate_id;
      const candidate = await Candidate.findByPk(candidateId);
      
      // Lấy user_id của candidate thay vì của recruiter
      const candidateUserId = candidate.user_id;

      // get candidateExperiences by candidate_id
      const candidateExperiences = await CandidateExperiences.findAll({
        where: { candidate_id: candidateId },
      });
      // get candidateEducation by candidate_id
      const candidateEducation = await CandidateEducation.findAll({
        where: { candidate_id: candidateId },
      });
      // get candidateCertifications by candidate_id
      const candidateCertifications = await CandidateCertifications.findAll({
        where: { candidate_id: candidateId },
      });
      // get candidateProjects by candidate_id
      const candidateProjects = await CandidateProjects.findAll({
        where: { candidate_id: candidateId },
      });
      // get candidateLanguages by candidate_id
      const candidateLanguages = await CandidateLanguages.findAll({
        where: { candidate_id: candidateId },
      });
      // get candidateCvs by candidate_id
      const candidateCvs = await CandidateCv.findAll({
        where: { user_id: candidateUserId },
      });
      // get user by user_id từ candidate
      const user = await User.findByPk(candidateUserId);
      // get user_cv by user_id của candidate
      const userCvs = await UserCv.findAll({ 
        where: { user_id: candidateUserId }
      });
      return res.json({
        candidate: candidate,
        candidateExperiences: candidateExperiences,
        candidateEducation: candidateEducation,
        candidateCertifications: candidateCertifications,
        candidateProjects: candidateProjects,
        candidateLanguages: candidateLanguages,
        candidateCvs: candidateCvs,
        user: user,
        userCvs: userCvs,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async postJob(req, res) {
    try {
      const job = await Job.create({
        job_id: this.generateJobId(),
        company_id: req.body.company_id,
        title: req.body.title,
        description: req.body.description,
        salary: req.body.salary,
        location: req.body.location,
        experience: req.body.experience,
        benefits: req.body.benefits,
        job_requirements: req.body.job_requirements,
        working_time: req.body.working_time,
        working_location: req.body.working_location,
        status: req.body.status,
        version: 1,
        quantity: 1,
        rank: req.body.rank,
        education: req.body.education,
        created_at: new Date(),
        created_by: req.body.created_by,
        last_modified_at: new Date(),
        last_modified_by: req.body.last_modified_by,
        deadline: req.body.deadline,
        category_id: req.body.category_id,
      });
      return res.json({
        message: "Đăng tin tuyển dụng thành công",
        code: 1,
        job: job,
      });
    } catch (error) {
      console.error("Error posting job:", error);
      res.status(400).send({
        message: "Đã xảy ra lỗi khi đăng tin tuyển dụng.",
        error: error.message,
      });
    }
  }
  // get job by job_id
  async getJobByJobId(req, res) {
    try {
      const jobId = req.params.job_id;
      const job = await Job.findByPk(jobId);
      return res.json({ job: job });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // edit job
  async editJob(req, res) {
    try {
      const jobId = req.params.job_id;
      const job = await Job.findByPk(jobId);
      job.title = req.body.title;
      job.description = req.body.description;
      job.salary = req.body.salary;
      job.location = req.body.location;
      job.experience = req.body.experience;
      job.benefits = req.body.benefits;
      job.job_requirements = req.body.job_requirements;
      job.working_time = req.body.working_time;
      job.working_location = req.body.working_location;
      job.status = req.body.status;
      job.category_id = req.body.category_id;
      job.deadline = req.body.deadline;
      await job.save();
      return res.json({
        message: "Cập nhật tin tuyển dụng thành công",
        code: 1,
        job: job,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // delete job by job_id
  async deleteJob(req, res) {
    try {
      const jobId = req.params.job_id;
      await Job.destroy({ where: { job_id: jobId } });
      return res.json({ message: "Xóa tin tuyển dụng thành công", code: 1 });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async updateCompanyLogoWithCompanyId(req, res) {
    try {
      const company = await Company.findByPk(req.params.company_id);
      if (!company) {
        return res.status(404).send({
          message: "Không tìm thấy công ty",
          code: -1,
        });
      }
      let filename = req.file.filename;
      filename = filename.split(".");
      filename = filename[0] + uuid() + "." + filename[1];
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "company_logos",
          public_id: `company_${req.params.company_id}_${Date.now()}`,
        });

        await company.update({
          company_name: req.body.company_name,
          address: req.body.address,
          website: req.body.website,
          description: req.body.description,
          logo: result.secure_url,
          company_emp: req.body.company_emp,
        });
        return res.status(200).send({
          message: "Cập nhật logo công ty thành công",
          code: 1,
          company,
        });
      } catch (error) {
        return res.status(500).send({
          message: error.message,
          code: -1,
        });
      }
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // Thêm method mới để cập nhật thông tin công ty
  async updateCompany(req, res) {
    try {
      const company = await Company.findByPk(req.params.company_id);
      if (!company) {
        return res.status(404).send({
          message: "Không tìm thấy công ty",
          code: -1,
        });
      }

      const updateData = {
        company_name: req.body.company_name,
        address: req.body.address,
        website: req.body.website,
        description: req.body.description,
        company_emp: req.body.company_emp,
      };

      // Nếu có file logo mới được upload
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
            folder: "company_logos",
            public_id: `company_${req.params.company_id}_${Date.now()}`,
          });
          updateData.logo = result.secure_url;
        } catch (error) {
          return res.status(500).send({
            message: "Lỗi khi tải lên logo",
            code: -1,
          });
        }
      }
      // Nếu có file banner mới được upload
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
            folder: "company_banners",
            public_id: `company_${req.params.company_id}_${Date.now()}`,
          });
          updateData.banner = result.secure_url;
        } catch (error) {
          return res.status(500).send({
            message: "Lỗi khi tải lên banner",
            code: -1,
          });
        }
      }
      await company.update(updateData);

      return res.status(200).send({
        message: "Cập nhật thông tin công ty thành công",
        code: 1,
        company,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // update company banner with company_id
  async updateCompanyBannerWithCompanyId(req, res) {
    try {
      const company = await Company.findByPk(req.params.company_id);
      if (!company) {
        return res.status(404).send({
          message: "Không tìm thấy công ty",
          code: -1,
        });
      }
      let filename = req.file.filename;
      filename = filename.split(".");
      filename = filename[0] + uuid() + "." + filename[1];
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "company_banners",
          public_id: `company_${req.params.company_id}_${Date.now()}`,
        });
        await company.update({ banner: result.secure_url });
        return res.status(200).send({
          message: "Cập nhật banner công ty thành công",
          code: 1,
          company,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Lỗi khi tải lên banner",
          code: -1,
        });
      }
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // get business licenses by company_id
  async getBusinessLicensesByCompanyId(req, res) {
    try {
      const companyId = req.params.company_id;
      const businessLicenses = await BusinessLicenses.findAll({
        where: { company_id: companyId },
      });
      return res.json({ businessLicenses: businessLicenses });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // check xem đã có giấy phép kinh doanh chưa
  async checkBusinessLicense(req, res) {
    const companyId = req.params.company_id;
    try {
      const businessLicense = await BusinessLicenses.findOne({
        where: { company_id: companyId },
      });
      if (businessLicense) {
        return res.json({ businessLicense: businessLicense });
      } else {
        return res.json({ businessLicense: null });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // create business license with company_id
  async createBusinessLicense(req, res) {
    const companyId = req.params.company_id;
    try {
      const businessLicense = await BusinessLicenses.create({
        license_id: this.generateBusinessLicenseId(),
        company_id: companyId,
        business_license_status: "pending",
        tax_id: req.body.tax_id,
        registration_number: req.body.registration_number,
        license_issue_date: req.body.license_issue_date,
        license_expiry_date: req.body.license_expiry_date,
        contact_email: req.body.contact_email,
        contact_phone: req.body.contact_phone,
        industry: req.body.industry,
        founded_year: req.body.founded_year,
      });
      return res.json({ businessLicense: businessLicense });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  // update business license with business_license_id
  async updateBusinessLicense(req, res) {
    const businessLicenseId = req.params.license_id;
    try {
      const businessLicense = await BusinessLicenses.findByPk(businessLicenseId);
      if (!businessLicense) {
        return res.status(404).json({ message: "Không tìm thấy giấy phép" });
      }

      
      // Cập nhật dữ liệu
      const updatedData = {
        tax_id: req.body.tax_id || businessLicense.tax_id,
        registration_number: req.body.registration_number || businessLicense.registration_number,
        license_issue_date: req.body.license_issue_date || businessLicense.license_issue_date,
        license_expiry_date: req.body.license_expiry_date || businessLicense.license_expiry_date,
        contact_email: req.body.contact_email || businessLicense.contact_email,
        contact_phone: req.body.contact_phone || businessLicense.contact_phone,
        industry: req.body.industry || businessLicense.industry,
        founded_year: req.body.founded_year || businessLicense.founded_year,
        business_license_file: req.body.business_license_file || businessLicense.business_license_file,
        business_license_status: req.body.business_license_status || businessLicense.business_license_status
      };

      await businessLicense.update(updatedData);
      
      return res.status(200).json({
        message: "Cập nhật giấy phép kinh doanh thành công",
        code: 1,
        businessLicense: businessLicense
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        message: "Có lỗi xảy ra khi cập nhật giấy phép",
        code: -1,
        error: error.message 
      });
    }
  }
  // Update file giấy phép kinh doanh
  async updateBusinessLicenseFile(req, res) {
    try {
      const businessLicense = await BusinessLicenses.findByPk(req.params.license_id);
      if (!businessLicense) {
        return res.status(404).send({
          message: "Không tìm thấy giấy phép",
          code: -1,
        });
      }
      let filename = req.file.filename;
      filename = filename.split(".");
      filename = filename[0] + uuid() + "." + filename[1];
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "business_licenses",
          public_id: `business_license_${req.params.license_id}_${Date.now()}`,
        });
        await businessLicense.update({ business_license_file: result.secure_url });
        return res.status(200).send({
          message: "Cập nhật file giấy phép thành công",
          code: 1,
          businessLicense,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Lỗi khi tải lên file giấy phép",
          code: -1,
        });
      }
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }

  }
  // Thêm method search candidates
  async searchCandidates(req, res) {
    try {
      const { 
        industry, 
        gender, 
        expected_salary, 
        employment_type,
        experience,
        is_actively_searching,
        ...otherFilters 
      } = req.body;
      
      let whereClause = {};
      
      // Thêm điều kiện tìm kiếm theo industry
      if (industry && industry !== 'all') {
        whereClause.industry = industry;
      }

      // Thêm điều kiện tìm kiếm theo gender
      if (gender && gender !== 'all') {
        whereClause.gender = gender;
      }

      // Thêm điều kiện tìm kiếm theo expected_salary
      if (expected_salary && expected_salary !== 'all') {
        const [min, max] = expected_salary.split('-').map(Number);
        if (max) {
          whereClause.expected_salary = {
            [Op.between]: [min, max]
          };
        } else {
          whereClause.expected_salary = {
            [Op.gte]: min
          };
        }
      }

      // Thêm điều kiện tìm kiếm theo employment_type
      if (employment_type && employment_type !== 'all') {
        whereClause.employment_type = employment_type;
      }

      // Thêm điều kiện tìm kiếm theo experience
      if (experience && experience !== 'all') {
        whereClause.experience = experience;
      }
      
      // Thêm điều kiện tìm kiếm theo trạng thái tìm việc
      if (is_actively_searching !== undefined) {
        whereClause.is_actively_searching = is_actively_searching;
      }

      const candidates = await Candidate.findAll({
        where: whereClause,
        include: [{
          model: User,
          attributes: ['name', 'email']
        }],
        order: [['created_at', 'DESC']]
      });

      return res.json({
        message: "Tìm kiếm ứng viên thành công",
        candidates: candidates
      });

    } catch (error) {
      console.error('Search candidates error:', error);
      return res.status(500).json({
        message: "Đã có lỗi xảy ra khi tìm kiếm ứng viên",
        error: error.message
      });
    }
  }
  // Get all notifications for a recruiter
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const notifications = await Notifications.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return res.status(200).json({
        message: "Lấy danh sách thông báo thành công",
        code: 1,
        notifications: notifications.rows,
        total: notifications.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(notifications.count / limit)
      });
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return res.status(500).json({
        message: "Lỗi khi lấy danh sách thông báo",
        code: -1,
        error: error.message
      });
    }
  }

  // Get count of unread notifications
  async getUnreadNotificationsCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Notifications.count({
        where: { 
          user_id: userId,
          is_read: false 
        }
      });

      return res.status(200).json({
        message: "Lấy số thông báo chưa đọc thành công",
        code: 1,
        count
      });
    } catch (error) {
      console.error('Error in getUnreadNotificationsCount:', error);
      return res.status(500).json({
        message: "Lỗi khi lấy số thông báo chưa đọc",
        code: -1,
        error: error.message
      });
    }
  }

  // Mark a notification as read
  async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const [updated] = await Notifications.update(
        { is_read: true },
        {
          where: {
            id: notificationId,
            user_id: userId
          }
        }
      );

      if (updated === 0) {
        return res.status(404).json({
          message: "Không tìm thấy thông báo",
          code: -1
        });
      }

      return res.status(200).json({
        message: "Đánh dấu thông báo đã đọc thành công",
        code: 1
      });
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return res.status(500).json({
        message: "Lỗi khi đánh dấu thông báo đã đọc",
        code: -1,
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notifications.update(
        { is_read: true },
        {
          where: {
            user_id: userId,
            is_read: false
          }
        }
      );

      return res.status(200).json({
        message: "Đánh dấu tất cả thông báo đã đọc thành công",
        code: 1
      });
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error);
      return res.status(500).json({
        message: "Lỗi khi đánh dấu tất cả thông báo đã đọc",
        code: -1,
        error: error.message
      });
    }
  }

  // Delete a notification
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const deleted = await Notifications.destroy({
        where: {
          id: notificationId,
          user_id: userId
        }
      });

      if (deleted === 0) {
        return res.status(404).json({
          message: "Không tìm thấy thông báo",
          code: -1
        });
      }

      return res.status(200).json({
        message: "Xóa thông báo thành công",
        code: 1
      });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return res.status(500).json({
        message: "Lỗi khi xóa thông báo",
        code: -1,
        error: error.message
      });
    }
  }

  // Delete all read notifications
  async deleteAllReadNotifications(req, res) {
    try {
      const userId = req.user.id;

      const deleted = await Notifications.destroy({
        where: {
          user_id: userId,
          is_read: true
        }
      });

      return res.status(200).json({
        message: "Xóa tất cả thông báo đã đọc thành công",
        code: 1,
        deletedCount: deleted
      });
    } catch (error) {
      console.error('Error in deleteAllReadNotifications:', error);
      return res.status(500).json({
        message: "Lỗi khi xóa tất cả thông báo đã đọc",
        code: -1,
        error: error.message
      });
    }
  }
}

module.exports = new RecruiterController();
