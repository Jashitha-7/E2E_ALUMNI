import express from "express";
import protect from "../middlewares/auth.js";
import allowRoles from "../middlewares/roles.js";
import { listUsers, approveAlumni, banUser, stats } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, allowRoles("admin"), listUsers);
router.post("/approve/:id", protect, allowRoles("admin"), approveAlumni);
router.delete("/ban/:id", protect, allowRoles("admin"), banUser);
router.get("/stats", protect, allowRoles("admin"), stats);

export default router;
