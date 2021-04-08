const express = require('express');
const router = express.Router();

const gidenIrsaliyeRoutes = require('./gidenIrsaliye');
const gidenIrsaliyeDetayRoutes = require('./gidenIrsaliyeDetay');
const irsaliyeDurumRoutes = require('./irsaliyeDurum');
const gelenIrsaliyeRoutes = require('./gelenIrsaliye');
const gelenIrsaliyeDetayRoutes = require('./gelenIrsaliyeDetay');
const siparistenIrsaliyeRoutes = require('./siparistenIrsaliye');

router.use('/gidenIrsaliye', gidenIrsaliyeRoutes);
router.use('/gidenIrsaliyeDetay', gidenIrsaliyeDetayRoutes);
router.use('/irsaliyeDurum', irsaliyeDurumRoutes);
router.use('/gelenIrsaliye', gelenIrsaliyeRoutes);
router.use('/gelenIrsaliyeDetay', gelenIrsaliyeDetayRoutes);
router.use('/siparistenIrsaliye', siparistenIrsaliyeRoutes);

module.exports = router;
