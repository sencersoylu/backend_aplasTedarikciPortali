const express = require('express');
const router = express.Router();

const duyurularRoutes = require('./anasayfaDuyuru');

router.use('/anasayfaDuyurular', duyurularRoutes);

module.exports = router;
