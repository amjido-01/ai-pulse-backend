import express from "express";
import  {Request, Response} from "express"
import routes from "./routes/index"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Replace with your frontend URL, e.g., 'http://localhost:3000'
  credentials: true, // This allows the server to accept cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(express.json());
app.use(routes)



app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API is running...");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })