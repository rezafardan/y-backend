import express from "express";
import { Request, Response } from "express";

import fs from "fs";
import path from "path";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// ROOT ACCESS ENDPOINT
//   http://hostname/
router.get("/", (req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../views", "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading the page");
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(data);
  });
});

export default router;
