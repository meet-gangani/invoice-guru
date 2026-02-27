// Firebase

// MongoDB
exports.MONGODB_URL = process.env.MONGODB_URL

exports.PORT = process.env.PORT
exports.ENVIRONMENT = process.env.ENVIRONMENT


// JWT
exports.security = {
  SALT: 10,
  TOKEN_SECRET: 'codelab-invoice-guru'
}

// STATUS CODE
exports.ResponseStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_NOT_AVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
}
