
import { json } from "express";
import cors from "cors";
// import * as routers from "./src/modules/index.js";
import { globaleResponse } from "./src/middleware/index.js";
import * as routers from "./src/modules/index.js";
export const routerHandler = (app)=>{
    app.use(json());
    app.use(cors());

    app.use("/users", routers.UserRouter);
    app.use("/auth", routers.AuthRouter);
    app.use("/messages", routers.MessageRouter);
    app.use("*", (req, res) => {
      res.status(404).json({ msg: "hello to saraha app", status: 404 });
    });
    app.use(globaleResponse);
}