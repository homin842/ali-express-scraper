const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes
app.use("/products", require("./routes/products.route"));
app.use("/posts", require("./routes/posts.route"));

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
