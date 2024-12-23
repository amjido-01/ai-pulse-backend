import express from "express";
import  {Request, Response, NextFunction} from "express"
import routes from "./routes/index"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
const corsOptions = {
  origin:"https://ai-pulse-frontend.vercel.app/auth/login",// Replace with your frontend URL, e.g., 'http://localhost:3000'
  credentials: true, // This allows the server to accept cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Add this middleware to set CORS headers for all responses
app.use((req: Request, res: Response, next: NextFunction)  => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return 
  }
  next();
});

app.use(routes)



app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API is running...");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })