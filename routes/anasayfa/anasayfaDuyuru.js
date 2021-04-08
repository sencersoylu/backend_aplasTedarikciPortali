const express = require('express');
const router = express.Router();
const db = require('../../models');

router.get('/', function (req, res, next) {
	
   db.sequelize.query("SELECT p.*, d.icerik as imageContent, d.turu as imageType FROM iletisim_merkezi_duyuru as p LEFT JOIN duyuru_fotolari as pd ON p.iletisimMerkeziDuyuruID = pd.iletisimMerkeziDuyuruID LEFT JOIN dosya as d ON d.dosyaID = pd.dosyaID  WHERE yayinBaslangicTarihi < NOW() AND yayinBitisTarihi > NOW() GROUP BY iletisimMerkeziDuyuruID ORDER BY FIELD(duyuruyuUsteAl, TRUE, FALSE), iletisimMerkeziDuyuruID DESC", { type: db.Sequelize.QueryTypes.SELECT })
		.then(projeL => {
            res.json(projeL.map(d => {
                if(d.imageContent){
                    d.imageContent = Buffer.from(d.imageContent).toString('base64');                    
                }
                return d;
            }));
        })
        .catch(error => {
            res.status(400).json(error);
        });
});

// paylaşıma ait ekleri getirir
router.get('/ekler/:duyuruID', async function (req, res) {

    try {
        const lokID = +req.params.duyuruID;

        if (!lokID) return res.status(400).json("gecersiz paylaşım id");

        db.sequelize.query("SELECT d.dosyaID, d.adi, d.turu FROM dosya as d LEFT JOIN duyuru_ekleri as pd ON pd.dosyaID = d.dosyaID WHERE pd.iletisimMerkeziDuyuruID ="+lokID, { type: db.Sequelize.QueryTypes.SELECT })
		.then(result => {
            res.json(result);
        })
		.catch(error => {
            res.status(400).json(error);
        });


    } catch (e) {
        console.log(e);
    }

});

// ilgili dosya içeriğini getirir
router.get('/dosyaIcerik/:dosyaID', async function (req, res) {

    try {
        const lokID = +req.params.dosyaID;

        if (!lokID) return res.status(400).json("gecersiz dosya id");

        db.sequelize.query("SELECT d.* FROM dosya as d WHERE d.dosyaID = " + lokID, { type: db.Sequelize.QueryTypes.SELECT })
		.then(result => {
            const base64data = Buffer.from(result[0].icerik).toString('base64');
            
            res.json({
                content: base64data,
                type: result[0].turu, // mimetype
                name: result[0].adi
            });
        })
		.catch(error => res.status(400).json(error));


    } catch (e) {
        console.log(e);
    }

});



module.exports = router;