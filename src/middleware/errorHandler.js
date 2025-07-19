const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || "SERVER_ERROR",
    detail: err.detail || null,
  });
};

module.exports = errorHandler;