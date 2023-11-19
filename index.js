import './loadEnvironment.js'
import 'dotenv/config'
import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import carRouter from './routes/cars.js'
import authRouter from "./routes/auth.js"
import rateRouter from "./routes/rate.js"

const app = express()
const port = process.env.PORT || 5000

// Add middleware
app.use(express.urlencoded({ extended: false }))
app.use(cors({
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Add routes
app.use('/api/v1', carRouter)
app.use('/api/v1', authRouter)
app.use('/api/v1', rateRouter)

app.get('/', (req, res) => {
  res.send("Server is running").status(200)
})

app.all('*', (req, res) => {
  res.send("Not found!").status(404)
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})