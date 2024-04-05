const express = require("express");
const utils = require("../utils");
const router = express.Router();
const { DatabaseService } = require("../services");

const { pool } = require("../database");
const db = new DatabaseService(pool);

router.get("/", async (req, res) => {
  try {
    const result = await db.find({
      tableName: "posts",
    });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      message: "Error fetching products",
      error: error.message,
    });
  }
});

module.exports = router;
