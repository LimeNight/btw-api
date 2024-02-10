import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";
const carRouter = express.Router();

carRouter.get("/:_id/cars", async (req, res) => {
  let collection = db.aggregate([
    {
      $lookup: {
        from: "carRating",
        localField: "_id",
        foreignField: "carId",
        as: "ratedCars",
      },
    },
    {
      $unwind: "$Data",
    },
  ]);
  await collection
    .find({})
    .toArray()
    .then((response) => {
      res.send(response).status(200);
    })
    .catch((err) => {
      res.send(err).status(500);
    });
});

// get all cars
carRouter.get("/cars", async (req, res) => {
  try {
    let results = await db.collection("car").aggregate([
        {
          $lookup: {
            "from": "carRating",
            "localField": "_id",
            "foreignField": "carId",
            "as": "rate2"
          }
        }     
      ]).toArray();
      console.log(results)
    res.send(results).status(200);
  } catch (error) {
    res.send(error).status(500);
  }

});

// get car by id
carRouter.get("/cars/:id", async (req, res) => {
  // check the id length before trying to find
  if (req.params.id.length !== 24) {
    return res.send({ error: "Invalid ID" }).status(400);
  }

  let collection = db.collection("car");
  await collection
    .findOne(new ObjectId(req.params.id))
    .then((response) => {
      res.send(response).status(200);
    })
    .catch((err) => {
      res.send(err).status(500);
    });
});

carRouter.post("/cars/add", async (req, res) => {
  let collection = db.collection("car");
  if (req?.body) {
    await collection
      .insertOne(req.body)
      .then((response) => {
        res.send(response).status(200);
      })
      .catch((err) => {
        res.send(err).status(500);
      });
  }
});

carRouter.post("/cars/:id/rate", async (req, res) => {
  let { user_id, carId, rate } = req.body;
  //check the ids length
  if (carId.length !== 24 || user_id.length !== 24) {
    return res.send({ error: "Invalid ID" }).status(400);
  }
  //check the rate
  if (rate < 1 || rate > 5) {
    return res.send({ error: "Invalid rate" }).status(400);
  }
  //check the user
  let userCollection = db.collection("google_user");
  let isValidUser = await userCollection.findOne(new ObjectId(user_id));
  console.log(isValidUser);
  if (!isValidUser) {
    req.send({ error: "Invalid user" }).status(400);
  }
  //check if already rated
  let ratingCollection = db.collection("carRating");
  let alreadyRated = await ratingCollection.findOne({
    user_id: new ObjectId(user_id),
    carId: new ObjectId(carId),
  });
  if (alreadyRated) {
    return res.send({ error: "Already rated" }).status(400);
  }
  //rate the car
  await collection
    .insertOne({
      user_id: new ObjectId(user_id),
      carId: new ObjectId(carId),
      rate: rate,
    })
    .then((response) => {
      res.send(response).status(200);
    })
    .catch(() => {
      res.send("Something went wrong!").status(500);
    });
});

export default carRouter;
/**
 * ANOTHER ENDPOINT EXAMPLE
 */
//   router.get("/latest", async (req, res) => {
//     let collection = await db.collection("posts");
//     let results = await collection.aggregate([
//       {"$project": {"author": 1, "title": 1, "tags": 1, "date": 1}},
//       {"$sort": {"date": -1}},
//       {"$limit": 3}
//     ]).toArray();
//     res.send(results).status(200);
//   });
