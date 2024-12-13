import express from "express";
import  {Request, Response} from "express"
import routes from "./routes/index"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
const port = process.env.PORT || 8080;

// app.use(cors({ origin: p, credentials: true }));
app.use(cookieParser());

app.use(cors({
  //origin: '*',
  origin: true,
  credentials: true
}))

app.use(express.json());


app.use(routes)

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API is running...");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })