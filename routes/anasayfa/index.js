const express = require('express');
const router = express.Router();

const duyurularRoutes = require('./anasayfaDuyuru');
const kesinSiparisRoutes = require('./anasayfaKesinSiparis');

router.use('/anasayfaDuyurular', duyurularRoutes);
router.use('/anasayfaKesinSiparis', kesinSiparisRoutes);

module.exports = router;
