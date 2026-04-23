export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};
