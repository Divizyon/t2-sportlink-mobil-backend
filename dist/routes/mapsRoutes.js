"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mapsController_1 = require("../controllers/mapsController");
const router = (0, express_1.Router)();
/**
 * @route GET /api/maps/distance
 * @description İki nokta arasındaki mesafeyi hesaplar
 * @access Public
 */
router.get('/distance', mapsController_1.getDistance);
/**
 * @route POST /api/maps/bulk-distances
 * @description Bir noktadan birden çok noktaya olan mesafeleri toplu hesaplar
 * @access Public
 */
router.post('/bulk-distances', mapsController_1.getBulkDistances);
exports.default = router;
//# sourceMappingURL=mapsRoutes.js.map