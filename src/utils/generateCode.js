const pad = (num, size = 4) => num.toString().padStart(size, '0');
const generateCode = (prefix, num) => `${prefix}${pad(num)}`;
module.exports = generateCode;
