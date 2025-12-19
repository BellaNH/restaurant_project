/**
 * Database Error Handler Middleware
 * Handles MongoDB-specific errors and provides user-friendly messages
 */

export const handleDBError = (error, req, res, next) => {
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors
    });
  }

  // Mongoose duplicate key error (unique constraint violation)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      error: `A record with this ${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      error: "The provided ID is not valid"
    });
  }

  // Mongoose connection error
  if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
    console.error('Database connection error:', error);
    return res.status(503).json({
      success: false,
      message: "Database connection error",
      error: "Unable to connect to database. Please try again later."
    });
  }

  // Pass other errors to default error handler
  next(error);
};

/**
 * Async handler wrapper to catch database errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};








