var router = require("express").Router();

router.use((req: any, res: any) => {
  res.status(404);
  res.send("404: File Not Found");
});

module.exports = router;
