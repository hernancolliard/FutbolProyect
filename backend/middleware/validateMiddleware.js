const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      message: "Invalid request data",
      errors: error.flatten().fieldErrors,
    });
  }
};

module.exports = validate;
