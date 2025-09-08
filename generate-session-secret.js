const crypto = require('crypto');

// Generate a secure session secret
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('='.repeat(60));
console.log('🔐 GENERATED SESSION SECRET');
console.log('='.repeat(60));
console.log(sessionSecret);
console.log('='.repeat(60));
console.log('Copy this value to your .env file as SESSION_SECRET');
console.log('='.repeat(60));
