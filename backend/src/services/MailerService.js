const nodemailer = require('nodemailer');
require('dotenv').config();

class MailerService {
  constructor() {
    // Initialize the transporter
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send an email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} html - Email body in HTML format
   * @returns {Promise<void>}
   */
  async sendMail(to, subject, html) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
      throw new Error('Email sending failed');
    }
  }
}

module.exports = new MailerService();
