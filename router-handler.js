
import { json } from "express";
import cors from "cors";
// import * as routers from "./src/modules/index.js";
import { globaleResponse } from "./src/middleware/index.js";
import * as routers from "./src/modules/index.js";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const routerHandler = (app)=>{
    app.use(json());
    app.use(cors());
    // Serve static files
    app.use(express.static(path.join(__dirname, 'public')));
    app.use("/users", routers.UserRouter);
    app.use("/auth", routers.AuthRouter);
    app.use("/messages", routers.MessageRouter);
    // Root route - serves landing page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.use("*", (req, res) => {
      res.status(404).json({ msg: "hello to saraha app", status: 404 });
    });
    app.use(globaleResponse);
}