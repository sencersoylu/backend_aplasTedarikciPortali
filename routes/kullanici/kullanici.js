const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "kullanici";
const keyExpr = "kullaniciID";

const crudHelper = require('../../helpers/crudHelper');
const helperService = require('../../helpers/helperService');

router.post('/boxTedarikciFirmaKullanici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kisiAdi, kul.kisiSoyadi, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY adiSoyadi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kisiAdi, kul.kisiSoyadi, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.kullaniciUUID = '" + filterData.ID + "'";
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

router.post('/boxKullaniciFirmaKullanici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kisiAdi, kul.kisiSoyadi, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY adiSoyadi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kisiAdi, kul.kisiSoyadi, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.kullaniciUUID = '" + filterData.ID + "'";
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

router.post('/boxKullaniciFirmaAdres', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kisiAdi, kul.kisiSoyadi, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY adiSoyadi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kisiAdi, kul.kisiSoyadi, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.kullaniciUUID = '" + filterData.ID + "'";
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

router.post('/boxGenelIslemGrupKullanici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi, kul.ePosta, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY kul.kullaniciAdi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi, kul.ePosta, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.kullaniciUUID = '" + filterData.ID + "'";
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

router.post('/boxGenelKullaniciGrupKullanici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi, kul.ePosta, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY kul.kullaniciAdi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi, kul.ePosta, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul WHERE kul.kullaniciUUID = '" + filterData.ID + "'";
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


router.post('/boxGenelIslemGrupKullanici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY kul.kullaniciAdi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi FROM kullanici as kul WHERE kul.kullaniciUUID = " + filterData.ID;
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

// tüm aktif kullanıcıları alfabetik sıralamada getirir
router.get('/', function (req, res) {

    db.sequelize.query("SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi FROM kullanici as kul WHERE kul.aktifMi = 1 ORDER BY kul.kisiAdi ASC, kul.kisiSoyadi ASC", {
        type: db.Sequelize.QueryTypes.SELECT
    })
        .then(users => {
            res.json( users);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json("zktif kullanıcılar alınırken hatayla karşılaşıldı!");
        });
});

// kullanici id kullanılarak kullanıcının tüm yetkili olduğu menuleri getirir
router.post('/menuYetkileri', async function (req, res) {


    const id = req.body.userData.userID;

    if (!id) return res.status(400).json("gecersiz kullanici id");


    db.sequelize.query("SELECT m.genelMenuID, m.adi, m.genelMenuParentID,m.siraNo,m.path,m.iconName, y.ekleyebilir, y.silebilir, y.duzenleyebilir, y.gorebilir FROM genel_menu as m LEFT JOIN kullanici_genel_menu_yetki as y ON m.genelMenuID = y.genelMenuID WHERE y.kullaniciID = '" + id + "' ORDER BY m.genelMenuID", {
        type: db.Sequelize.QueryTypes.SELECT
    })
        .then(kulllaniciMenuYetkileri => {

            db.sequelize
                .query("SELECT m.genelMenuID, m.adi, m.genelMenuParentID, m.siraNo, m.path, m.iconName, max(y.ekleyebilir) as ekleyebilir, max(y.silebilir) as silebilir, max(y.duzenleyebilir) as duzenleyebilir, max(y.gorebilir) as gorebilir FROM genel_menu AS m JOIN kullanici_grup_genel_menu_yetki AS y ON m.genelMenuID = y.genelMenuID WHERE y.kullaniciGrupID IN ( SELECT kullaniciGrupID FROM kullanici_grup_kullanici WHERE kullaniciID = '" + id + "' ) GROUP BY y.genelMenuID ORDER BY m.genelMenuID", {
                    type: db.Sequelize.QueryTypes.SELECT
                })
                .then(grupMenuYetkileri => {

                    let distinctMenuList = [];

                    distinctMenuList = distinctMenuList.concat(kulllaniciMenuYetkileri);


                    grupMenuYetkileri.forEach(gy => {
                        const matchedMenuYetki = kulllaniciMenuYetkileri.filter(ky => ky.genelMenuID == gy.genelMenuID);

                        if (matchedMenuYetki.length == 0) {
                            distinctMenuList.push(gy);
                        }

                    });

                    res.json(
                        distinctMenuList
                    )
                })

                .catch(error => res.status(400).json(
                    error
                ));
        })
        .catch(error => res.status(400).json(error));
});

router.post('/getList', async function (req, res) {

    const filterData = req.body;

    let rawQuery = "SELECT kul.kullaniciUUID as UserId, kul.kullaniciAdi, kul.ePosta, kul.sonGirisZamani, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) as adiSoyadi FROM kullanici as kul ORDER BY kul." + keyExpr + " DESC";

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

router.post('/get', async function (req, res) {

    const userUUID = req.body.ID;
    if (!userUUID) {
        res.status(400).json({ validationError: "kullanıcı id boş olamaz!" });
        return;
    }

    db.sequelize.query("SELECT kullaniciUUID as userID, kullaniciAdi, sifre, ePosta, aktifMi FROM " + table + " WHERE kullaniciUUID = :userID LIMIT 1", {
        type: db.Sequelize.QueryTypes.SELECT, replacements: {
            userID: req.body.ID
        }
    })
        .then(users => {
            if (users.length == 0) {
                res.status(400).json({ validationError: "kullanıcı bulunamadı!" })
            }
            else {
                res.json(users[0]);
            }
        })
        .catch(e => {
            res.status(400).json(e);
        })

});

router.post('/update', async function (req, res) {

    const userUUID = req.body.data.userID;
    if (!userUUID) {
        res.status(400).json({ validationError: "kullanıcı id boş olamaz!" });
        return;
    }

    try {

        const users = await db.sequelize.query("SELECT * FROM " + table + " WHERE kullaniciUUID = :userID LIMIT 1", {
            type: db.Sequelize.QueryTypes.SELECT, replacements: {
                userID: userUUID
            }
        })

        if (users.length == 0) {
            res.status(400).json({ validationError: "kullanıcı bulunamadı!" });
            return;
        }

        const data = req.body.data;

        if (data["kullaniciAdi"]) {

            const existUserName = await db.sequelize.query("SELECT * FROM " + table + " WHERE aktifMi = 1 AND kullaniciAdi = :userName AND kullaniciUUID != :userUUID LIMIT 1", {
                type: db.Sequelize.QueryTypes.SELECT, replacements: {
                    userName: data["kullaniciAdi"],
                    userUUID: userUUID
                }
            });

            if (existUserName.length > 0) {
                res.status(400).json({ validationError: "aynı kullanıcı ismine sahip kullanıcı mevcut!" });
                return;
            }

        }

        data['updatedUserID'] = req.body.userData.userID;

        await db[table].update(
            data, {
            where: {
                kullaniciUUID: userUUID
            }
        });
        
        res.json("OK");

    } catch (e) {

        res.status(400).json(e);
    }


});

router.post('/create', async function (req, res) {

    try {

        const data = req.body.data;

        if (!data["kullaniciAdi"] && !data["sifre"]) {

            res.status(400).json({ validationError: "kullanıcı adı ve şifre boş olamaz!" });
            return;
        }

        const existUserName = await db.sequelize.query("SELECT * FROM " + table + " WHERE aktifMi = 1 AND kullaniciAdi = :userName LIMIT 1", {
            type: db.Sequelize.QueryTypes.SELECT, replacements: {
                userName: data["kullaniciAdi"]
            }
        });

        if (existUserName.length > 0) {
            res.status(400).json({ validationError: "aynı kullanıcı ismine sahip kullanıcı mevcut!" });
            return;
        }

        if (data["genelKisiID"]) {

            const existPersonel = await db.sequelize.query("SELECT * FROM " + table + " WHERE aktifMi = 1 AND genelKisiID = :personelID LIMIT 1", {
                type: db.Sequelize.QueryTypes.SELECT, replacements: {
                    personelID: data["genelKisiID"]
                }
            });

            if (existPersonel.length > 0) {
                res.status(400).json({ validationError: "personele ait kullanıcı zaten mevcut!" });
                return;
            }

        }

        // uuid_v4() -> db de kendi tanımımıza oluşturuğumuz kayıtlı fonksiyon
        const newUUID = await db.sequelize.query("SELECT uuid_v4() as uuid", { type: db.Sequelize.QueryTypes.SELECT });
        data['kullaniciUUID'] = newUUID[0].uuid;

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(201).json(data);

                try {
                    // personeleBilgiMailiGonder(data);
                } catch (err) {
                    console.log(err);
                }

            }

            if (err) {
                res.status(400).json(err);
            }
        });


    } catch (e) {
        res.status(400).json(e);
    }

});

router.post('/delete', async function (req, res) {

    const userUUID = req.body.ID;
    if (!userUUID) {
        res.status(400).json({ validationError: "kullanıcı id boş olamaz!" });
        return;
    }

    try {

        const users = await db.sequelize.query("SELECT * FROM " + table + " WHERE kullaniciUUID = :userID LIMIT 1", {
            type: db.Sequelize.QueryTypes.SELECT, replacements: {
                userID: userUUID
            }
        })
        if (users.length == 0) {
            res.status(400).json({ validationError: "kullanıcı bulunamadı!" })
        }
        else {
            await db.sequelize.query("DELETE FROM " + table + " WHERE kullaniciUUID = :userID", {
                type: db.Sequelize.QueryTypes.DELETE, replacements: {
                    userID: userUUID
                }
            });

            res.json("OK");
        }

    } catch (e) {

        res.status(400).json(e);
    }

});

router.post('/sifreDegistir', async function (req, res) {

    const data = req.body;
    const userUUID = data.userData.userID;
    if (!userUUID) {
        res.status(400).json({ validationError: "kullanıcı id boş olamaz!" });
        return;
    }

    try {

        const users = await db.sequelize.query("SELECT * FROM " + table + " WHERE kullaniciUUID = :userID LIMIT 1", {
            type: db.Sequelize.QueryTypes.SELECT, replacements: {
                userID: userUUID
            }
        });

        if (users.length == 0) {
            res.status(400).json({ validationError: "kullanıcı bulunamadı!" })
            return;
        }

        const user = users[0];

        if (user.sifre != data.oldPassword) {
            res.status(400).json({ validationError: "eski şifreniz uyuşmamaktadır!" });
            return;
        }

        if (data.newPassword != data.newPasswordCheck) {
            res.status(400).json({ validationError: "şifreler uyuşmamaktadır!" });
            return;
        }

        await db.sequelize.query("UPDATE " + table + " SET sifre = :sifre WHERE kullaniciUUID = :userID", {
            type: db.Sequelize.QueryTypes.UPDATE, replacements: {
                userID: userUUID,
                sifre: data.newPassword
            }
        });

        res.json("OK");

    } catch (e) {

        res.status(400).json(e);
    }

});



function personeleBilgiMailiGonder(data) {
    try {

        if (!data || !data.ePosta) {
            return;
        }

        let toAddress = data.ePosta;
        let subject = 'Portal: Kullanıcı Bilgileri Hk.';
        let htmlMessage =
            `
     <div class=WordSection1>
     <p class=MsoNormal>
        Merhaba,
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif;mso-fareast-language:TR'>
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif'>
           A-Plas Portalda adınıza kullanıcı oluşturulmuştur.
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif'>
           Portala aşağıdaki bilgiler ile erişim sağlayabilirsiniz.
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif;color:#003572'>
        </span>
     </p>
     <p class=MsoNormal>
        <b><span style='font-family:"Arial",sans-serif;color:red'>Kullanıcı Adı:</span></b><span style='font-family:"Arial",sans-serif;color:red'> </span>
        <span style='font-family:"Arial",sans-serif'>
           &nbsp;${data.kullaniciAdi}
        </span>
     </p>
     <p class=MsoNormal>
        <b><span style='font-family:"Arial",sans-serif;color:red'>Geçici Şifre:</span></b><span style='font-family:"Arial",sans-serif;color:red'> </span>
        <span style='font-family:"Arial",sans-serif'>
           &nbsp;${data.sifre}
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif'>
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif'>
           Şifrenizi değiştirmeyi unutmayınız.
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif'>
           İyi Çalışmalar
           </br>
           A-Plas Portal
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif'>
        </span>
     </p>
     <p class=MsoNormal>
        <span style='font-family:"Arial",sans-serif;color:#4472C4'>
           **********************************************************************************
        </span>
     </p>
     <p class=MsoNormal>
        <b>
           <span style='font-family:"Arial",sans-serif;color:red'>
              PORTAL HAKKINDA GENEL BİLGİLENDİRME;
           </span>
        </b>
     </p>
     <ol style='margin-top:0cm' start=1 type=1>
        <li class=MsoListParagraph style='margin-left:0cm;mso-list:l0 level1 lfo1'>
           <span style='font-family:"Arial",sans-serif;mso-fareast-language:EN-US'>
              A-Plas Bilgi İşlem Portalı&#8217;na herhangi bir program yüklemesi gerektirmeden tarayıcı üzerinden doğrudan erişebilirsiniz.
           </span>
        </li>
        <li class=MsoListParagraph style='margin-left:0cm;mso-list:l0 level1 lfo1'>
           <span style='font-family:"Arial",sans-serif;mso-fareast-language:EN-US'>
              Tarayıcı olarak <b><i><span style='color:red'>&#8220;Google Chrome&#8221;</span></i></b><span style='color:red'> </span>kullanmanız tavsiye edilmektedir.
           </span>
        </li>
        <li class=MsoListParagraph style='margin-left:0cm;mso-list:l0 level1 lfo1'>
           <span style='font-family:"Arial",sans-serif;mso-fareast-language:EN-US'>
              Yetkili olduğunuz sayfaların yüklenmesi için <b><i><span style='color:red'>şirket internetine</span></i></b><span style='color:red'> </span>bağlı olduğunuzdan emin olunuz.
           </span>
        </li>
        <li class=MsoListParagraph style='margin-left:0cm;mso-list:l0 level1 lfo1'>
           <b><span style='font-family:"Arial",sans-serif;color:red;mso-fareast-language:EN-US'>&#8220;</span></b><b><span style='font-family:"Arial",sans-serif;color:red'><a href="http://portal.a-plasltd.com.tr/"><span style='color:red'>portal.a-plasltd.com.tr/</span></a></span></b><b><span style='font-family:"Arial",sans-serif;color:red;mso-fareast-language:EN-US'>&#8221;</span></b><span style='font-family:"Arial",sans-serif;color:red;mso-fareast-language:EN-US'> </span>
           <span style='font-family:"Arial",sans-serif;mso-fareast-language:EN-US'>
              adresini tarayıcınızın arama çubuğuna yazıp <b><i><span style='color:red'>&#8220;enter&#8221;</span></i></b> tuşuna basınız.
           </span>
        </li>
        <li class=MsoListParagraph style='margin-left:0cm;mso-list:l0 level1 lfo1'>
           <span style='font-family:"Arial",sans-serif;mso-fareast-language:EN-US'>
              Kullanıcı adınız veya şifreniz yoksa veya hatırlamıyorsanız <u><span style='color:red'>Bilgi İşlem Müdürlüğü</span></u><span style='color:red'> </span>ile iletişime geçiniz.
           </span>
        </li>
        <li class=MsoListParagraph style='margin-left:0cm;mso-list:l0 level1 lfo1'>
           <span style='font-family:"Arial",sans-serif;mso-fareast-language:EN-US'>
              Portal üzerinde hali hazırda kullanımda bulunan 17 modül ve ortalama 170 form sayfası bulunmaktadır. Menü listesi ek olarak eklenmiştir. Menülerde eksiklik var ise yetki verilmesi için <u><span style='color:red'>Bilgi İşlem Müdürlüğü</span></u><span style='color:red'> </span>ile iletişime geçiniz. 
           </span>
        </li>
     </ol>
  </div>
`;
        let attachments = [];

        helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
            if (error) {
                console.log(error);
            }
        });

    } catch (err) {
        throw err;
    }
}

module.exports = router;