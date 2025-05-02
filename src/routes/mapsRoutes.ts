import { Router } from 'express';
import { getDistance, getBulkDistances } from '../controllers/mapsController';

const router = Router();

/**
 * @route GET /api/maps/distance
 * @description İki nokta arasındaki mesafeyi hesaplar
 * @access Public
 */
router.get('/distance', getDistance);

/**
 * @route POST /api/maps/bulk-distances
 * @description Bir noktadan birden çok noktaya olan mesafeleri toplu hesaplar
 * @access Public
 */
router.post('/bulk-distances', getBulkDistances);

export default router; 