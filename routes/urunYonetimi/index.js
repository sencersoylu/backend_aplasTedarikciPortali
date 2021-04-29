const express = require('express');
const router = express.Router();

const ureticiUrunRoutes = require('./stokKarti');
const ureticiUrunUrunTasiyiciRoutes = require('./stokKartiUrunTasiyici');
const malAlisKataloguRoutes = require('./malAlisKatalogu');
const urunKapasiteRoutes = require('./urunKapasite');

router.use('/urunYonetimiStokKarti', ureticiUrunRoutes);
router.use('/urunYonetimiStokKartiUrunTasiyici', ureticiUrunUrunTasiyiciRoutes);
router.use('/urunYonetimiMalAlisKatalogu', malAlisKataloguRoutes);
router.use('/urunYonetimiUrunKapasite', urunKapasiteRoutes);

module.exports = router;
