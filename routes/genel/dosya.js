const express = require('express');
const router = express.Router();
const db = require('../../models');

router.get('/', function (req, res, next) {
	
   db.dosya.findAll({})
        .then(projeL => res.json({
            error: false,
            data: projeL
        }))
        .catch(error => res.json({
            error: true,
            data: [],
            error: error
        }));
});

router.get('/:id', async function (req, res) {

    try {
        const lokID = +req.params.id;

        if (!lokID) return res.status(400).json({
            data: [],
            error: "gecersiz dosya id"
        });

        const result = await db.dosya.findOne({
            where: {
                dosyaID: lokID
            },
            raw: true
        });

        if (!result) return res.status(400).json({
            data: [],
            error: "dosya bulunamadi"
        });

        return res.json({
            error: false,
            data: result
        })

    } catch (e) {
        console.log(e);
    }

});


router.put('/:id', async function (req, res, next) {

    const {
        id
    } = req.params;

    const {
        dosya
    } = req.body;

		
        db.dosya.update(
            dosya, {
                where: {
                    dosyaID: id
                }
            }
        )
		.then( result => res.json({
            error: false,
            data: result
        }))
		.catch (err => res.status(400).json({
            data: [],
            error: err
        }));

});


router.post('/', (req, res, next) => {
    const {
        dosya
    } = req.body;

    db.dosya
	.create(dosya)
	.then((l) => {
        return res.status(201).json({
            error: false,
            data: l
        })

    }).catch(err => {
        return res.status(400).json({
            data: [],
            error: err
        });
    })
});

router.delete('/:id', async function (req, res, next) {
    
	try{
        const {
            id
        } = req.params;

        if (!id) return res.status(400).json({
            data: [],
            error: "gecersiz dosya id"
        });

        const willBeDeleted = await db.dosya.findOne({
            where: {
                dosyaID: id
            },
            raw: true
        });

        if (!willBeDeleted) return res.status(400).json({
            data: [],
            error: "dosya bulunamadi"
        });

        db.dosya.destroy({
            where: {
                dosyaID: id
            }
        })
		.then(() => {
			
			 return res.json({
				error: false,
				data: {
					status: "OK"
				}
			})
		})
		.catch(err => {
			return res.status(400).json({
				data: [],
				error: err
			});
		})
	}
	catch(e){
		console.log(e);
	}

});

module.exports = router;