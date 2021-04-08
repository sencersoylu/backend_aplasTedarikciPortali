const axios = require('axios');
const moment = require('moment');

// verilen bir dizide, belirtilen alana göre gruplama yapıp sonucu belirli formatta dönderir
// format:  [{key: group1Value , items: group1Items },{key: group2Value , items: group2Items }, ....]
const groupBy = (array, field) => {
    let groupedData = array.reduce(function (rv, x) {
        (rv[x[field]] = rv[x[field]] || []).push(x);
        return rv;
    }, {});

    return Object.keys(groupedData).map(value => {
        return {
            key: value,
            items: groupedData[value]
        }
    })
}

// verilen milisaniye cinsinden zaman değerinin kaç saat , dakika ve saniye ettiğini hesaplayıp metinsel olarak çevirir 
const millisecondsToHourMinuteSecond = (milliseconds) => {

    let seconds = Math.floor(Number(milliseconds) / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    const hDisplay = h > 0 ? h + " saat, " : "";
    const mDisplay = m > 0 ? m + " dakika, " : "";
    const sDisplay = s > 0 ? s + " saniye " : "";

    return hDisplay + mDisplay + sDisplay;
}

const sorting = (array, fieldName, type) => {

    if (type === 'asc') {
        array.sort(function (a, b) {
            return a[fieldName] - b[fieldName];
        });
    } else if (type === 'desc') {
        array.sort(function (a, b) {
            return b[fieldName] - a[fieldName];
        });
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////

/*   HES KODU sorgulama fonksiyonları   */
// const testServiceBaseAddress = "https://hesservis.turkiye.gov.tr/services/g2g/test/saglik/hes/";
// const testUserName = "A-PLASOTOMOTİV-TEST";
// const testUserPassword = "48McCpHiSEQF5hsUyg";

const canliServisBaseAddress = "https://hesservis.turkiye.gov.tr/services/g2g/saglik/hes/";
const canliUserName = "A-PLASOTOMOTİV-G2G-HES";
const canliUserPassword = "foMDqf5blNotwScOJy";

const decodeErrorMessage = (errorKey) => {
    if (errorKey == "hescodenotfound") {
        return {
            message: "Hes kodu bulunamadı",
            kod: 3
        };
    } else if (errorKey == "hescodehasbeenexpired") {
        return {
            message: "Hes kodunun süresi dolmuştur",
            kod: 4
        };
    }
}

const decodeRiskyStatus = (riskyEnum) => {
    if (riskyEnum == "RISKY") {
        return {
            message: "Riskli",
            kod: 1
        };
    } else if (riskyEnum == "RISKLESS") {
        return {
            message: "Risksiz",
            kod: 2
        };
    }
}

const splitarray = (input, spacing) => {
    let output = [];

    for (var i = 0; i < input.length; i += spacing) {
        output[output.length] = input.slice(i, i + spacing);
    }

    return output;
}

const maxQueriableHesCodeAmount = 500;

const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json"
    },
    auth: {
        username: canliUserName,
        password: canliUserPassword
    }
};

const hesKoduSorgula = async (hesKoduBarkod) => {

    let hesKodu = hesKoduBarkod.replace(/[^a-zA-Z0-9]/g, '');
    hesKodu = hesKodu.substr(hesKodu.length - 10);

    const postData = {
        hes_code: hesKodu
    };

    return axios
        .post(canliServisBaseAddress + "check-hes-code", postData, axiosConfig)
        .then(response => {

            console.log("tek sorgulama response: ", response.data);

            const messageKod = decodeRiskyStatus(response.data["current_health_status"]);
            return {
                data: {
                    kimlikNo: response.data["masked_identity_number"],
                    adi: response.data["masked_firstname"],
                    soyadi: response.data["masked_lastname"],
                    riskDurumu: messageKod.message,
                    riskDurumKodu: messageKod.kod,
                    sonGecerlilikTarihi: moment(response.data["expiration_date"]).toDate(),
                    sorgulamaTarihi: moment().toDate(),
                    hesKodu: hesKodu
                },
                customError: null
            };


        })
        .catch(async error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const errData = error.response.data;
                if (errData.status == 400) {

                    const messageKod = decodeErrorMessage(errData.errorKey);

                    console.log("tek sorgulama error: ", messageKod.message);
                    return {
                        data: null,
                        customError: {
                            hataAciklama: messageKod.message,
                            hataKodu: messageKod.kod,
                            gecerlilikTarihi: moment(errData["expiration_date"]).toDate()
                        }
                    };


                }
                // console.log(error.response.data);
                // console.log(error.response.status);
                // console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
                throw error.toJSON();

            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
                throw error.toJSON();
            }
            //   console.log(error.config);
        });

}

const hesKoduTopluSorgula = async (hesKodlari) => {

    if (!hesKodlari || hesKodlari.length == 0) {
        return Promise.resolve([]);
    }

    const parts = splitarray(hesKodlari, maxQueriableHesCodeAmount);
    let results = [];


    return Promise.all(parts.map(part => {

            const postData = part.map(hesKoduBarkod => {
                let hesKodu = hesKoduBarkod.replace(/[^a-zA-Z0-9]/g, '');
                hesKodu = hesKodu.substr(hesKodu.length - 10);

                return {
                    hes_code: hesKodu
                }
            });

            return axios
                .post(canliServisBaseAddress + "check-hes-codes", postData, axiosConfig)
                .then(response => {

                    // success kodlar
                    const successData = response.data["success_map"];
                    console.log(successData);

                    const successResults = Object.keys(successData).map(key => {

                        const hesCodeResponse = successData[key];
                        const messageKod = decodeRiskyStatus(hesCodeResponse["current_health_status"]);

                        return {
                            data: {
                                kimlikNo: hesCodeResponse["masked_identity_number"],
                                adi: hesCodeResponse["masked_firstname"],
                                soyadi: hesCodeResponse["masked_lastname"],
                                durumKodu: messageKod.kod,
                                durumAciklama: messageKod.message,
                                sonGecerlilikTarihi: moment(hesCodeResponse["expiration_date"]).toDate(),
                                sorgulamaTarihi: moment().toDate(),
                                hesKodu: key
                            },
                            customError: null
                        };

                    });

                    //  unsuccess kodlar
                    const unsuccessData = response.data["unsuccess_map"];
                    const unsuccessResults = Object.keys(unsuccessData).map(key => {

                        const hesCodeResponse = unsuccessData[key];
                        const messageKod = decodeErrorMessage(hesCodeResponse);

                        return {
                            data: null,
                            customError: {
                                durumKodu: messageKod.kod,
                                durumAciklama: messageKod.message,
                                hesKodu: key
                            }
                        }


                    });


                    results = results.concat(successResults, unsuccessResults);


                })
                .catch(error => {
         
                    console.log('Error', error);
                    throw error;

                });

        }))
        .then(d => {
            return results;
        })
        .catch(err => {
            // console.log(err);
            throw err;

        })


}

/////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = {
    groupBy,
    millisecondsToHourMinuteSecond,
    sorting,
    hesKoduSorgula,
    hesKoduTopluSorgula
};