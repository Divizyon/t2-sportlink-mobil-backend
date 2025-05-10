"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sportController_1 = require("../controllers/sportController");
const router = (0, express_1.Router)();
/**
 * @route GET /api/sports
 * @desc Tüm spor dallarını listele
 * @access Public
 */
router.get('/', sportController_1.sportController.getAllSports);
/**
 * @route GET /api/sports/:id
 * @desc Spor dalı detayını getir
 * @access Public
 */
router.get('/:id', sportController_1.sportController.getSportById);
exports.default = router;
//# sourceMappingURL=sportRoutes.js.map