const express = require("express");
const router = express.Router();
const controller = require("../controllers/projectController");

// ✅ ✅ ✅ IMPORTANT: STATS MUST COME BEFORE :id
router.get("/stats", controller.projectStats);

// ✅ CREATE
router.post("/", controller.createProject);

// ✅ LIST
router.get("/", controller.listProjects);

// ✅ GET SINGLE
router.get("/:id", controller.getProject);

// ✅ UPDATE
router.put("/:id", controller.updateProject);

module.exports = router;
