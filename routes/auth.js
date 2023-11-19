import express from "express";
import db from "../db/conn.js";
import { OAuth2Client } from "google-auth-library";
const authRouter = express.Router();

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET,
  'postmessage'
)

authRouter.post("/auth/google", async (req, res) => {
  console.log(req.body)
  try {
    // exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(req.body.code); 
    // verify token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    // get payload from ticket
    const payload = await ticket.getPayload();
    //check if email is verified
    if (payload.email_verified === false) return res.send({ error: "Email not verified" }).status(400);
    //check if user exist
    let collection = db.collection("google_user");
    let existUser = await collection.findOne({ google_id: payload.sub });
    //if user exist return user
    if (existUser) return res.send(existUser).status(200);
    try {
      //if not exist create new user
      await collection.insertOne({
          google_id: payload.sub,
          name: payload?.name,
          email: payload.email,
          email_verified: payload.email_verified,
          picture: payload?.picture,
        })
    } catch (error) {
      return res.send(error).status(500);
    }
    res.send({
        google_id: payload.sub,
        name: payload?.name,
        email: payload.email,
        email_verified: payload.email_verified,
        picture: payload?.picture
      }).status(200);
  } catch (err) {
    return res.send(err).status(500);
  }
});

// authRouter.post("/auth/google/refresh-token", async (req, res) => {
//   try {
//     const user = new UserRefreshClient(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_SECRET,
//       req.body.refreshToken
//     );
//     // optain new tokens
//     const { credentials } = await user.refreshAccessToken()
//     res.json(credentials).status(200)
//   } catch (error) {
//     res.send(error).status(500)
//   }
// });

export default authRouter;
