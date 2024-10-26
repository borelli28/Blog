import express from "express";
import sqlite3 from 'sqlite3';

const app = express();
const port = 8080;

app.use(express.json());

const db = new sqlite3.Database('./blog.db');

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});