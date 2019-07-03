/*jshint esversion: 6*/

const express = require("express");
const app = express();
const http = require('http').Server(app);
app.use(express.static(__dirname + "/public"));


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/taxis.html");

});

http.listen(3000, () => {
    console.log(`Server running at port 3000`);
});