const express = require('express');
const router = express.Router();

const anasayfaRoutes = require('./anasayfa');
const genelRoutes = require('./genel');
const kullaniciRoutes = require('./kullanici');
const siparisYonetimiRoutes = require('./siparisYonetimi');
const urunYonetimiRoutes = require('./urunYonetimi');
const sevkiyatYonetimiRoutes = require('./sevkiyatYonetimi');
const iletisimMerkeziRoutes = require('./iletisimMerkezi');
const kaliteYonetimiRoutes = require('./kaliteYonetimi');

router.use([
	anasayfaRoutes, 
	genelRoutes, 
	kullaniciRoutes, 
	siparisYonetimiRoutes, 
	urunYonetimiRoutes,
	sevkiyatYonetimiRoutes,
	iletisimMerkeziRoutes,
	kaliteYonetimiRoutes
]);

module.exports = router;
