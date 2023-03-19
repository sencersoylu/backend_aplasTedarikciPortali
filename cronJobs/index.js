const configs = require('../config/config.json');

const sendMail = require('./sendMail');
const tedarikciFirmalar = require('./tedarikciFirmalar');
const stokKartlari = require('./stokKartlari');
const malAlisKataloglari = require('./malAlisKataloglari');
const kesinSiparisler = require('./kesinSiparisler');
const tedarikciSiparisBakiyeKontrol = require('./tedarikciSiparisBakiyeKontrol');
const tedarikciSiparisTeyitKontrol = require('./tedarikciSiparisTeyitKontrol');
const tedarikciSendikaUyesiKontrol = require('./tedarikciSendikaUyesiKontrol');
const tedarikciSertifikaGecerlilikKontrol = require('./tedarikciSertifikaGecerlilikKontrol');
const tedarikciSertifikaBelgesiKontrol = require('./tedarikciSertifikaBelgesiKontrol');
// const malzemeTasiyicilari = require('./malzemeTasiyicilari');


const starter = setTimeout(() => {
        
        tedarikciFirmalar();
        stokKartlari();
        malAlisKataloglari();
        kesinSiparisler();

    if (configs.startupMode != "test") {

        //sendMail();
        //tedarikciFirmalar();
        //stokKartlari();
        //malAlisKataloglari();
        //kesinSiparisler();
        //tedarikciSiparisTeyitKontrol();
        //tedarikciSiparisBakiyeKontrol();
        //tedarikciSendikaUyesiKontrol();
        //tedarikciSertifikaGecerlilikKontrol();
        //tedarikciSertifikaBelgesiKontrol();
        // malzemeTasiyicilari();



    }



}, 10000); // run crons after 6 seconds


module.exports = starter;