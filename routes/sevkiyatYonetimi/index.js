const express = require('express');
const router = express.Router();

const irsaliyeDurumRoutes = require('./irsaliyeDurum');
const irsaliyeRoutes = require('./irsaliye');
const irsaliyeDetayRoutes = require('./irsaliyeDetay');
const siparistenIrsaliyeRoutes = require('./siparistenIrsaliye');

router.use('/irsaliyeDurum', irsaliyeDurumRoutes);

router.use('/irsaliye', irsaliyeRoutes);
router.use('/irsaliyeDetay', irsaliyeDetayRoutes);

router.use('/siparistenIrsaliye', siparistenIrsaliyeRoutes);

module.exports = router;
