// backend/src/services/token.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateSecurityToken = (security) => {
  return jwt.sign(
    {
      id: security._id,
      securityId: security._id,
      placeId: security.place,
      role: 'SECURITY'
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = { generateToken, generateSecurityToken };