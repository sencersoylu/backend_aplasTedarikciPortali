const express = require('express');
const router = express.Router();

const ureticiUrunRoutes = require('./stokKarti');
const ureticiUrunOlcuBirimiRoutes = require('./stokKartiOlcuBirimi');
const ureticiUrunUrunTasiyiciRoutes = require('./stokKartiUrunTasiyici');
const malSatisKataloguRoutes = require('./malSatisKatalogu');

router.use('/urunYonetimiStokKarti', ureticiUrunRoutes);
router.use('/urunYonetimiStokKartiOlcuBirimi', ureticiUrunOlcuBirimiRoutes);
router.use('/urunYonetimiStokKartiUrunTasiyici', ureticiUrunUrunTasiyiciRoutes);
router.use('/urunYonetimiMalSatisKatalogu', malSatisKataloguRoutes);

module.exports = router;
