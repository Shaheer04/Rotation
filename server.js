const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(__dirname + "/public"));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.listen(3000, () => console.log("Your site is live!"));
