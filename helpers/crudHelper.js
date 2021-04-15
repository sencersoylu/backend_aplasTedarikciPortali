const tdb = require('../models');
const queryHelper = require('../helpers/queryHelper');
const utils = require('./utils');
const { v4: uuidv4 } = require('uuid');

// for mysql
const getListR = async (dd, callbackFunc) => {

    try {

        let db;

        if (dd.db) {
            db = {};
            db.sequelize = dd.db;
            db.Sequelize = dd.db;

        } else {
            db = {};
            db = tdb;
        }

        let filteredQuery = queryHelper.createFilteredQueryString(dd.data, dd.rawQuery);
        let filteredQueryWithSummary = queryHelper.createSummaryQueryString(dd.data, dd.rawQuery);
        let countQuery = queryHelper.createRecordCountQueryString(dd.data, dd.rawQuery);

        let totalCount = 0;
        let data;
        let summaries;

        if (countQuery) {
            await db.sequelize.query(countQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(d => {
                    totalCount = d[0].totalCount;
                })
        }

        if (filteredQueryWithSummary) {
            await db.sequelize.query(filteredQueryWithSummary, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(d => {
                    summaries = d[0];
                })
        }

        await db.sequelize.query(filteredQuery, {
            type: db.Sequelize.QueryTypes.SELECT
        })
            .then(d => {

                const groupKey = dd.data.group;
                if (groupKey) {
                    data = utils.groupBy(d, groupKey);
                }
                else {
                    data = d;
                }

            })


        callbackFunc({
            data: data,
            totalCount: countQuery ? totalCount : undefined,
            summary: summaries ? Object.values(summaries) : undefined
        }, null);

    } catch (error) {
        console.error("HATAAAAAAAA:::::::::::::::::::", error);
        callbackFunc(null, error);
    }

}

const getR = async (d, callbackFunc) => {

    let db;

    if (d.db) {
        db = {};
        db.sequelize = d.db;
        db.Sequelize = d.db;

    } else {
        db = {};
        db = tdb;
    }

    try {

        const id = d.body.ID;

        if (!id) {
            callbackFunc(null, "geçersiz id");
        } else {

            const result = await db[d.table].findOne({
                where: {
                    [d.keyExpr]: id
                },
                raw: true
            });

            if (!result) {
                callbackFunc(null, "kayıt bulunamadı")
            } else {
                callbackFunc(result, null);
            }

        }

    } catch (e) {
        callbackFunc(null, e);
    }

}

const updateR = async (d, callbackFunc) => {

    let db;

    if (d.db) {
        db = {};
        db.sequelize = d.db;
        db.Sequelize = d.db;

    } else {
        db = {};
        db = tdb;
    }

    const id = d.body.userData.ID;
    const data = d.body.data;
    const userID = d.body.userData.userID;

    data["updatedUserID"] = userID;
    delete data["createdAt"];

    try {
        const result = await db[d.table].update(
            data, {
            where: {
                [d.keyExpr]: id
            }
        }
        )

        callbackFunc(result, null);

    } catch (err) {

        callbackFunc(null, err);
    }


}

const createR = async (d, callbackFunc) => {

    let db;

    if (d.db) {
        db = {};
        db.sequelize = d.db;
        db.Sequelize = d.db;

    } else {
        db = {};
        db = tdb;
    }

    const data = d.body.data;
    const userID = d.body.userData.userID;

    data["createdUserID"] = userID;

    if (d.parentKeyExpr) {
        data[d.parentKeyExpr] = d.body.userData.parentID;
    }

    db[d.table].create(data).then(async (resp) => {
        await callbackFunc(resp, null);

    }).catch(async err => {
        await callbackFunc(null, err);
    })

}

const deleteR = async (d, callbackFunc) => {

    let db;

    if (d.db) {
        db = {};
        db.sequelize = d.db;
        db.Sequelize = d.db;

    } else {
        db = {};
        db = tdb;
    }

    const id = d.body.ID;

    if (!id) {
        throw "geçersiz id";
    } else {
        const willBeDeletedProje = await db[d.table].findOne({
            where: {
                [d.keyExpr]: id
            },
            raw: true
        })
            .catch(e => {
                callbackFunc(null, "silinecek kayıt aranırken hatayla karşılaşıldı!");
                return;
            });

        if (!willBeDeletedProje) {
            throw "kayıt bulunamadı";
        } else {
            await db[d.table].destroy({
                where: {
                    [d.keyExpr]: id
                }
            })
                .then(() => {
                    callbackFunc("OK", null);
                })
                .catch(err => {
                    if (err.original.errno == 1451) {
                        callbackFunc(null, "İlişkili kayıtları sildikten sonra silme işlemini deneyiniz!");
                    } else {
                        callbackFunc(null, err);
                    }
                })
        }


    }


}

// *****************************************************************************
// sql server 
const getListR_2 = async (dd, callbackFunc) => {

    let db;

    try {
        if (dd.db) {
            db = {};
            db.sequelize = dd.db;
            db.Sequelize = dd.db;

        } else {
            db = {};
            db = tdb;
        }

        let filteredQuery = queryHelper.createFilteredQueryStringSqlServer(dd.data, dd.rawQuery);
        let filteredQueryWithSummary = queryHelper.createSummaryQueryStringSqlServer(dd.data, dd.rawQuery);
        let countQuery = queryHelper.createRecordCountQueryStringSqlServer(dd.data, dd.rawQuery);

        let totalCount = 0;
        let data;
        let summaries;

        if (countQuery) {
            await dd.db.query(countQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(d => {
                    totalCount = d[0].totalCount;
                })
        }

        // if (filteredQueryWithSummary) {
        //     await dd.db.query(filteredQueryWithSummary, {
        //         type: db.Sequelize.QueryTypes.SELECT
        //     })
        //         .then(d => {
        //             summaries = d[0];
        //         })
        // }

        await dd.db.query(filteredQuery, {
            type: db.Sequelize.QueryTypes.SELECT
        })
            .then(d => {
                data = d;
            })

        callbackFunc({
            data: data,
            totalCount: countQuery ? totalCount : undefined,
            summary: summaries ? Object.values(summaries) : undefined
        }, null);

    } catch (err) {
        callbackFunc(null, err);
    }

}

module.exports = {

    getR,
    getListR,
    updateR,
    createR,
    deleteR,

    getListR_2

};