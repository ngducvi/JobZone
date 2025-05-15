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
const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
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
const { v4: uuid } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const fs = require("fs");
const RecruiterCompanies = require("../models/RecruiterConpanies");
const Reviews = require("../models/Reviews");
const fileService = require('../services/FileService');
const NotificationController = require("./NotificationController");
const { getIO, notifyNewJobApplication } = require("../config/socket");
const sequelize = require("../config/database");

class UserController {
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
  }
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      // get profile picture by user_id
      const candidate = await Candidate.findOne({
        where: { user_id: user.id },
      });

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
        candidate,
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
        "Xác Minh Tài Khoản JobZone",
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác Minh Tài Khoản JobZone</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f5f7fa; color: #333333;">
          <!-- Preheader text (hidden) -->
          <div style="display: none; max-height: 0px; overflow: hidden;">
            Xác minh tài khoản JobZone của bạn để bắt đầu hành trình tìm kiếm việc làm mới.
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
                            <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #013a74; text-align: center; letter-spacing: -0.5px;">Xác Minh Email của Bạn</h1>
                            
                            <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                              Xin chào <span style="font-weight: 600; color: #013a74;">${user.name
        }</span>,
                            </p>
                            
                            <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                              Cảm ơn bạn đã đăng ký tài khoản tại <span style="font-weight: 600; color: #013a74;">JobZone</span>. Chúng tôi rất vui mừng được đồng hành cùng bạn trong hành trình tìm kiếm cơ hội nghề nghiệp mới.
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
                        Tại sao chọn JobZone?
                      </h3>
                      
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="33%" style="padding: 0 10px; vertical-align: top; text-align: center;">
                            <img src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png" alt="Việc làm chất lượng" width="40" height="40" style="margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4b5563;">Việc làm chất lượng</p>
                          </td>
                          <td width="33%" style="padding: 0 10px; vertical-align: top; text-align: center;">
                            <img src="https://cdn-icons-png.flaticon.com/512/1584/1584892.png" alt="Hồ sơ nổi bật" width="40" height="40" style="margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4b5563;">Hồ sơ nổi bật</p>
                          </td>
                          <td width="33%" style="padding: 0 10px; vertical-align: top; text-align: center;">
                            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Kết nối nhà tuyển dụng" width="40" height="40" style="margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4b5563;">Kết nối nhà tuyển dụng</p>
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
  // check xem đã có candidate chưa nếu chưa thì tạo mới
  async checkCandidate(req, res) {
    try {
      const candidate = await Candidate.findOne({
        where: { user_id: req.user.id },
      });
      if (!candidate) {
        const newCandidate = new Candidate({
          candidate_id: this.generateCandidateId(),
          user_id: req.user.id,
        });
        await newCandidate.save();
      }
      return res.status(200).send({ message: "Candidate đã tồn tại", code: 1 });
    } catch (error) {
      return res.status(400).send({
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

  // get categories by parent_id
  async getCategoriesByParentId(req, res) {
    try {
      const { parent_id } = req.params;
      console.log("getCategoriesByParentId called with parent_id:", parent_id);
      
      let whereClause = {};
      
      if (parent_id === 'root') {
        // If root is requested, get level 1 categories (without parent)
        whereClause = { 
          level: 1,
          parent_category_id: null 
        };
      } else {
        // Otherwise get categories with the specified parent_id
        whereClause = { parent_category_id: parent_id };
      }
      
      const categories = await Category.findAll({
        where: whereClause,
        order: [['category_name', 'ASC']]
      });
      
      return res.status(200).send({
        message: "Categories retrieved successfully",
        code: 1,
        categories
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1
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
        order: [["created_at", "DESC"]],
      });
      return res.json({ candidateCv });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // tạo cv mới 
  async createNewCV(req, res) {
    try {
      const { template_id, name, fieldValues } = req.body;
      const user_id = req.user.id;

      // 1. Tạo CV mới trong bảng user_cvs
      const newCV = await UserCv.create({
        cv_id: this.generateUserCvId(),
        user_id,
        template_id,
        cv_name: name,
        cv_content: {},
        cv_html: '',
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        is_template: false
      });

      // 2. Lấy tất cả template fields của template đã chọn
      const templateFields = await TemplateFields.findAll({
        where: { template_id },
        order: [['field_order', 'ASC']]
      });

      // 3. Tạo các cv_field_values với giá trị từ fieldValues
      const fieldValuePromises = templateFields.map(field => {
        // Tìm giá trị tương ứng trong fieldValues
        const fieldValue = fieldValues.find(fv => fv.field_id === field.field_id);

        return CvFieldValues.create({
          value_id: this.generateValueId(),
          cv_id: newCV.cv_id,
          field_id: field.field_id,
          field_value: fieldValue ? fieldValue.field_value : field.field_placeholder || ''
        });
      });

      await Promise.all(fieldValuePromises);

      // 4. Lấy template để trả về
      const template = await CvTemplates.findByPk(template_id);

      return res.status(201).json({
        message: 'Tạo CV mới thành công',
        code: 1,
        data: {
          cv: newCV,
          template: template,
          fields: templateFields
        }
      });

    } catch (error) {
      console.error('Error creating new CV:', error);
      return res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }
  // update cv




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
        Job.findAll({ where: { deadline: { [Op.gte]: new Date() } } }),
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
      return res.json({
        job,
        companyId,
        companyName,
        companyLogo,
        companySize,
        companyIndustry,
        companyAddress,
      });
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
      const jobs = await Job.findAll({
        where: { company_id: req.params.company_id },
      });
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
      // get RecruiterCompanies by company_id
      const recruiterCompanies = await RecruiterCompanies.findAll({
        where: { company_id: req.params.company_id },
      });
      return res.json({ company, recruiterCompanies });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // getRecruiterCompanyByUserId
  async getRecruiterCompanyByUserId(req, res) {
    try { 
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { user_id: req.query.user_id },
      });
      
      if (!recruiterCompany) {
        return res.status(404).json({
          message: 'Recruiter company not found',
          code: -1,
        });
      }

      const company = await Company.findByPk(recruiterCompany.company_id);
      if (!company) {
        return res.status(404).json({
          message: 'Company not found',
          code: -1,
        });
      }

      return res.json({ company, recruiterCompany });
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
    const appliedJobsWithCompanies = appliedJobsWithDetails.map(
      (appliedJob) => {
        const company = companies.find(
          (c) => c.company_id === appliedJob.job.company_id
        );
        return {
          ...appliedJob,
          company_name: company.company_name,
          company_logo: company.logo,
        };
      }
    );

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
    try {
      const { page = 1, limit = 9 } = req.query;
      const offset = (page - 1) * limit;
      const topCompany = await Company.findAndCountAll({
        limit,
        offset,
      });
      // lấy danh sách company_id
      const companyIds = topCompany.rows.map((company) => company.company_id);

      // Get reviews for each company
      const companyReviews = {};
      for (const companyId of companyIds) {
        const reviews = await Reviews.findAll({
          where: { company_id: companyId },
          raw: true,
        });
        companyReviews[companyId] = reviews;
      }

      // Map companies with their reviews
      const companiesWithReviews = topCompany.rows.map((company) => ({
        ...company.toJSON(),
        reviews: companyReviews[company.company_id] || [],
      }));

      return res.json({
        topCompany: companiesWithReviews,
        totalPages: Math.ceil(topCompany.count / limit),
      });
    } catch (error) {
      console.error("Error in getAllTopCompany:", error);
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // tạo đánh giá công ty
  async createReviewCompany(req, res) {
    try {
      const { company_id, rating, comment, user_name, candidate_id } = req.body;

      // Tạo review trước
      const review = await Reviews.create({
        review_id: this.generateReviewId(),
        company_id,
        user_id: candidate_id, // Sử dụng candidate_id làm user_id
        rating,
        comment,
        review_date: new Date(),
        created_by: candidate_id,
      });

      // Lấy thông tin recruiter từ company_id
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { company_id: company_id }
      });

      if (!recruiterCompany) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin công ty",
          code: -1
        });
      }

      // Tạo thông báo cho công ty
      await NotificationController.createCompanyReviewNotification(
        recruiterCompany.user_id, // ID của recruiter
        candidate_id, // ID của người đánh giá
        user_name, // Tên người đánh giá
        rating // Đánh giá
      );

      return res.json({
        message: "Đánh giá công ty thành công",
        code: 1,
        review
      });
    } catch (error) {
      console.error("Error in createReviewCompany:", error);
      return res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }
  // Chỉnh sửa đánh giá công ty
  async updateReviewCompany(req, res) {
    try {
      const { rating, comment } = req.body;
      const { review_id } = req.params;

      const review = await Reviews.findByPk(review_id);
      if (!review) {
        return res.status(404).send({ message: "Đánh giá không tồn tại", code: -1 });
      }

      review.rating = rating;
      review.comment = comment;
      await review.save();

      return res.json({ review });
    } catch (error) {
      return res.status(500).send({ message: error.message, code: -1 });
    }
  }
  // xóa đánh giá công ty
  async deleteReviewCompany(req, res) {
    try {
      const { review_id } = req.params;

      const review = await Reviews.findByPk(review_id);
      if (!review) {
        return res.status(404).send({ message: "Đánh giá không tồn tại", code: -1 });
      }

      await review.destroy();
      return res.json({ message: "Đánh giá công ty đã được xóa" });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).send({ message: error.message, code: -1 });
    }
  }
  // create candidate cv with cv_id
  async createCandidateCvWithCvId(req, res) {
    try {
      const { user_id, cv_name } = req.body;
      const userId = user_id || req.user.id;

      if (!req.file) {
        return res.status(400).send({ message: "No file uploaded", code: -1 });
      }

      // Upload PDF to Cloudinary
      const uploadResult = await fileService.uploadPDF(req.file.buffer);

      const candidateCv = await CandidateCv.create({
        cv_id: this.generateCandidateCvId(),
        user_id: userId,
        cv_name: cv_name || req.file.originalname || 'Uploaded CV',
        cv_link: uploadResult.secure_url,
        created_at: new Date(),
      });

      return res.status(200).send({
        message: "Tạo hồ sơ ứng viên thành công",
        code: 1,
        candidateCv,
      });
    } catch (error) {
      console.error('Error creating candidate CV:', error);
      return res.status(500).send({ message: error.message, code: -1 });
    }
  }
  // get all reviews by company_id
  async getAllReviewsByCompanyId(req, res) {
    try {
      const { company_id } = req.params;
      const { rating } = req.query;
      
      // Build where clause
      const whereClause = { company_id };
      
      // Add rating filter if provided
      if (rating) {
        whereClause.rating = parseInt(rating);
      }
      
    const reviews = await Reviews.findAll({
        where: whereClause,
      order: [["review_date", "DESC"]],
    });
      
    return res.json({ reviews });
    } catch (error) {
      console.error('Error getting reviews by company ID:', error);
      return res.status(500).json({ message: 'Lỗi khi lấy đánh giá', error: error.message });
    }
  }

  // get all jobs với lọc deadline  
  async getAllJobs(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const jobs = await Job.findAndCountAll({
      limit,
      offset,
      where: {
        deadline: {
          [Op.gte]: new Date()
        }
      }
    });
    // lấy danh sách company_id từ jobs
    const companyIds = jobs.rows.map((job) => job.company_id);
    // dựa vào company_id để lấy company_name, logo, size, industry, address
    const companies = await Company.findAll({
      where: { company_id: companyIds },
    });
    // lấy thông tin company_name, company_id ,logo, size, industry, address từ companies
    const companiesWithDetails = companies.map((company) => {
      return {
        company_name: company.company_name,
        company_id: company.company_id,
        logo: company.logo,
        size: company.size,
        industry: company.industry,
        address: company.address,
      };
    });
    // nếu có company_id trong jobs thì thêm company_name, logo, size, industry, address vào jobs
    const jobsWithCompanies = jobs.rows.map((job) => {
      const company = companiesWithDetails.find(
        (c) => c.company_id === job.company_id
      );
      return {
        ...job.toJSON(),
        company_name: company.company_name,
        company_logo: company.logo,
        company_size: company.size,
        company_industry: company.industry,
        company_address: company.address,
      };
    });
    return res.json({
      jobs: jobsWithCompanies,
      totalPages: Math.ceil(jobs.count / limit),
    });
  }
  // get job có experience không yêu cầu
  async getJobsByExperience(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const jobs = await Job.findAndCountAll({
      where: { experience: 'Không yêu cầu', deadline: { [Op.gte]: new Date() } },
      limit,
      offset,
    });

    // Get company IDs from jobs
    const companyIds = jobs.rows.map(job => job.company_id);

    // Get company details
    const companies = await Company.findAll({
      where: { company_id: companyIds }
    });

    // Add company details to jobs
    const jobsWithCompanies = jobs.rows.map(job => {
      const company = companies.find(c => c.company_id === job.company_id);
      return {
        ...job.toJSON(),
        company_name: company.company_name,
        company_logo: company.logo
      };
    });

    return res.json({
      jobs: {
        rows: jobsWithCompanies,
        count: jobs.count
      }
    });
  }

  async getJobsByWorkingTime(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const jobs = await Job.findAndCountAll({
      where: { working_time: 'Bán thời gian', deadline: { [Op.gte]: new Date() } },
      limit,
      offset,
    });

    // Get company IDs from jobs
    const companyIds = jobs.rows.map(job => job.company_id);

    // Get company details
    const companies = await Company.findAll({
      where: { company_id: companyIds }
    });

    // Add company details to jobs
    const jobsWithCompanies = jobs.rows.map(job => {
      const company = companies.find(c => c.company_id === job.company_id);
      return {
        ...job.toJSON(),
        company_name: company.company_name,
        company_logo: company.logo
      };
    });

    return res.json({
      jobs: {
        rows: jobsWithCompanies,
        count: jobs.count
      }
    });
  }

  async getJobsBySalary(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const jobs = await Job.findAndCountAll({
      where: { salary: { [Op.or]: ['Trên 50 triệu', '30 - 50 triệu', '25 - 30 triệu', '20 - 25 triệu'] }, deadline: { [Op.gte]: new Date() } },
      limit,
      offset,
    });

    // Get company IDs from jobs
    const companyIds = jobs.rows.map(job => job.company_id);

    // Get company details
    const companies = await Company.findAll({
      where: { company_id: companyIds }
    });

    // Add company details to jobs
    const jobsWithCompanies = jobs.rows.map(job => {
      const company = companies.find(c => c.company_id === job.company_id);
      return {
        ...job.toJSON(),
        company_name: company.company_name,
        company_logo: company.logo
      };
    });

    return res.json({
      jobs: {
        rows: jobsWithCompanies,
        count: jobs.count
      }
    });
  }


  async getJobsByWorkingLocationRemote(req, res) {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const jobs = await Job.findAndCountAll({
      where: { working_location: 'Remote', deadline: { [Op.gte]: new Date() } },
      limit,
      offset,
    });

    // Get company IDs from jobs
    const companyIds = jobs.rows.map(job => job.company_id);

    // Get company details
    const companies = await Company.findAll({
      where: { company_id: companyIds }
    });

    // Add company details to jobs
    const jobsWithCompanies = jobs.rows.map(job => {
      const company = companies.find(c => c.company_id === job.company_id);
      return {
        ...job.toJSON(),
        company_name: company.company_name,
        company_logo: company.logo
      };
    });

    return res.json({
      jobs: {
        rows: jobsWithCompanies,
        count: jobs.count
      }
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
        activities: req.body.activities,
      });

      return res.status(200).send({
        message: "Tạo thông tin học vấn thành công",
        code: 1,
        candidateEducation,
      });
    } catch (error) {
      console.error("Error creating education:", error);
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // edit profile_picture with candidate_id
  async editProfilePictureWithCandidateId(req, res) {
    try {
      const candidate = await Candidate.findByPk(req.params.candidate_id);

      if (!req.file) {
        return res.status(400).send({
          message: "Không có file nào được tải lên",
          code: -1,
        });
      }

      try {
        // Upload vào folder "profile_pictures" trong cloudinary
        const result = await cloudinary.uploader.upload(req.file.path || `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
          resource_type: "image",
          folder: "profile_pictures", // Chỉ định folder để lưu trữ
          public_id: `user_${req.params.candidate_id}_${Date.now()}`, // Tạo tên file duy nhất
          overwrite: true, // Ghi đè nếu file đã tồn tại
        });

        if (!result.secure_url) {
          return res.status(500).send({
            message: "Failed to upload image to cloudinary",
            code: -1,
          });
        }

        await candidate.update({ profile_picture: result.secure_url });

        return res.status(200).send({
          message: "Cập nhật ảnh đại diện thành công",
          code: 1,
          profile_picture: result.secure_url,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Lỗi khi upload ảnh: " + error.message,
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
  // update company logo with company_id
  // async updateCompanyLogoWithCompanyId(req, res) {
  //   try {
  //     const company = await Company.findByPk(req.params.company_id);
  //     if (!company) {
  //       return res.status(404).send({
  //         message: "Không tìm thấy công ty",
  //         code: -1,
  //       });
  //     }
  //     let filename = req.file.filename;
  //     filename = filename.split(".");
  //     filename = filename[0] + uuid() + "." + filename[1];
  //     try {
  //       const result = await cloudinary.uploader.upload(req.file.path, {
  //         resource_type: "image",
  //         folder: "company_logos",
  //         public_id: `company_${req.params.company_id}_${Date.now()}`,
  //       });
  //       await company.update({ logo: result.secure_url });
  //       return res.status(200).send({
  //         message: "Cập nhật logo công ty thành công",
  //         code: 1,
  //         company,
  //       });
  //     } catch (error) {
  //       return res.status(500).send({
  //         message: error.message,
  //         code: -1,
  //       });
  //     }
  //   } catch (error) {
  //     return res.status(500).send({
  //       message: error.message,
  //       code: -1,
  //     });
  //   }
  // }
  // update profile picture by candidate_id cloudinary
  async updateProfilePictureByCandidateIdCloudinary(req, res) {
    try {
      const candidate_id = req.params.candidate_id;

      // Get current profile picture public_id from database
      const currentUser = await Candidate.findOne({
        where: { candidate_id: candidate_id },
      });

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // If there's an existing profile picture, delete it from Cloudinary
      if (currentUser.profile_picture) {
        try {
          // Extract public_id from the URL
          const urlParts = currentUser.profile_picture.split("/");
          const filenameWithExt = urlParts[urlParts.length - 1];
          const public_id = `profile_pictures/${filenameWithExt.split(".")[0]}`;

          // Delete the old image from Cloudinary
          await cloudinary.uploader.destroy(public_id);
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pictures",
        public_id: `user_${candidate_id}_${Date.now()}`,
      });

      // Update database with new image URL
      await Candidate.update(
        { profile_picture: result.secure_url },
        { where: { candidate_id: candidate_id } }
      );

      // Delete temporary file
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        data: { profile_picture: result.secure_url },
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating profile picture",
        error: error.message,
      });
    }
  }


  // get profile picture by candidate_id
  async getProfilePictureByCandidateId(req, res) {
    try {
      const candidate = await Candidate.findByPk(req.params.candidate_id);

      return res.status(200).send({
        message: "Thông tin chi tiết hồ sơ ứng viên",
        code: 1,
        candidate,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // create candidate experience with candidate_id
  async createCandidateExperienceWithCandidateId(req, res) {
    try {
      console.log("Sending data:", req.body); // Log data trước khi gửi
      const candidateExperience = await CandidateExperiences.create({
        id: this.generateExperienceId(),
        candidate_id: req.params.candidate_id,
        company_name: req.body.company_name,
        job_title: req.body.job_title,
        job_description: req.body.job_description,
        achievements: req.body.achievements,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        position: req.body.position, // Thêm position
      });
      return res.status(200).send({
        message: "Tạo thông tin kinh nghiệm thành công",
        code: 1,
        candidateExperience,
      });
    } catch (error) {
      console.error("Error details:", error); // Log chi tiết lỗi
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
        credential_url: req.body.credential_url,
      });
      return res.status(200).send({
        message: "Tạo thông tin chứng chỉ thành công",
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
        project_url: req.body.project_url,
      });
      return res.status(200).send({
        message: "Tạo thông tin dự án thành công",
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
  // post job với job_id với company_id và category_id
  async postJobWithJobId(req, res) {
    try {
      const job = await Job.create({
        job_id: this.generateJobId(),
        ...req.body,
        company_id: req.body.company_id,
        category_id: req.body.category_id,
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
        proficiency: req.body.proficiency,
      });
      return res.status(200).send({
        message: "Tạo thông tin ngôn ngữ thành công",
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
  // edit candidate education
  async editCandidateEducation(req, res) {
    try {
      const education_id = req.params.id; // Lấy id từ params
      const updateData = req.body;

      const candidateEducation = await CandidateEducation.findByPk(
        education_id
      );

      if (!candidateEducation) {
        return res.status(404).send({
          message: "Không tìm thấy thông tin học vấn",
          code: -1,
        });
      }

      await candidateEducation.update(updateData);

      return res.status(200).send({
        message: "Cập nhật thông tin học vấn thành công",
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
        candidateProjects,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // edit candidate certifications
  async editCandidateCertifications(req, res) {
    try {
      const certifications_id = req.params.id;
      const updateData = req.body;
      const candidateCertifications = await CandidateCertifications.findByPk(
        certifications_id
      );
      await candidateCertifications.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin chứng chỉ thành công",
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
        candidate,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }

  // edit candidate languages
  async editCandidateLanguages(req, res) {
    try {
      const languages_id = req.params.id;
      const updateData = req.body;
      const candidateLanguages = await CandidateLanguages.findByPk(
        languages_id
      );
      await candidateLanguages.update(updateData);
      return res.status(200).send({
        message: "Cập nhật thông tin ngôn ngữ thành công",
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
  // edit candidate experience
  async editCandidateExperience(req, res) {
    try {
      const experience_id = req.params.id;
      const updateData = req.body;
      const candidateExperience = await CandidateExperiences.findByPk(
        experience_id
      );
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
        candidate,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // delete candidate languages by id
  async deleteCandidateLanguagesById(req, res) {
    try {
      const languages_id = req.params.id;
      const candidateLanguages = await CandidateLanguages.findByPk(
        languages_id
      );
      await candidateLanguages.destroy();
      return res.status(200).send({
        message: "Xóa thông tin ngôn ngữ thành công",
        code: 1,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
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
        code: 1,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // delete candidate certifications by id
  async deleteCandidateCertificationsById(req, res) {
    try {
      const certifications_id = req.params.id;
      const candidateCertifications = await CandidateCertifications.findByPk(
        certifications_id
      );
      await candidateCertifications.destroy();
      return res.status(200).send({
        message: "Xóa thông tin chứng chỉ thành công",
        code: 1,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // delete candidate experience by id
  async deleteCandidateExperienceById(req, res) {
    try {
      const experience_id = req.params.id;
      const candidateExperience = await CandidateExperiences.findByPk(
        experience_id
      );
      await candidateExperience.destroy();
      return res.status(200).send({
        message: "Xóa thông tin kinh nghiệm thành công",
        code: 1,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  // delete candidate education by id
  async deleteCandidateEducationById(req, res) {
    try {
      const education_id = req.params.id;
      const candidateEducation = await CandidateEducation.findByPk(
        education_id
      );
      await candidateEducation.destroy();
      return res.status(200).send({
        message: "Xóa thông tin học vấn thành công",
        code: 1,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
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
        education,
      } = req.query;

      let whereClause = {
        // Only show jobs that haven't expired
        deadline: {
          [Op.gte]: new Date()
        }
      };

      // Filter by category
      if (category_id && category_id !== "all") {
        // Kiểm tra xem category_id thuộc cấp nào
        const selectedCategory = await Category.findByPk(category_id);
        if (selectedCategory && selectedCategory.level === 2) {
          // Nếu là danh mục cấp 2, tìm tất cả danh mục con cấp 3
          const childCategories = await Category.findAll({
            where: { parent_category_id: category_id }
          });
          
          // Lấy tất cả ID của danh mục cấp 3 con
          const childCategoryIds = childCategories.map(cat => cat.category_id);
          
          // Thêm cả danh mục cấp 2 và các danh mục con cấp 3 vào điều kiện lọc
          whereClause.category_id = {
            [Op.or]: [category_id, ...childCategoryIds]
          };
        } else {
          // Nếu không phải danh mục cấp 2 (hoặc không tìm thấy), lọc theo chính danh mục đó
        whereClause.category_id = category_id;
        }
      }

      // Filter by experience
      if (experience && experience !== "all") {
        whereClause.experience = experience;
      }

      // Filter by working time
      if (working_time && working_time !== "all") {
        whereClause.working_time = working_time;
      }

      // Filter by working location
      if (working_location && working_location !== "all") {
        whereClause.working_location = working_location;
      }

      // Filter by location
      if (location) {
        whereClause.location = {
          [Op.like]: `%${location}%`,
        };
      }

      // Filter by rank
      if (rank && rank !== "all") {
        whereClause.rank = rank;
      }

      // Filter by education
      if (education && education !== "all") {
        whereClause.education = education;
      }

      // Filter by date posted
      if (datePosted && datePosted !== "all") {
        const now = new Date();
        switch (datePosted) {
          case "last_hour":
            whereClause.created_at = {
              [Op.gte]: new Date(now - 60 * 60 * 1000),
            };
            break;
          case "last_24h":
            whereClause.created_at = {
              [Op.gte]: new Date(now - 24 * 60 * 60 * 1000),
            };
            break;
          case "last_7d":
            whereClause.created_at = {
              [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000),
            };
            break;
          case "last_14d":
            whereClause.created_at = {
              [Op.gte]: new Date(now - 14 * 24 * 60 * 60 * 1000),
            };
            break;
          case "last_30d":
            whereClause.created_at = {
              [Op.gte]: new Date(now - 30 * 24 * 60 * 60 * 1000),
            };
            break;
        }
      }

      // Filter by salary range
      if (salary && salary !== "all") {
        whereClause.salary = salary;
      }

      const jobs = await Job.findAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
      });

      return res.json({
        jobs: jobs,
        totalJobs: jobs.length,
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
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
          code: -1,
        });
      }

      // Kiểm tra xem đã lưu chưa
      const existingSave = await SavedJob.findOne({
        where: {
          user_id: userId,
          job_id: jobId,
        },
      });

      if (existingSave) {
        return res.status(400).json({
          message: "Bạn đã lưu công việc này rồi",
          code: -1,
        });
      }

      // Tạo bản ghi mới
      const savedJob = await SavedJob.create({
        saved_id: `saved-${Date.now()}`,
        user_id: userId,
        job_id: jobId,
        saved_date: new Date(),
      });

      res.status(201).json({
        message: "Lưu công việc thành công",
        code: 1,
        savedJob,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
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
          job_id: jobId,
        },
      });

      if (result === 0) {
        return res.status(404).json({
          message: "Không tìm thấy công việc đã lưu",
          code: -1,
        });
      }

      res.status(200).json({
        message: "Bỏ lưu công việc thành công",
        code: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
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
          job_id: jobId,
        },
      });

      res.status(200).json({
        isSaved: !!savedJob,
        code: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
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
          code: -1,
        });
      }

      // Kiểm tra xem đã xem job này chưa
      const existingView = await ViewedJob.findOne({
        where: {
          user_id: userId,
          job_id: jobId,
        },
      });

      if (existingView) {
        // Nếu đã xem rồi thì cập nhật thời gian xem
        await existingView.update({
          viewed_date: new Date(),
        });
      } else {
        // Nếu chưa xem thì tạo mới
        await ViewedJob.create({
          viewed_id: `viewed-${Date.now()}`,
          user_id: userId,
          job_id: jobId,
          viewed_date: new Date(),
        });
      }

      res.status(200).json({
        message: "Đã thêm vào lịch sử xem",
        code: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }

  // Xóa tất cả lịch sử xem
  async clearViewedJobs(req, res) {
    try {
      const userId = req.user.id;

      await ViewedJob.destroy({
        where: {
          user_id: userId,
        },
      });

      res.status(200).json({
        message: "Đã xóa toàn bộ lịch sử xem",
        code: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
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
          job_id: jobId,
        },
      });

      if (result === 0) {
        return res.status(404).json({
          message: "Không tìm thấy job trong lịch sử xem",
          code: -1,
        });
      }

      res.status(200).json({
        message: "Đã xóa job khỏi lịch sử xem",
        code: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }
  // check status of candidate 
  async checkCandidateStatus(req, res) {
    try {
      const userId = req.user.id;
      const candidate = await Candidate.findOne({
        where: { user_id: userId }
      });
      if (!candidate) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin ứng viên",
          code: -1,
        });
      }
      const candidateStatus = candidate.status;
      return res.status(200).json({
        candidateStatus,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }
  
  async checkUserPlan(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          code: -1
        });
      }
      
      // Determine AI features access level based on plan
      const plan = user.plan || 'Basic';
      let aiAccess = {
        canUseAI: false,
        features: [],
        plan: plan
      };
      
      switch (plan) {
        case 'ProMax':
          aiAccess.canUseAI = true;
          aiAccess.features = ['job_analysis', 'skills_match', 'resume_tips', 'interview_prep', 'salary_negotiation'];
          break;
        case 'Pro':
          aiAccess.canUseAI = true;
          aiAccess.features = ['job_analysis', 'skills_match', 'resume_tips'];
          break;
        case 'Basic':
          aiAccess.canUseAI = true;
          aiAccess.features = ['job_analysis'];
          break;
        default:
          aiAccess.canUseAI = false;
          aiAccess.features = [];
      }
      
      return res.status(200).json({
        aiAccess,
        code: 1
      });
    } catch (error) {
      console.error("Error in checkUserPlan:", error);
      return res.status(500).json({
        message: "Error checking user plan",
        code: -1,
        error: error.message
      });
    }
  }

  // Thêm vào UserController
  async applyForJob(req, res) {
    const { job_id, cv_id, cv_type, resume_url, previous_status } = req.body;
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

      // Kiểm tra trạng thái của candidate
      const candidate = await Candidate.findOne({
        where: {
          user_id: userId
        }
      });

      if (!candidate || candidate.status !== 'Active') {
        return res.status(403).json({
          message: "Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa",
          code: -1
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
        // Kiểm tra nếu đơn ứng tuyển đã được rút hoặc bị từ chối và đã qua thời gian chờ
        if ((existingApplication.status === "Đã rút đơn" || existingApplication.status === "Đã từ chối") && existingApplication.updated_at) {
          const updatedDate = new Date(existingApplication.updated_at);
          const now = new Date();
          
          // Reset time part to 00:00:00 to compare only dates
          updatedDate.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          
          const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
          const requiredDays = existingApplication.status === "Đã rút đơn" ? 7 : 30;
          
          if (daysSinceUpdate < requiredDays) {
            return res.status(400).json({
              message: `Bạn cần đợi ${requiredDays - daysSinceUpdate} ngày nữa để ứng tuyển lại`,
              code: -1,
            });
          }
          
          // Nếu đã qua thời gian chờ, cập nhật trạng thái của đơn ứng tuyển
          await existingApplication.update({
            status: "Đang xét duyệt",
            updated_at: new Date(),
            resume: cv_id || resume_url || existingApplication.resume,
            resume_type: cv_type || existingApplication.resume_type
          });
          
          // Trả về thành công
          return res.status(200).json({
            message: "Ứng tuyển lại thành công",
            code: 1,
            application: existingApplication
          });
        } else if (existingApplication.status !== "Đã rút đơn" && existingApplication.status !== "Đã từ chối") {
          // Nếu đơn ứng tuyển không phải đã rút hoặc bị từ chối, không cho phép ứng tuyển lại
          return res.status(400).json({
            message: "Bạn đã nộp đơn cho công việc này rồi",
            code: -1,
          });
        }
      }

      // Lấy thông tin user và company
      const user = await User.findByPk(userId);
      const company = await Company.findByPk(job.company_id);

      if (!user || !company) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin người dùng hoặc công ty",
          code: -1,
        });
      }

      // Tạo đơn ứng tuyển mới hoặc cập nhật đơn hiện có
      let application;
      if (existingApplication) {
        application = existingApplication;
        application.status = "Đang xét duyệt";
        application.updated_at = new Date();
        application.resume = cv_id || resume_url || application.resume;
        application.resume_type = cv_type || application.resume_type;
        await application.save();
      } else {
        application = await JobApplication.create({
          application_id: this.generateApplicationId(),
          user_id: userId,
          job_id: job_id,
          applied_at: new Date(),
          status: "Đang xét duyệt",
          resume: cv_id || resume_url,
          resume_type: cv_type || (cv_id ? 'created' : 'uploaded')
        });
      }

      // từ company_id lây ra user_id từ bảng RecruiterCompanies
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { company_id: job.company_id },
      });
      const recruiterId = recruiterCompany.user_id;

      // Lấy thông tin nhà tuyển dụng
      const recruiter = await User.findByPk(recruiterId);

      // Tạo thông báo cho nhà tuyển dụng
      try {
        await NotificationController.createJobApplicationNotification(
          recruiterId,
          userId,
          job_id,
        );
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Không trả về lỗi nếu tạo thông báo thất bại
      }
      
      // Gửi thông báo realtime qua socket.io
      try {
        // Lấy thông tin candidate
        const candidate = await Candidate.findOne({
          where: { user_id: userId }
        });
        
        // Gửi thông báo realtime
        notifyNewJobApplication({
          job_id: job_id,
          job_title: job.title,
          application_id: application.application_id,
          candidate_name: user.name,
          applied_at: application.applied_at,
          company_id: job.company_id,
          user_id: userId,
          candidate_id: candidate ? candidate.candidate_id : null
        });
      } catch (socketError) {
        console.error('Error sending realtime notification:', socketError);
        // Không trả về lỗi nếu gửi thông báo realtime thất bại
      }

      // Gửi response ngay lập tức
      res.status(201).json({
        message: "Nộp đơn thành công",
        code: 1,
        application,
      });

      // Gửi email bất đồng bộ
      process.nextTick(async () => {
        try {
          // Template email cho ứng viên
          const candidateEmailTemplate = `
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
                background-color: #f59e0b15;
                color: #f59e0b;
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
              .timeline {
                margin: 20px 0;
                padding: 15px;
                background-color: #f8fafc;
                border-radius: 8px;
              }
              .timeline-item {
                margin: 10px 0;
                padding-left: 20px;
                border-left: 2px solid #3b82f6;
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${company.logo ? `<img src="${company.logo}" alt="${company.company_name}" class="company-logo">` : ''}
              <h2>Xác nhận nộp đơn ứng tuyển</h2>
            </div>
            
            <div class="content">
              <p>Chào ${user.name},</p>
              
              <div class="status-badge">
                ⏳ Đang xét duyệt
              </div>
              
              <p>Cảm ơn bạn đã nộp đơn ứng tuyển vào vị trí <strong>${job.title}</strong> tại <strong>${company.company_name}</strong>. 
              Chúng tôi đã nhận được đơn ứng tuyển của bạn và sẽ xem xét trong thời gian sớm nhất.</p>
              
              <div class="job-details">
                <h3>Thông tin công việc:</h3>
                <p><strong>Vị trí:</strong> ${job.title}</p>
                <p><strong>Công ty:</strong> ${company.company_name}</p>
                ${company.address ? `<p><strong>Địa chỉ:</strong> ${company.address}</p>` : ''}
                ${company.website ? `<p><strong>Website:</strong> <a href="${company.website}">${company.website}</a></p>` : ''}
                <p><strong>Mức lương:</strong> ${job.salary}</p>
                ${job.working_location ? `<p><strong>Địa điểm làm việc:</strong> ${job.working_location}</p>` : ''}
              </div>

              <div class="timeline">
                <h3>Quy trình tuyển dụng:</h3>
                <div class="timeline-item">
                  <p><strong>1. Nhận đơn ứng tuyển</strong> - Hoàn thành</p>
                </div>
                <div class="timeline-item">
                  <p><strong>2. Xét duyệt hồ sơ</strong> - Đang tiến hành</p>
                </div>
                <div class="timeline-item">
                  <p><strong>3. Phỏng vấn</strong> - Chờ xét duyệt</p>
                </div>
                <div class="timeline-item">
                  <p><strong>4. Quyết định cuối cùng</strong> - Chờ xét duyệt</p>
                </div>
              </div>

              <p>Bạn có thể theo dõi trạng thái đơn ứng tuyển của mình trên JobZone:</p>
              <a href="${process.env.FE_URL}/job-detail/${job.job_id}" class="button">Xem chi tiết đơn ứng tuyển</a>
            </div>

            <div class="footer">
              <p>Trân trọng,<br>JobZone Team</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              ${company.website ? `<p>Tìm hiểu thêm về ${company.company_name} tại <a href="${company.website}">${company.website}</a></p>` : ''}
            </div>
          </body>
          </html>
          `;

          // Template email cho nhà tuyển dụng
          const recruiterEmailTemplate = `
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
                background-color: #3b82f615;
                color: #3b82f6;
                font-weight: bold;
                margin: 10px 0;
              }
              .content {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .candidate-details {
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
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
              .action-buttons {
                text-align: center;
                margin: 20px 0;
              }
              .action-buttons .button {
                margin: 0 10px;
              }
              .button.accept {
                background-color: #059669;
              }
              .button.reject {
                background-color: #dc2626;
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${company.logo ? `<img src="${company.logo}" alt="${company.company_name}" class="company-logo">` : ''}
              <h2>Đơn ứng tuyển mới</h2>
            </div>
            
            <div class="content">
              <p>Chào ${recruiter.name},</p>
              
              <div class="status-badge">
                📥 Đơn ứng tuyển mới
              </div>
              
              <p>Bạn vừa nhận được một đơn ứng tuyển mới cho vị trí <strong>${job.title}</strong>.</p>
              
              <div class="candidate-details">
                <h3>Thông tin ứng viên:</h3>
                <p><strong>Họ tên:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                ${user.phone ? `<p><strong>Số điện thoại:</strong> ${user.phone}</p>` : ''}
                <p><strong>Ngày nộp đơn:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              <div class="job-details">
                <h3>Thông tin công việc:</h3>
                <p><strong>Vị trí:</strong> ${job.title}</p>
                <p><strong>Mức lương:</strong> ${job.salary}</p>
                ${job.working_location ? `<p><strong>Địa điểm làm việc:</strong> ${job.working_location}</p>` : ''}
              </div>

              <div class="action-buttons">
                <a href="${process.env.FE_URL}/recruiter/applications" class="button">Xem chi tiết đơn ứng tuyển</a>
              </div>

              <p>Vui lòng xem xét đơn ứng tuyển và phản hồi cho ứng viên trong thời gian sớm nhất.</p>
            </div>

            <div class="footer">
              <p>Trân trọng,<br>JobZone Team</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </body>
          </html>
          `;

          // Gửi email cho ứng viên
          await mailerService.sendMail(
            user.email,
            `Xác nhận đơn ứng tuyển - ${job.title} tại ${company.company_name}`,
            candidateEmailTemplate
          );

          // Gửi email cho nhà tuyển dụng
          await mailerService.sendMail(
            recruiter.email,
            `[JobZone] Đơn ứng tuyển mới - ${job.title}`,
            recruiterEmailTemplate
          );

        } catch (error) {
          console.error('Error sending emails:', error);
        }
      });

    } catch (error) {
      console.error('Error in applyForJob:', error);
      return res.status(500).json({
        message: "Có lỗi xảy ra khi nộp đơn",
        code: -1,
        error: error.message
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
          status: application.status,
          application_id: application.application_id,
          updated_at: application.updated_at
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
    // Kiểm tra xem công việc có tồn tại không
    const job = await Job.findByPk(job_id);
    if (!job) {
      return res.status(404).json({
        message: "Không tìm thấy công việc",
        code: -1,
      });
    }
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

      // Cập nhật trạng thái thành "đã rút đơn"
      await application.update({ status: 'Đã rút đơn', updated_at: new Date() });

      // từ company_id lây ra user_id từ bảng RecruiterCompanies
      const recruiterCompany = await RecruiterCompanies.findOne({
        where: { company_id: job.company_id },
      });
      const recruiterId = recruiterCompany.user_id;

      try {
        await NotificationController.createWithdrawApplicationNotification(
          recruiterId,
          userId,
          job_id,
        );
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Không trả về lỗi nếu tạo thông báo thất bại
      }

      return res.status(200).json({
        message: "Đơn ứng tuyển đã được chuyển sang trạng thái đã rút đơn",
        code: 1,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }
  // get career handbook by post_id
  async getCareerHandbookByPostId(req, res) {
    const { post_id } = req.params;
    try {
      const careerHandbook = await CareerHandbook.findOne({
        where: { post_id: post_id },
      });
      res.status(200).json({
        message: "Thành công",
        code: 1,
        careerHandbook,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }



  // get all top company với plan là pro
  async getAllTopCompanyPro(req, res) {
    try {
      const topCompany = await Company.findAll({
        where: { plan: { [Op.or]: ['Pro', 'ProMax'] } },
        limit: 10,
      });
      res.status(200).json({
        message: "Thành công",
        code: 1,
        topCompany,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }

  // get all reviews by user_id
  async getAllReviewsByUserId(req, res) {
    try {
      const user_id = req.user.id;
      const reviews = await Reviews.findAll({
        where: { user_id: user_id }
      });
      res.status(200).json({
        message: "Thành công",
        code: 1,
        reviews
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1,
      });
    }
  }

  async editReviewByUserId(req, res) {
    try {
      const user_id = req.user.id;
      const { review_id, rating, comment } = req.body;

      const review = await Reviews.findOne({
        where: {
          review_id: review_id,
          user_id: user_id
        }
      });

      if (!review) {
        return res.status(404).json({
          message: "Không tìm thấy đánh giá",
          code: -1
        });
      }

      await review.update({
        rating: rating,
        comment: comment
      });

      res.status(200).json({
        message: "Cập nhật đánh giá thành công",
        code: 1
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  async deleteReviewByReviewId(req, res) {
    const { review_id } = req.params;
    const user_id = req.user.id;
    try {
      const review = await Reviews.findOne({
        where: {
          review_id: review_id,
          user_id: user_id
        }
      });
      if (!review) {
        return res.status(404).json({
          message: "Không tìm thấy đánh giá",
          code: -1
        });
      }
      await review.destroy();
      res.status(200).json({
        message: "Đã xóa đánh giá thành công",
        code: 1
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  // Hàm lấy thông tin chi tiết của một CV
  async getCVDetail(req, res) {
    try {
      const { cv_id } = req.params;

      // Lấy thông tin CV và kiểm tra quyền sở hữu
      const cv = await UserCv.findOne({
        where: {
          id: cv_id,
          user_id: req.user.id
        }
      });

      if (!cv) {
        return res.status(404).json({
          message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập',
          code: -1
        });
      }

      // Lấy template
      const template = await CvTemplates.findByPk(cv.template_id);

      // Lấy tất cả fields của template
      const templateFields = await TemplateFields.findAll({
        where: { template_id: cv.template_id },
        order: [['order', 'ASC']]
      });

      // Lấy tất cả giá trị của các fields
      const fieldValues = await CvFieldValues.findAll({
        where: { cv_id }
      });

      // Kết hợp thông tin fields và values
      const fields = templateFields.map(field => {
        const value = fieldValues.find(v => v.field_id === field.id);
        return {
          ...field.toJSON(),
          value: value ? value.value : ''
        };
      });

      return res.status(200).json({
        message: 'Lấy thông tin CV thành công',
        code: 1,
        data: {
          cv,
          template,
          fields
        }
      });

    } catch (error) {
      console.error('Error getting CV detail:', error);
      return res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }

  async toggleCvTemplate(req, res) {
    try {
      const { cv_id } = req.params;
      const user_id = req.user.id; // Changed from req.user.user_id to req.user.id

      // First, update all CVs of the user to not be templates
      await CandidateCv.update(
        { is_template: false },
        {
          where: {
            user_id: user_id
          }
        }
      );

      // Then, update the specific CV's template status
      const cv = await CandidateCv.findOne({
        where: {
          cv_id: cv_id,
          user_id: user_id
        }
      });

      if (!cv) {
        return res.status(404).json({
          code: 0,
          message: "CV không tồn tại hoặc không thuộc về người dùng này"
        });
      }

      // Toggle the template status
      await cv.update({
        is_template: !cv.is_template
      });

      return res.status(200).json({
        code: 1,
        message: cv.is_template ? "Đã cài làm mặc định" : "Đã hủy mặc định",
        cv: cv
      });

    } catch (error) {
      console.error("Error in toggleCvTemplate:", error);
      return res.status(500).json({
        code: 0,
        message: "Đã có lỗi xảy ra khi cập nhật trạng thái mặc định của CV"
      });
    }
  }
  // hủy mặc định cv
  async cancelCvTemplate(req, res) {
    try {
      const { cv_id } = req.params;
      const user_id = req.user.id;

      const cv = await CandidateCv.findOne({
        where: {
          cv_id: cv_id,
          user_id: user_id
        }
      });

      if (!cv) {
        return res.status(404).json({
          code: 0,
          message: "CV not found"
        });
      }

      await cv.update({
        is_template: false
      });

      return res.status(200).json({
        code: 1,
        message: "CV template cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling CV template:", error);
      return res.status(500).json({
        code: 0,
        message: "Internal server error"
      });
    }
  }
  // cài mặc định cv đã tạo UserCv
  async toggleUserCvTemplate(req, res) {
    try {
      const { cv_id } = req.params;
      const user_id = req.user.id;

      // First, update all CVs of the user to not be templates
      await UserCv.update(
        { is_template: false },
        {
          where: {
            user_id: user_id
          }
        }
      );

      // Then, update the specific CV's template status
      const cv = await UserCv.findOne({
        where: {
          cv_id: cv_id,
          user_id: user_id
        }
      });

      if (!cv) {
        return res.status(404).json({
          code: 0,
          message: "CV not found"
        });
      }

      await cv.update({
        is_template: !cv.is_template
      });

      return res.status(200).json({
        code: 1,
        message: cv.is_template ? "Đã cài làm mặc định" : "Đã hủy mặc định",
        cv: cv
      });
    } catch (error) {
      console.error("Error in toggleUserCvTemplate:", error);
      return res.status(500).json({
        code: 0,
        message: "Internal server error"
      });
    }
  }
  // delete user cv template
  async deleteUserCvTemplate(req, res) {
    let transaction;
    try {
      const { cv_id } = req.params;
      const user_id = req.user.id;
      
      // Start a transaction
      transaction = await sequelize.transaction();
      
      // Find the CV first
      const cv = await UserCv.findOne({
        where: {
          cv_id: cv_id,
          user_id: user_id
        },
        transaction
      });

      if (!cv) {
        await transaction.rollback();
        return res.status(404).json({
          code: 0,
          message: "CV not found"
        });
      }

      // First delete all related field values
      await CvFieldValues.destroy({
        where: { cv_id: cv_id },
        transaction
      });

      // Then delete the CV itself
      await cv.destroy({ transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      return res.status(200).json({
        code: 1,
        message: "CV template deleted successfully"
      });
    } catch (error) {
      // Rollback in case of error
      if (transaction) await transaction.rollback();
      
      console.error("Error in deleteUserCvTemplate:", error);
      return res.status(500).json({
        code: 0,
        message: "Internal server error"
      });
    }
  }

  async cancelUserCvTemplate(req, res) {
    try {
      const { cv_id } = req.params;
      const user_id = req.user.id;

      const cv = await UserCv.findOne({
        where: {
          cv_id: cv_id,
          user_id: user_id
        }
      });

      if (!cv) {
        return res.status(404).json({
          code: 0,
          message: "CV not found"
        });
      }

      await cv.update({
        is_template: false
      });

      return res.status(200).json({
        code: 1,
        message: "Đã hủy mặc định CV",
        cv: cv
      });
    } catch (error) {
      console.error("Error in cancelUserCvTemplate:", error);
      return res.status(500).json({
        code: 0,
        message: "Internal server error"
      });
    }
  }

  async deleteCandidateCv(req, res) {
    try {
      const { cv_id } = req.params;
      const user_id = req.user.id;

      const cv = await CandidateCv.findOne({
        where: {
          cv_id: cv_id,
          user_id: user_id
        }
      });

      if (!cv) {
        return res.status(404).json({
          code: 0,
          message: "CV not found"
        });
      }

      // Delete the CV file from storage if needed
      if (cv.cv_url) {
        const filePath = path.join(__dirname, '../../uploads/candidate_cv', cv.cv_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await cv.destroy();

      return res.status(200).json({
        code: 1,
        message: "CV deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting CV:", error);
      return res.status(500).json({
        code: 0,
        message: "Internal server error"
      });
    }
  }

  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin người dùng'
        });
      }

      const notifications = await NotificationController.getUserNotifications(userId, parseInt(page), parseInt(limit));

      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách thông báo'
      });
    }
  }
  // get candidate is_notification,is_message notification
  async getCandidateNotification(req, res) {
    try {
      const userId = req.user.id;
      const candidate = await Candidate.findOne({
        where: {
          user_id: userId
        }
      });
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin ứng viên'
        });
      }
      const is_notification = candidate.is_notification;
      const is_message = candidate.is_message;
      return res.status(200).json({
        success: true,
        data: {
          is_notification,
          is_message
        }
      });
    } catch (error) {
      console.error('Error in getCandidateNotification:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy thông tin thông báo'
      });
    }
  }

  async markNotificationAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      if (!userId || !notificationId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin cần thiết'
        });
      }

      await NotificationController.markAsRead(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu thông báo đã đọc'
      });
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi đánh dấu thông báo đã đọc'
      });
    }
  }

  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin người dùng'
        });
      }

      await NotificationController.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu tất cả thông báo đã đọc'
      });
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi đánh dấu tất cả thông báo đã đọc'
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      if (!userId || !notificationId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin cần thiết'
        });
      }

      await NotificationController.deleteNotification(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa thông báo'
      });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa thông báo'
      });
    }
  }

  async deleteAllReadNotifications(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin người dùng'
        });
      }

      const deletedCount = await NotificationController.deleteAllReadNotifications(userId);

      return res.status(200).json({
        success: true,
        message: `Đã xóa ${deletedCount} thông báo đã đọc`
      });
    } catch (error) {
      console.error('Error in deleteAllReadNotifications:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa tất cả thông báo đã đọc'
      });
    }
  }

  async getUnreadNotificationsCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await NotificationController.countUnreadNotifications(userId);

      return res.status(200).json({
        success: true,
        count: count
      });
    } catch (error) {
      console.error('Error in getUnreadNotificationsCount:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy số thông báo chưa đọc'
      });
    }
  }

  async updateCV(req, res) {
    let transaction;
    try {
      const { cv_id } = req.params;
      const { name, fieldValues } = req.body;
      const user_id = req.user.id;

      // Start a transaction for all database operations
      transaction = await sequelize.transaction();

      // 1. Kiểm tra CV có tồn tại và thuộc về user không
      const existingCV = await UserCv.findOne({
        where: {
          cv_id,
          user_id
        },
        transaction
      });

      if (!existingCV) {
        await transaction.rollback();
        return res.status(404).json({
          message: 'CV không tồn tại hoặc không có quyền chỉnh sửa',
          code: -1
        });
      }

      // 2. Cập nhật thông tin cơ bản của CV
      await existingCV.update({
        cv_name: name,
        updated_at: new Date()
      }, { transaction });

      // 3. Cập nhật các field values - sequential approach to avoid deadlocks
      if (fieldValues && Array.isArray(fieldValues)) {
        // Instead of updating each field value individually with many queries,
        // fetch all existing fields first and then process updates in memory
        const existingFieldValues = await CvFieldValues.findAll({
          where: { cv_id },
          transaction
        });

        for (const field of fieldValues) {
          const { field_id, field_value } = field;
          const existingField = existingFieldValues.find(f => f.field_id === field_id);
          
          if (existingField) {
            // Update existing field
            existingField.field_value = field_value;
            await existingField.save({ transaction });
          } else {
            // Create new field if it doesn't exist (unlikely in update scenario)
            await CvFieldValues.create({
              value_id: this.generateValueId(),
                cv_id,
              field_id,
              field_value
            }, { transaction });
              }
            }
      }

      // Commit the transaction
      await transaction.commit();

      // 4. Lấy thông tin CV đã cập nhật để trả về (outside transaction)
      const updatedCV = await UserCv.findByPk(cv_id);
      const template = await CvTemplates.findByPk(updatedCV.template_id);
      const updatedFieldValues = await CvFieldValues.findAll({
        where: { cv_id }
      });

      return res.status(200).json({
        message: 'Cập nhật CV thành công',
        code: 1,
        data: {
          cv: updatedCV,
          template: template,
          fieldValues: updatedFieldValues
        }
      });

    } catch (error) {
      // Rollback the transaction if an error occurred
      if (transaction) await transaction.rollback();

      console.error('Error updating CV:', error);
      return res.status(500).json({
        message: error.message,
        code: -1
      });
    }
  }
  // get all conversations 
  async getAllConversations(req, res) {
    try {
      const conversations = await Conversation.findAll();
      return res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      console.error('Error in getAllConversations:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách cuộc hội thoại'
      });
    }
  }

  async updateCandidateNotification(req, res) {
    try {
      const userId = req.user.id;
      const { is_notification, is_message } = req.body;

      const candidate = await Candidate.findOne({
        where: {
          user_id: userId
        }
      });

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin ứng viên'
        });
      }

      await candidate.update({
        is_notification,
        is_message
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật cài đặt thông báo thành công'
      });
    } catch (error) {
      console.error('Error in updateCandidateNotification:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật cài đặt thông báo'
      });
    }
  }
}


module.exports = new UserController();
