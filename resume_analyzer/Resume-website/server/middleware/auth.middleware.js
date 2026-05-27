import jwt from "jsonwebtoken";
import joi from "joi";

export const signUpValidation = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().min(3).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

export const loginValidation = (req, res, next) => {
  const schema = joi
    .object({
      identifier: joi.string().min(3).max(100),
      email: joi.string().email(),
      username: joi.string().min(3).max(100),
      password: joi.string().min(4).max(100).required(),
    })
    .or("identifier", "email", "username");
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const normalizedId = decoded.id || decoded._id;
    if (!normalizedId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      ...decoded,
      id: normalizedId,
      _id: normalizedId,
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ...existing code...
