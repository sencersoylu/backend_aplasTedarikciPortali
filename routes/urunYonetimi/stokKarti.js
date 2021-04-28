const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');

const table = "urun_yonetimi_uretici_urun";
const keyExpr = "urunYonetimiUreticiUrunID";

router.post('/boxGenelUrunTasiyici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT t.*, CONCAT('[ ',kodu,' ] ', adi) as koduAdi  FROM ${table} as t ORDER BY kodu, adi ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT t.*, CONCAT('[ ',kodu,' ] ', adi) as koduAdi  FROM ${table} as t WHERE t.${keyExpr} = '${filterData.ID}'`;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });



});

router.post('/boxIrsaliyeDetay', async function (req, res) {

    const filterData = req.body;

    let rawQuery;


    rawQuery = `
        
SELECT
	kat.tedarikciUrunKodu, 
	stok.adi as urunAdi,
	stok.kodu as urunKodu,
    stok.urunYonetimiUreticiUrunID
FROM
	siparis_yonetimi_kesin_siparis AS sip
LEFT JOIN urun_yonetimi_mal_alis_katalogu AS kat ON sip.tedarikciFirmaID = kat.tedarikciFirmaID
LEFT JOIN kullanici_firma_kullanici as kfk ON kfk.kullaniciFirmaID = sip.ureticiFirmaID
LEFT JOIN ${table} AS stok ON stok.${keyExpr} = kat.${keyExpr}
WHERE stok.${keyExpr} = '${filterData.ID}'`;

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/boxKesinSiparisDetay', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `
SELECT
	kat.tedarikciUrunKodu, 
	stok.adi as urunAdi,
	stok.kodu as urunKodu,
    stok.urunYonetimiUreticiUrunID,
    stok.genelOlcuBirimiID
FROM
	siparis_yonetimi_kesin_siparis AS sip
LEFT JOIN urun_yonetimi_mal_alis_katalogu AS kat ON sip.tedarikciFirmaID = kat.tedarikciFirmaID
LEFT JOIN kullanici_firma_kullanici as kfk ON kfk.kullaniciFirmaID = sip.ureticiFirmaID
LEFT JOIN ${table} AS stok ON stok.${keyExpr} = kat.${keyExpr}
WHERE
	sip.siparisYonetimiKesinSiparisID = '${filterData.siparisID}' 
AND kfk.kullaniciFirmaAdresID = stok.kullaniciFirmaAdresID
        `;

    } else { // tek kayıt
        rawQuery = `
        
SELECT
	kat.tedarikciUrunKodu, 
	stok.adi as urunAdi,
	stok.kodu as urunKodu,
    stok.urunYonetimiUreticiUrunID,
    stok.genelOlcuBirimiID

FROM
	siparis_yonetimi_kesin_siparis AS sip
LEFT JOIN urun_yonetimi_mal_alis_katalogu AS kat ON sip.tedarikciFirmaID = sip.tedarikciFirmaID
LEFT JOIN kullanici_firma_kullanici as kfk ON kfk.kullaniciFirmaID = sip.ureticiFirmaID
LEFT JOIN ${table} AS stok ON stok.${keyExpr} = kat.${keyExpr}
WHERE stok.${keyExpr} = '${filterData.ID}'`;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/boxMalAlisKatalogu', async function (req, res) {

    const filterData = req.body;
    const adresID = filterData.adresID;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT t.* FROM ${table} as t WHERE kullaniciFirmaAdresID = '${adresID}' ORDER BY kodu, adi ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT t.* FROM ${table} as t WHERE t.${keyExpr} = '${filterData.ID}'`;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;

        let rawQuery = `SELECT t.*, adr.kisaKodu as lokasyon FROM ${table} as t LEFT JOIN kullanici_firma_adres as adr ON adr.kullaniciFirmaAdresID = t.kullaniciFirmaAdresID ORDER BY t.createdAt DESC`;

        await crudHelper.getListR({
            data: filterData,
            rawQuery: rawQuery
        }, (data, err) => {
            if (data) {
                res.json(data);
            }

            if (err) {
                console.error(err);
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/create', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                console.error(err)
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/get', async function (req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.status(200).json(data);
        }

        if (err) {
            console.error(err);
            res.status(400).json(err);
        }
    });

});

router.post('/update', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        await crudHelper.updateR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                console.error(err);
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        await crudHelper.deleteR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }

});

module.exports = router;