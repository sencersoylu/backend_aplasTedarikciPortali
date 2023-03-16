const express = require('express');
const router = express.Router();

const kaliteBelgesiRoutes = require('./kaliteBelgesi');
const kaliteBelgesiTurRoutes = require('./kaliteBelgesiTur');
const kaliteBelgesiEkRoutes = require('./kaliteBelgesiEk');
const kaliteDokumaniTurRoutes = require('./kaliteDokumaniTur');
const kaliteDokumaniRoutes = require('./kaliteDokumani');
const kaliteDokumaniEkRoutes = require('./kaliteDokumaniEk');


router.use('/kaliteYonetimiKaliteBelgesi', kaliteBelgesiRoutes);
router.use('/kaliteYonetimiKaliteBelgesiTur', kaliteBelgesiTurRoutes);
router.use('/kaliteYonetimiKaliteBelgesiEk', kaliteBelgesiEkRoutes);
router.use('/kaliteYonetimiKaliteDokumaniTur', kaliteDokumaniTurRoutes);
router.use('/kaliteYonetimiKaliteDokumani', kaliteDokumaniRoutes);
router.use('/kaliteYonetimiKaliteDokumaniEk', kaliteDokumaniEkRoutes);

module.exports = router;
