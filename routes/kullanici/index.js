const express = require('express');
const router = express.Router();

const kullaniciGenelMenuRoutes = require('./kullaniciGenelMenuYetki');
const kullaniciRoutes = require('./kullanici');
const kullaniciGrupRoutes = require('./kullaniciGrup');
const kullaniciGrupKullaniciRoutes = require('./kullaniciGrupKullanici');
const kullaniciGrupGenelMenuYetkiRoutes = require('./kullaniciGrupGenelMenuYetki');
const operasyonKullaniciGrupYetkiRoutes = require('./operasyonKullaniciGrupYetki');
const operasyonRoutes = require('./operasyon');

router.use('/kullaniciGenelMenuYetki', kullaniciGenelMenuRoutes);
router.use('/kullanici', kullaniciRoutes);
router.use('/kullaniciGrup', kullaniciGrupRoutes);
router.use('/kullaniciGrupKullanici', kullaniciGrupKullaniciRoutes);
router.use('/kullaniciGrupGenelMenuYetki', kullaniciGrupGenelMenuYetkiRoutes);
router.use('/operasyonYetki', operasyonKullaniciGrupYetkiRoutes);
router.use('/operasyon', operasyonRoutes);

module.exports = router;
