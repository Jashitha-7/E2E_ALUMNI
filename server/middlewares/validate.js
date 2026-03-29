const emailRegex = /\S+@\S+\.\S+/;

const validate = (schema) => (req, res, next) => {
  const errors = [];

  if (schema.body) {
    for (const [field, validator] of Object.entries(schema.body)) {
      const result = validator(req.body?.[field], req.body);
      if (result !== true) {
        errors.push({ field, message: result });
      }
    }
  }

  if (errors.length > 0) {
    res.status(400);
    return next(new Error(errors.map((err) => `${err.field}: ${err.message}`).join(" | ")));
  }

  return next();
};

const required = (label) => (value) =>
  value === undefined || value === null || value === "" ? `${label} is required` : true;

const isEmail = (label) => (value) =>
  !emailRegex.test(String(value || "")) ? `${label} must be a valid email` : true;

const minLength = (label, length) => (value) =>
  String(value || "").length < length ? `${label} must be at least ${length} characters` : true;

const oneOf = (label, options) => (value) =>
  value && !options.includes(value) ? `${label} must be one of ${options.join(", ")}` : true;

const optional = (validator) => (value, body) =>
  value === undefined || value === null || value === "" ? true : validator(value, body);

export { validate, required, isEmail, minLength, oneOf, optional };
