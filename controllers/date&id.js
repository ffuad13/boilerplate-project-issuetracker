const crypto = require("crypto")

const genId = () => crypto.randomUUID();
const genDate = () => new Date().toISOString()

module.exports = {genDate, genId}