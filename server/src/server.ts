import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source"

import authRoutes from './routes/auth';
import subRoutes from './routes/subs';
import postRoutes from './routes/posts';
import voteRoutes from './routes/votes';
import userRoutes from './routes/users';
import quotesRoutes from "./routes/quotes";
import savedRoutes from "./routes/saved";
import likeRoutes from "./routes/likes";



import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const origin = process.env.ORIGIN;
app.use(cors({
    origin,
    credentials: true
}))
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());


app.get("/", (_, res) => res.send("running"));
app.use("/api/auth", authRoutes)
app.use("/api/subs", subRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/votes", voteRoutes)
app.use("/api/users", userRoutes)
app.use("/api/quotes", quotesRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/likes", likeRoutes);


app.use(express.static("public"));


let port = 4000;
AppDataSource.initialize()
  .then(() => {
    console.log("database initialized");

    app.listen(port, () => {
      console.log(`server running at ${process.env.APP_URL}`);
    });
  })
  .catch((error) => {
    console.error("database init failed", error);
  });