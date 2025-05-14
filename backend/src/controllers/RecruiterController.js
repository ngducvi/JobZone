const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Job = require("../models/Job");
const bcrypt = require("bcryptjs");
const jwtService = require("../services/JWTService"); // Import the JWT service
const mailerService = require("../services/MailerService"); // Import the Mailer service
const cacheService = require("../services/CacheService"); // Import the Cache service
const Common = require("../helpers/Common");
const { Op } = require("sequelize");
const PaymentTransaction = require("../models/PaymentTransaction");
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
const fileService = require('../services/FileService');
const NotificationController = require("./NotificationController");
const excel = require('exceljs');
const sequelize = require('sequelize');

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
    this.generateReviewId = () => {
      return "rev-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateCandidateId = () => {
      return "cand-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateCandidateCvId = () => {
      return "cand-cv-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateUserCvId = () => {
      return "user-cv-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateValueId = () => {
      return "val-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateCompanyId = () => {
      return "comp-" + Math.random().toString(36).substr(2, 9);
    };
    this.generateRecruiterId = () => {
      return "recruiter-" + Math.random().toString(36).substr(2, 9);
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
      // Tạo user với role là recruiter
      const user = new User({ 
        username, 
        email, 
        password, 
        phone, 
        name, 
        role: 'recruiter' 
      });
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
        "Xác Minh Tài Khoản Nhà Tuyển Dụng JobZone",
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác Minh Tài Khoản Nhà Tuyển Dụng JobZone</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f5f7fa; color: #333333;">
          <!-- Preheader text (hidden) -->
          <div style="display: none; max-height: 0px; overflow: hidden;">
            Xác minh tài khoản nhà tuyển dụng JobZone của bạn để bắt đầu đăng tin tuyển dụng.
          </div>
          
          <!-- Main Container -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 30px 0;">
                <!-- Email Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08);">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #013a74 0%, #02a346 100%);">
                            <img src="${process.env.LOGO_URL ||
                              "https://your-logo-url.com"
                            }" alt="JobZone" style="max-width: 180px; height: auto; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));">
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <!-- Welcome Section -->
                        <tr>
                          <td style="padding: 50px 50px 30px;">
                            <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #013a74; text-align: center; letter-spacing: -0.5px;">Xác Minh Email Nhà Tuyển Dụng</h1>
                            
                            <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                              Xin chào <span style="font-weight: 600; color: #013a74;">${user.name
                              }</span>,
                            </p>
                            
                            <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                              Cảm ơn bạn đã đăng ký tài khoản nhà tuyển dụng tại <span style="font-weight: 600; color: #013a74;">JobZone</span>. Chúng tôi rất vui mừng được đồng hành cùng bạn trong hành trình tìm kiếm ứng viên tài năng.
                            </p>
                          </td>
                        </tr>
                        
                        <!-- Verification Box -->
                        <tr>
                          <td style="padding: 0 50px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(to right, rgba(1, 58, 116, 0.03), rgba(2, 163, 70, 0.03)); border-radius: 12px; overflow: hidden;">
                              <tr>
                                <td style="padding: 30px; border-left: 4px solid #02a346;">
                                  <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                                    Để hoàn tất quá trình đăng ký, vui lòng xác minh địa chỉ email của bạn trong vòng:
                                  </p>
                                  
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td style="padding: 15px 0; text-align: center;">
                                        <p style="margin: 0; font-size: 24px; font-weight: 700; color: #013a74;">5 phút</p>
                                      </td>
                                    </tr>
                                  </table>
                                  
                                  <p style="margin: 15px 0 0; font-size: 14px; line-height: 1.5; color: #6b7280; text-align: center;">
                                    Liên kết xác minh sẽ hết hạn sau thời gian trên
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- CTA Button -->
                        <tr>
                          <td style="padding: 0 50px 40px; text-align: center;">
                            <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                              <tr>
                                <td style="background: linear-gradient(135deg, #013a74 0%, #02a346 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(1, 58, 116, 0.2);">
                                  <a href="${process.env.BASE_URL
                                    }/user/verify-email?token=${token}&status=success" 
                                     style="display: inline-block; padding: 16px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                                    Xác Minh Email Ngay
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Security Notice -->
                        <tr>
                          <td style="padding: 0 50px 50px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                              <tr>
                                <td style="padding: 20px; background-color: #f9fafb;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td width="24" style="vertical-align: top; padding-right: 15px;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/1161/1161388.png" alt="Security" width="24" height="24">
                                      </td>
                                      <td>
                                        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4b5563;">
                                          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi.
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 50px;">
                      <div style="height: 1px; background-color: #e5e7eb;"></div>
                    </td>
                  </tr>
                  
                  <!-- Benefits Section -->
                  <tr>
                    <td style="padding: 40px 50px 30px;">
                      <h3 style="margin: 0 0 25px; font-size: 18px; font-weight: 600; color: #013a74; text-align: center;">
                        Tại sao chọn JobZone cho nhà tuyển dụng?
                      </h3>
                      
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="33%" style="padding: 0 10px; vertical-align: top; text-align: center;">
                            <img src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png" alt="Ứng viên chất lượng" width="40" height="40" style="margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4b5563;">Ứng viên chất lượng</p>
                          </td>
                          <td width="33%" style="padding: 0 10px; vertical-align: top; text-align: center;">
                            <img src="https://cdn-icons-png.flaticon.com/512/1584/1584892.png" alt="Đăng tin hiệu quả" width="40" height="40" style="margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4b5563;">Đăng tin hiệu quả</p>
                          </td>
                          <td width="33%" style="padding: 0 10px; vertical-align: top; text-align: center;">
                            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Quản lý ứng viên" width="40" height="40" style="margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4b5563;">Quản lý ứng viên</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
                        <tr>
                          <td style="padding: 40px 50px; text-align: center;">
                            <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Trân trọng,</p>
                            <p style="margin: 0 0 25px; font-size: 16px; font-weight: 700; color: #013a74;">Đội ngũ JobZone</p>
                            
                            <!-- Social Media -->
                            <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 25px;">
                              <tr>
                                <td style="padding: 0 8px;">
                                  <a href="#" style="display: inline-block;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="24" height="24">
                                  </a>
                                </td>
                                <td style="padding: 0 8px;">
                                  <a href="#" style="display: inline-block;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="24" height="24">
                                  </a>
                                </td>
                                <td style="padding: 0 8px;">
                                  <a href="#" style="display: inline-block;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="LinkedIn" width="24" height="24">
                                  </a>
                                </td>
                                <td style="padding: 0 8px;">
                                  <a href="#" style="display: inline-block;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="Instagram" width="24" height="24">
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="margin: 0 0 5px; font-size: 12px; color: #6b7280;">Email này được gửi tự động, vui lòng không trả lời.</p>
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">Copyright © ${new Date().getFullYear()} JobZone. All rights reserved.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer Address -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                  <tr>
                    <td style="padding: 20px 0; text-align: center;">
                      <p style="margin: 0 0 5px; font-size: 12px; color: #9ca3af;">
                        JobZone, Inc. • Tầng 16, Tòa nhà Vietcombank, 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        <a href="#" style="color: #6b7280; text-decoration: none;">Chính sách bảo mật</a> • 
                        <a href="#" style="color: #6b7280; text-decoration: none;">Điều khoản sử dụng</a> • 
                        <a href="#" style="color: #6b7280; text-decoration: none;">Hủy đăng ký</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `
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

      // Collect all resume IDs for batch fetching
      const createdCvIds = [];
      const uploadedCvIds = [];
      
      jobApplications.forEach(app => {
        if (app.resume_type === 'created' && app.resume) {
          createdCvIds.push(app.resume);
        } else if (app.resume_type === 'uploaded' && app.resume) {
          uploadedCvIds.push(app.resume);
        }
      });
      
      // Batch fetch CV details
      const userCvs = createdCvIds.length > 0 ? 
        await UserCv.findAll({ where: { cv_id: { [Op.in]: createdCvIds } } }) : [];
      
      const candidateCvs = uploadedCvIds.length > 0 ? 
        await CandidateCv.findAll({ where: { cv_id: { [Op.in]: uploadedCvIds } } }) : [];

      // Kết hợp thông tin người dùng và ứng viên vào jobApplications
      const applicationsWithDetails = jobApplications.map((application) => {
        const user = users.find((u) => u.id === application.user_id);
        const candidate = candidates.find(
          (c) => c.user_id === application.user_id
        );
        
        // Get CV information based on resume_type
        let cvInfo = {};
        
        if (application.resume_type === 'created') {
          // For created CVs, find details from userCvs
          const userCv = userCvs.find(cv => cv.cv_id === application.resume);
          if (userCv) {
            cvInfo = {
              cv_id: application.resume,
              cv_type: 'created',
              cv_name: userCv.cv_name,
              created_at: userCv.created_at,
              updated_at: userCv.updated_at
            };
          } else {
            cvInfo = {
              cv_id: application.resume,
              cv_type: 'created',
              cv_name: 'CV không tìm thấy'
            };
          }
        } else if (application.resume_type === 'uploaded') {
          // For uploaded CVs, find details from candidateCvs
          const candidateCv = candidateCvs.find(cv => cv.cv_id === application.resume);
          if (candidateCv) {
            cvInfo = {
              cv_id: application.resume,
              cv_type: 'uploaded',
              cv_link: candidateCv.cv_link,
              cv_name: candidateCv.cv_name,
              created_at: candidateCv.created_at
            };
          } else if (application.resume && application.resume.startsWith('http')) {
            // Direct URL case
            cvInfo = {
              cv_link: application.resume,
              cv_type: 'uploaded',
              cv_name: 'CV tải lên'
            };
          }
        }
        
        return {
          ...application.get({ plain: true }),
          user: user || null, // Thêm thông tin người dùng vào kết quả
          candidate: candidate || null, // Thêm thông tin ứng viên vào kết quả
          cv_info: cvInfo
        };
      });

      return res.json({ jobApplications: applicationsWithDetails });
    } catch (error) {
      console.error("Error in getAllJobApplicationsByJobId:", error);
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
      const { job_application_id, status, user_id, recruiter_id, company_id, company_name } = req.body;
      const jobApplication = await JobApplication.findByPk(job_application_id);

      if (!jobApplication) {
        return res.status(404).json({
          message: "Không tìm thấy đơn ứng tuyển",
          code: -1
        });
      }

      // Lấy thông tin user, job và company
      const user = await User.findByPk(jobApplication.user_id);
      const job = await Job.findByPk(jobApplication.job_id);
      const company = await Company.findByPk(job.company_id);

      if (!user || !job || !company) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin người dùng, công việc hoặc công ty",
          code: -1
        });
      }

      jobApplication.status = status;
      await jobApplication.save();

      // Tạo thông báo cho ứng viên
      await NotificationController.createApplicationResponseNotification(
        jobApplication.user_id,
        jobApplication.recruiter_id,
        jobApplication.job_id,
        jobApplication.application_id,
        status,
        company_name
      );

      // Gửi email thông báo
      let emailContent = '';
      let statusColor = '';
      let statusIcon = '';

      switch (status) {
        case 'Đang xét duyệt':
          emailContent = `Đơn ứng tuyển của bạn tại ${company_name} đang được xem xét.`;
          statusColor = '#f59e0b';
          statusIcon = '⏳';
          break;
        case 'Chờ phỏng vấn':
          emailContent = `Chúc mừng! Bạn đã được ${company_name} chọn để phỏng vấn cho vị trí ${job.title}.`;
          statusColor = '#3b82f6';
          statusIcon = '🎯';
          break;
        case 'Đã phỏng vấn':
          emailContent = `Cảm ơn bạn đã tham gia phỏng vấn tại ${company_name} cho vị trí ${job.title}. Chúng tôi sẽ sớm phản hồi.`;
          statusColor = '#8b5cf6';
          statusIcon = '🤝';
          break;
        case 'Đạt phỏng vấn':
          emailContent = `Chúc mừng! Bạn đã vượt qua vòng phỏng vấn tại ${company_name} cho vị trí ${job.title}.`;
          statusColor = '#10b981';
          statusIcon = '✨';
          break;
        case 'Đã nhận':
          emailContent = `Chúc mừng! Bạn đã được ${company_name} nhận vào vị trí ${job.title}.`;
          statusColor = '#059669';
          statusIcon = '🎉';
          break;
        case 'Đã từ chối':
          emailContent = `Rất tiếc, đơn ứng tuyển của bạn tại ${company_name} cho vị trí ${job.title} đã bị từ chối.`;
          statusColor = '#ef4444';
          statusIcon = '❌';
          break;
        case 'Hết hạn':
          emailContent = `Đơn ứng tuyển của bạn tại ${company_name} cho vị trí ${job.title} đã hết hạn.`;
          statusColor = '#6b7280';
          statusIcon = '⏰';
          break;
        case 'Đã rút đơn':
          emailContent = `Bạn đã rút đơn ứng tuyển tại ${company_name} cho vị trí ${job.title} thành công.`;
          statusColor = '#6b7280';
          statusIcon = '↩️';
          break;
        default:
          emailContent = `Trạng thái đơn ứng tuyển của bạn tại ${company_name} cho vị trí ${job.title} đã được cập nhật thành: ${status}`;
          statusColor = '#6b7280';
          statusIcon = '📝';
      }

      const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f8fafc;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .company-logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            background-color: ${statusColor}15;
            color: ${statusColor};
            font-weight: bold;
            margin: 10px 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .job-details {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${company.logo ? `<img src="${company.logo}" alt="${company_name}" class="company-logo">` : ''}
          <h2>Thông báo về trạng thái ứng tuyển</h2>
        </div>
        
        <div class="content">
          <p>Chào ${user.name},</p>
          
          <div class="status-badge">
            ${statusIcon} ${status}
          </div>
          
          <p>${emailContent}</p>
          
          <div class="job-details">
            <h3>Thông tin công việc:</h3>
            <p><strong>Vị trí:</strong> ${job.title}</p>
            <p><strong>Công ty:</strong> ${company_name}</p>
            ${company.address ? `<p><strong>Địa chỉ:</strong> ${company.address}</p>` : ''}
            ${company.website ? `<p><strong>Website:</strong> <a href="${company.website}">${company.website}</a></p>` : ''}
          </div>

          <a href="${process.env.FE_URL}/job-detail/${job.job_id}" class="button">Xem chi tiết công việc</a>
        </div>

        <div class="footer">
          <p>Trân trọng,<br>JobZone Team</p>
          <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      </body>
      </html>
      `;

      await mailerService.sendMail(
        user.email,
        "Thông báo về trạng thái ứng tuyển",
        emailTemplate
      );

      return res.json({
        message: "Cập nhật trạng thái thành công",
        code: 1
      });
    } catch (error) {
      console.error("Error in editJobApplicationStatus:", error);
      return res.status(400).json({
        message: error.message,
        code: -1
      });
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
  // get candidate detail by user_id
  async getCandidateDetailByUserId(req, res) {
    try {
      const userId = req.params.user_id;
      const candidate = await Candidate.findOne({ where: { user_id: userId } });
      const user = await User.findByPk(userId);
      return res.json({ candidate: candidate, user: user });
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
  // check xem công ty đã kich hoạt hay chưa thông qua recruitercompany
  async checkRecruiterCompany(req, res) {
    try {
      const userId = req.user.id;
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { user_id: userId },
      });
      if (recruiterCompany) {
        return res.json({ recruiterCompany: recruiterCompany.status });
      } else {
        return res.json({ recruiterCompany: null });
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

  // Export job applications to Excel
  async exportJobApplications(req, res) {
    try {
      const jobId = req.params.job_id;
      
      // Get job details
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ 
          message: "Không tìm thấy công việc", 
          code: -1 
        });
      }
      
      // Get company details
      const company = await Company.findByPk(job.company_id);
      
      // Get job applications
      const jobApplications = await JobApplication.findAll({
        where: { job_id: jobId },
      });
      
      // If no applications, return an error
      if (jobApplications.length === 0) {
        return res.status(404).json({ 
          message: "Không có ứng viên nào cho công việc này", 
          code: -1 
        });
      }
      
      // Get user IDs from applications
      const userIds = jobApplications.map(application => application.user_id);
      
      // Get user details
      const users = await User.findAll({ 
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'name', 'email', 'phone', 'created_at']
      });
      
      // Get candidate details
      const candidates = await Candidate.findAll({
        where: { user_id: { [Op.in]: userIds } }
      });
      
      // Prepare data for export
      const exportData = jobApplications.map(application => {
        const user = users.find(u => u.id === application.user_id);
        const candidate = candidates.find(c => c.user_id === application.user_id);
        
        return {
          application_id: application.application_id,
          application_date: application.applied_at,
          status: application.status,
          name: user ? user.name : "N/A",
          email: user ? user.email : "N/A",
          phone: user ? user.phone : "N/A",
          location: candidate ? candidate.location : "N/A",
          experience: candidate ? candidate.experience : "N/A",
          education: candidate ? candidate.education : "N/A",
          expected_salary: candidate ? candidate.expected_salary : "N/A",
          cv_link: candidate ? candidate.CV_link : "N/A",
          about_me: candidate ? candidate.about_me : "N/A",
          skills: candidate ? candidate.skills : "N/A",
          career_objective: candidate ? candidate.career_objective : "N/A",
        };
      });
      
      // Create a new Excel workbook
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Ứng viên');
      
      // Add job and company information at the top
      worksheet.addRow(['Công việc:', job.title]);
      worksheet.addRow(['Công ty:', company ? company.company_name : 'N/A']);
      worksheet.addRow(['Ngày xuất:', new Date().toLocaleDateString('vi-VN')]);
      worksheet.addRow([]);  // Empty row for spacing
      
      // Define columns
      worksheet.columns = [
        { header: 'Mã ứng tuyển', key: 'application_id', width: 20 },
        { header: 'Ngày ứng tuyển', key: 'application_date', width: 15 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Họ và tên', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Số điện thoại', key: 'phone', width: 15 },
        { header: 'Địa điểm', key: 'location', width: 20 },
        { header: 'Kinh nghiệm', key: 'experience', width: 15 },
        { header: 'Học vấn', key: 'education', width: 15 },
        { header: 'Mức lương mong muốn', key: 'expected_salary', width: 15 },
        { header: 'Link CV', key: 'cv_link', width: 40 },
        { header: 'Về bản thân', key: 'about_me', width: 40 },
        { header: 'Kỹ năng', key: 'skills', width: 30 },
        { header: 'Mục tiêu nghề nghiệp', key: 'career_objective', width: 40 },
      ];
      
      // Add headers with styling
      const headerRow = worksheet.addRow(worksheet.columns.map(col => col.header));
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4167B8' }
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFF' }
        };
      });
      
      // Add data rows
      exportData.forEach(data => {
        const row = worksheet.addRow({
          application_id: data.application_id,
          application_date: new Date(data.application_date).toLocaleDateString('vi-VN'),
          status: data.status,
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          experience: data.experience,
          education: data.education,
          expected_salary: data.expected_salary,
          cv_link: data.cv_link,
          about_me: data.about_me,
          skills: data.skills,
          career_objective: data.career_objective,
        });
      });
      
      // Auto-filter for the header row
      worksheet.autoFilter = {
        from: { row: 5, column: 1 },
        to: { row: 5, column: worksheet.columns.length }
      };
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="job_applications_${jobId}.xlsx"`);
      
      // Write to response
      await workbook.xlsx.write(res);
      
      // End the response
      res.end();
      
    } catch (error) {
      console.error('Error exporting job applications:', error);
      return res.status(500).json({
        message: 'Lỗi khi xuất danh sách ứng viên',
        code: -1,
        error: error.message
      });
    }
  }

  async findSimilarCandidates(req, res) {
    try {
      const { idealCandidate, searchCriteria, model = "gpt-4o-mini" } = req.body;
      
      // Xác thực request
      if (!idealCandidate) {
        return res.status(400).json({
          message: "Thiếu thông tin ứng viên mẫu",
          code: -1
        });
      }

      // Lấy danh sách ứng viên
      const candidates = await Candidate.findAll({
        where: {
          is_searchable: true  // Chỉ tìm ứng viên cho phép tìm kiếm
        },
        limit: 30  // Giới hạn số lượng ứng viên để phân tích
      });

      if (candidates.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy ứng viên nào",
          code: -1
        });
      }

      // Lấy danh sách user_ids từ các ứng viên
      const userIds = candidates.map(candidate => candidate.user_id);
      
      // Lấy thông tin người dùng riêng biệt thay vì dùng include
      const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'name', 'email']
      });

      // Chuẩn bị dữ liệu ứng viên
      const candidatesList = candidates.map(candidate => {
        const user = users.find(u => u.id === candidate.user_id);
        return {
          candidate_id: candidate.candidate_id,
          user_id: candidate.user_id,
          name: user ? user.name : "Unknown",
          experience: candidate.experience,
          skills: candidate.skills,
          current_job_title: candidate.current_job_title,
          current_company: candidate.current_company,
          education: candidate.qualifications,
          expected_salary: candidate.expected_salary,
          location: candidate.location,
          industry: candidate.industry,
        };
      });

      // Gọi API OpenAI để phân tích
      const response = await fetch(`${process.env.BASE_URL}/openai/find-similar-candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${req.headers.authorization.split(' ')[1]}`
        },
        body: JSON.stringify({
          idealCandidate,
          candidatesList,
          searchCriteria,
          model
        })
      });

      const data = await response.json();

      // Nếu có kết quả từ OpenAI
      if (data && data.similar_candidates) {
        // Nếu muốn bổ sung thêm thông tin chi tiết cho từng ứng viên phù hợp
        const enhancedResults = await Promise.all(
          data.similar_candidates.map(async (result) => {
            const candidateDetail = candidates.find(c => c.candidate_id === result.candidate_id);
            const userDetail = users.find(u => candidateDetail && u.id === candidateDetail.user_id);
            
            // Nếu cần thêm các thông tin khác cho ứng viên
            if (candidateDetail) {
              return {
                ...result,
                additional_info: {
                  email: userDetail ? userDetail.email : null,
                  phone: candidateDetail.phone || null,
                  profile_picture: candidateDetail.profile_picture || null,
                  about_me: candidateDetail.about_me || null,
                }
              };
            }
            
            return result;
          })
        );

        return res.status(200).json({
          message: "Tìm ứng viên tương tự thành công",
          code: 1,
          similar_candidates: enhancedResults,
          analysis: data.analysis
        });
      }

      return res.status(500).json({
        message: "Không nhận được kết quả phân tích từ AI",
        code: -1
      });

    } catch (error) {
      console.error('Error in findSimilarCandidates:', error);
      return res.status(500).json({
        message: "Đã có lỗi xảy ra khi tìm ứng viên tương tự",
        error: error.message,
        code: -1
      });
    }
  }

  // Lấy thống kê CV ứng tuyển mới
  async getNewJobApplicationsStats(req, res) {
    try {
      const { company_id, since } = req.query;
      
      // Xác định company_id từ user hiện tại nếu không được truyền vào
      let companyId = company_id;
      if (!companyId) {
        const recruiterCompany = await RecruiterCompanies.findOne({
          where: { user_id: req.user.id }
        });
        
        if (!recruiterCompany) {
          return res.status(404).json({
            message: "Không tìm thấy thông tin công ty của nhà tuyển dụng",
            code: -1
          });
        }
        
        companyId = recruiterCompany.company_id;
      }
      
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
      
      // Lấy tất cả job_id của công ty
      const companyJobs = await Job.findAll({
        attributes: ['job_id', 'title'],
        where: { company_id: companyId },
        raw: true
      });
      
      const jobIds = companyJobs.map(job => job.job_id);
      
      if (jobIds.length === 0) {
        return res.json({
          newApplications: 0,
          byStatus: [],
          byJob: [],
          recentApplications: []
        });
      }
      
      // Định nghĩa điều kiện tìm kiếm
      const whereClause = {
        applied_at: {
          [Op.gte]: startDate
        },
        job_id: {
          [Op.in]: jobIds
        }
      };
      
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
      
      // Thống kê theo công việc
      const applicationsByJob = await JobApplication.findAll({
        attributes: [
          'job_id',
          [sequelize.fn('COUNT', sequelize.col('application_id')), 'count']
        ],
        where: whereClause,
        group: ['job_id']
      });
      
      // Lấy 10 đơn ứng tuyển gần nhất
      const recentApplications = await JobApplication.findAll({
        where: whereClause,
        order: [['applied_at', 'DESC']],
        limit: 10,
        include: [
          {
            model: User,
            attributes: ['name', 'email'],
            required: true
          }
        ]
      });
      
      // Map dữ liệu để trả về
      const formattedByStatus = applicationsByStatus.map(status => ({
        status: status.status,
        count: parseInt(status.get('count'))
      }));
      
      // Map dữ liệu theo công việc
      const formattedByJob = applicationsByJob.map(item => {
        const job = companyJobs.find(j => j.job_id === item.job_id);
        return {
          job_id: item.job_id,
          job_title: job ? job.title : 'Unknown Job',
          count: parseInt(item.get('count'))
        };
      });
      
      // Chuẩn bị dữ liệu đơn ứng tuyển gần đây
      const formattedRecentApplications = recentApplications.map(app => {
        const job = companyJobs.find(j => j.job_id === app.job_id);
        return {
          application_id: app.application_id,
          job_id: app.job_id,
          job_title: job ? job.title : 'Unknown Job',
          user_name: app.User ? app.User.name : 'Unknown User',
          user_email: app.User ? app.User.email : '',
          status: app.status,
          applied_at: app.applied_at
        };
      });
      
      return res.json({
        newApplications: totalNewApplications,
        byStatus: formattedByStatus,
        byJob: formattedByJob,
        recentApplications: formattedRecentApplications,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error("Error in getNewJobApplicationsStats:", error);
      return res.status(500).json({
        message: "Lỗi khi lấy thống kê CV ứng tuyển mới",
        error: error.message,
        code: -1
      });
    }
  }
  // get all user cv by cv_id
  async getAllUserCvByCvId(req, res) {
    try {
      const userCv = await UserCv.findOne({ where: { cv_id: req.params.cv_id } });
      return res.json({ userCv });
    } catch (error) {
      return res.status(500).send({
        message: error.message, 
        code: -1,
      });
    }
  }
  // check xem ở trong bảng recruiter_companies có user_id này chưa nếu chưa thì tạo mới company và recruiter_companies
  async createRecruiterCompany(req, res) {
    try {
      const recruiterCompany = await RecruiterCompanies.findOne({ where: { user_id: req.user.id } });
      if (!recruiterCompany) {
        const company = await Company.create({
          company_id: this.generateCompanyId(),
          company_name: req.body.name,
          address: req.body.address,
          website: req.body.website,
          description: req.body.description,
          logo: req.body.logo,
          banner: req.body.banner,
          plan: 'Basic',
          plan_expired_at: null,
          size: req.body.size,
          company_emp: req.body.company_emp,
          version: 1,
          last_modified_by: req.user.id,
          created_at: new Date(),
        });
        const recruiterCompany = await RecruiterCompanies.create({
          recruiter_id: this.generateRecruiterId(),
          user_id: req.user.id,
          company_id: company.company_id,
          status: 'pending',
        });

      }
      
      return res.status(200).json({
        message: "Có thông tin công ty",
        code: 1,
        recruiterCompany,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }

  // get all candidate cv by cv_id
  async getAllCandidateCvByCvId(req, res) {
    try {
      const candidateCv = await CandidateCv.findOne({
        where: { cv_id: req.params.cv_id },
      });
      return res.json({ candidateCv });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }

  // Lấy đánh giá công ty theo company_id
  async getCompanyReviewsByCompanyId(req, res) {
    try {
      const { company_id } = req.params;
      const { rating } = req.query;
      
      // Kiểm tra xem nhà tuyển dụng có quyền xem đánh giá của công ty này không
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { 
          user_id: req.user.id,
          company_id: company_id
        }
      });
      
      if (!recruiterCompany) {
        return res.status(403).json({
          message: "Bạn không có quyền xem đánh giá của công ty này",
          code: -1
        });
      }
      
      // Xây dựng điều kiện tìm kiếm
      const whereClause = { company_id };
      
      // Thêm điều kiện lọc theo số sao nếu có
      if (rating) {
        whereClause.rating = parseInt(rating);
      }
      
      // Lấy tất cả đánh giá của công ty
      const Reviews = require('../models/Reviews');
      const User = require('../models/User');
      
      const reviews = await Reviews.findAll({
        where: whereClause,
        order: [["review_date", "DESC"]],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'] // Chỉ lấy một số thông tin cần thiết
        }]
      });
      
      // Tính toán số lượng đánh giá theo mỗi mức sao
      const ratingCounts = await Reviews.findAll({
        attributes: [
          'rating',
          [sequelize.fn('COUNT', sequelize.col('review_id')), 'count']
        ],
        where: { company_id },
        group: ['rating'],
        raw: true
      });
      
      // Tính trung bình số sao
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
        : 0;
      
      // Format kết quả đếm theo mức sao
      const ratingDistribution = [1, 2, 3, 4, 5].map(star => {
        const found = ratingCounts.find(r => r.rating === star);
        return {
          rating: star,
          count: found ? parseInt(found.count) : 0
        };
      });
      
      return res.json({
        reviews,
        totalReviews,
        avgRating,
        ratingDistribution
      });
      
    } catch (error) {
      console.error('Error getting company reviews:', error);
      return res.status(500).json({
        message: "Lỗi khi lấy đánh giá công ty",
        error: error.message,
        code: -1
      });
    }
  }
}

module.exports = new RecruiterController();
