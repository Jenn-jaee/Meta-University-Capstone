module.exports.STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  NOT_AUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Prisma error codes
module.exports.PRISMA_ERRORS = {
  UNIQUE_CONSTRAINT: 'P2002', // Unique constraint violation
  FOREIGN_KEY_CONSTRAINT: 'P2003', // Foreign key constraint violation
  RECORD_NOT_FOUND: 'P2001', // Record not found
  REQUIRED_FIELD_MISSING: 'P2012', // Required field missing
};
