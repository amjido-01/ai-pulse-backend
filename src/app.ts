import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index";

// app instance
const app = express();
const port = process.env.PORT || 8080;

// CORS Configuration 
const corsOptions = {
  origin:   "https://ai-pulse-frontend.vercel.app", //"http://localhost:3000", // Replace with your frontend URL
  credentials: true, // Allow server to accept cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); 
app.use(cookieParser()); 


// Global CORS Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && corsOptions.origin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Routes
app.use(routes);

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API is running...");
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});