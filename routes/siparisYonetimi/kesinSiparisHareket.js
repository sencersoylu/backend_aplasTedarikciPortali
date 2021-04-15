const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis_hareket";
const keyExpr = "siparisYonetimiKesinSiparisHareketID";
const parentKeyExpr = "siparisYonetimiKesinSiparisID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = filterData.userData.parentID;
    
    const userFirmaTurID = filterData.userData.userFirmaTurID;
    let fieldName;
    if(userFirmaTurID == 1){
        fieldName = "aliciFirmaDurum"
    }
    else if(userFirmaturID == 2){
        fieldName = "saticiFirmaDurum"
    }

    if (!parentID) {
        return res.status(400).json({
            validationError: "parent id boş olamaz!"
        });
    }

    let rawQuery = `
    
    SELECT
	a.*, (@rownum := @rownum + 1) AS sira
FROM
	(
		SELECT
			t.${keyExpr},
			t.createdAt AS islemTarihi,
			CONCAT(
				kul.kisiAdi,
				' ',
				kul.kisiSoyadi
			) AS personel,
            oper.adi as operasyon,
			oper.${fieldName} AS operasyonDurum,
			t.aciklama
		FROM
        ${table}  AS t
		LEFT JOIN kullanici AS kul ON kul.kullaniciID = t.createdUserID
		LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon AS oper ON oper.siparisYonetimiKesinSiparisOperasyonID = t.siparisYonetimiKesinSiparisOperasyonID
        WHERE t.${parentKeyExpr} = '${parentID}'
	) AS a,
	(SELECT @rownum := 0) r
ORDER BY
	sira DESC
    
    `;

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            return res.status(201).json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });


});

module.exports = router;