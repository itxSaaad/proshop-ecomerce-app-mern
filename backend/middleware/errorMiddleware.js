const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // If response status is still 200 but there's an error, set it to 500
  let statusCode = res.statusCode;
  if (statusCode === 200) statusCode = 500;

  res.status(statusCode);

  res.json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    // Include error code if available
    code: err.code || 'UNKNOWN_ERROR',
  });
};

export { notFound, errorHandler };
