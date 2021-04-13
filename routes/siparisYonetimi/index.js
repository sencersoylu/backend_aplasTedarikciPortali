const express = require('express');
const router = express.Router();

const kesinSiparisRoutes = require('./kesinSiparis');
const kesinSiparisDetayRoutes = require('./kesinSiparisDetay');
const kesinSiparisDurumRoutes = require('./kesinSiparisDurum');
const kesinSiparisHareketRoutes = require('./kesinSiparisHareket');

router.use('/siparisYonetimiKesinSiparis', kesinSiparisRoutes);
router.use('/siparisYonetimiKesinSiparisDetay', kesinSiparisDetayRoutes);
router.use('/siparisYonetimiKesinSiparisDurum', kesinSiparisDurumRoutes);
router.use('/siparisYonetimiKesinSiparisHareket', kesinSiparisHareketRoutes);

module.exports = router;
