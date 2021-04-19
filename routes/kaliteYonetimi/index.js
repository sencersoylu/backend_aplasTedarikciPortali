const express = require('express');
const router = express.Router();

const kaliteBelgesiRoutes = require('./kaliteBelgesi');
const kaliteBelgesiTurRoutes = require('./kaliteBelgesiTur');
const kaliteBelgesiEkRoutes = require('./kaliteBelgesiEk');

router.use('/kaliteYonetimiKaliteBelgesi', kaliteBelgesiRoutes);
router.use('/kaliteYonetimiKaliteBelgesiTur', kaliteBelgesiTurRoutes);
router.use('/kaliteYonetimiKaliteBelgesiEk', kaliteBelgesiEkRoutes);

module.exports = router;
