import express from "express";
import { getAlumniDirectory, getProfile, updateProfile } from "../controllers/userController.js";
import protect from "../middlewares/auth.js";
import { allowRoles } from "../middlewares/roles.js";

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.get("/alumni", protect, allowRoles("student", "alumni", "admin"), getAlumniDirectory);

export default router;
