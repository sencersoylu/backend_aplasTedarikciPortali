const express = require('express');
const router = express.Router();

const iletisimMerkeziDuyuruRoutes = require('./iletisimMerkeziDuyuru');
const iletisimMerkeziDuyuruEkRoutes = require('./iletisimMerkeziDuyuruEk');
const iletisimMerkeziDuyuruFotoRoutes = require('./iletisimMerkeziDuyuruFoto');

router.use('/iletisimMerkeziDuyuru', iletisimMerkeziDuyuruRoutes);
router.use('/iletisimMerkeziDuyuruEk', iletisimMerkeziDuyuruEkRoutes);
router.use('/iletisimMerkeziDuyuruFoto', iletisimMerkeziDuyuruFotoRoutes);

module.exports = router;
