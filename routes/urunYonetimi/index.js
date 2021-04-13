const express = require('express');
const router = express.Router();

const ureticiUrunRoutes = require('./stokKarti');
const ureticiUrunUrunTasiyiciRoutes = require('./stokKartiUrunTasiyici');
const malSatisKataloguRoutes = require('./malSatisKatalogu');

router.use('/urunYonetimiStokKarti', ureticiUrunRoutes);
router.use('/urunYonetimiStokKartiUrunTasiyici', ureticiUrunUrunTasiyiciRoutes);
router.use('/urunYonetimiMalAlisKatalogu', malSatisKataloguRoutes);

module.exports = router;
