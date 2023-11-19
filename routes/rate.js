import { ObjectId } from 'mongodb'
import db from '../db/conn.js'
import expres from 'express'

const rateRouter = expres.Router()

rateRouter.post('/rate/:carId', async (req, res) => {
    let collection = db.collection('carRating')
    let result = await collection.insertOne({
        user_id: new ObjectId(req.body.user_id),
        carId: new ObjectId(req.params.carId),
        rate: req.body.rate
    })
    res.send(result).status(200)
})

export default rateRouter