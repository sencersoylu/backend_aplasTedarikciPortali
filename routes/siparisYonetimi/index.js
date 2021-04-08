const express = require('express');
const router = express.Router();

const kesinSiparisRoutes = require('./kesinSiparis');
router.use('/siparisYonetimiKesinSiparis', kesinSiparisRoutes);

const kesinSiparisDetayRoutes = require('./kesinSiparisDetay');
router.use('/siparisYonetimiKesinSiparisDetay', kesinSiparisDetayRoutes);

const kesinSiparisDurumRoutes = require('./kesinSiparisDurum');
router.use('/siparisYonetimiKesinSiparisDurum', kesinSiparisDurumRoutes);


module.exports = router;
