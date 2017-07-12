const path = require('path');
var express = require('express');
var app = express();

var port = process.env.PORT || 3000;

app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, function() {
  console.log("Server Started");
})