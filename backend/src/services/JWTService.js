require("dotenv").config();
const jwt = require('jsonwebtoken');

class JwtService {
  constructor( options = {}) {
    this.secret = process.env.JWT_SECRET;
    this.defaultOptions = {
      expiresIn: '24h',
      ...options
    };
  }

  generateToken(payload, options = {}) {
    return jwt.sign(payload, this.secret, { ...this.defaultOptions, ...options });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new JwtService();
