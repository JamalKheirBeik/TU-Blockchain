"use strict";
var router = require("express").Router();
router.use((req, res) => {
    res.status(404);
    res.send("404: File Not Found");
});
module.exports = router;
