const adminController = require("../controllers/AdminController");
var router = require("express").Router();

router.get("/", adminController.admin_login_get);
router.post("/", adminController.admin_login_post);
router.get("/dashboard", adminController.admin_dashboard);
router.get("/users", adminController.admin_users);
router.get("/transactions", adminController.admin_transactions);
router.get("/logout", adminController.admin_logout);

module.exports = router;
