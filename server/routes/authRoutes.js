import express from "express";
import {
  login,
  register,
  studentRegister,
  adminCreateAlumni,
  adminCreateAdmin,
  setPasswordWithToken,
  resendInvite,
  refresh,
  logout,
  me,
} from "../controllers/authController.js";
import protect from "../middlewares/auth.js";
import { adminOnly, blockRoleTampering } from "../middlewares/roles.js";
import { validate, required, isEmail, minLength, optional, oneOf } from "../middlewares/validate.js";

const router = express.Router();

// Student registration schema (public)
const studentRegisterSchema = {
	body: {
		name: required("name"),
		email: (value) => (required("email")(value) === true ? isEmail("email")(value) : required("email")(value)),
		password: (value) => (required("password")(value) === true ? minLength("password", 8)(value) : required("password")(value)),
	},
};

// Legacy register schema - kept for backwards compatibility
const registerSchema = {
	body: {
		name: required("name"),
		email: (value) => (required("email")(value) === true ? isEmail("email")(value) : required("email")(value)),
		password: (value) => (required("password")(value) === true ? minLength("password", 8)(value) : required("password")(value)),
		role: optional(oneOf("role", ["student"])), // Only student allowed via public API
	},
};

// Admin creates alumni schema
const createAlumniSchema = {
	body: {
		name: required("name"),
		email: (value) => (required("email")(value) === true ? isEmail("email")(value) : required("email")(value)),
		graduationYear: optional((v) => typeof v === "number" || "graduationYear must be a number"),
		department: optional((v) => typeof v === "string" || "department must be a string"),
	},
};

// Admin creates admin schema
const createAdminSchema = {
	body: {
		name: required("name"),
		email: (value) => (required("email")(value) === true ? isEmail("email")(value) : required("email")(value)),
	},
};

// Set password with token schema
const setPasswordSchema = {
	body: {
		token: required("token"),
		password: (value) => (required("password")(value) === true ? minLength("password", 8)(value) : required("password")(value)),
	},
};

const loginSchema = {
	body: {
		email: (value) => (required("email")(value) === true ? isEmail("email")(value) : required("email")(value)),
		password: required("password"),
	},
};

const refreshSchema = {
	body: {
		refreshToken: required("refreshToken"),
	},
};

// Public routes
router.post("/register", blockRoleTampering, validate(registerSchema), register);
router.post("/register/student", validate(studentRegisterSchema), studentRegister);
router.post("/set-password", validate(setPasswordSchema), setPasswordWithToken);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);

// Protected routes
router.get("/me", protect, me);

// Admin-only routes for creating accounts
router.post(
	"/admin/create-alumni",
	protect,
	adminOnly("create_alumni"),
	validate(createAlumniSchema),
	adminCreateAlumni
);
router.post(
	"/admin/create-admin",
	protect,
	adminOnly("create_admin"),
	validate(createAdminSchema),
	adminCreateAdmin
);
router.post(
	"/admin/resend-invite/:userId",
	protect,
	adminOnly("resend_invite"),
	resendInvite
);

export default router;
