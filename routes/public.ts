// limit account creation and sending messages to once every 5 hours per IP
import { rateLimit } from "express-rate-limit";
const limit = rateLimit({
  windowMs: 5 * 60 * 60 * 1000,
  max: 1,
});

var walletController = require("../controllers/WalletController");
var router = require("express").Router();

router.get("/", walletController.user_home);
router.get("/about", walletController.user_about);
router.get("/contact", walletController.user_contact_get);
router.post("/contact", limit, walletController.user_contact_post);
router.get("/login", walletController.user_login_get);
router.post("/login", walletController.user_login_post);
router.get("/signup", walletController.user_signup_get);
router.post("/signup", limit, walletController.user_signup_post);
router.get("/logout", walletController.user_logout);
router.get("/dashboard", walletController.user_dashboard);
router.get("/profile", walletController.user_profile);
router.get("/buy", walletController.user_buy_get);
router.post("/buy", walletController.user_buy_post);
router.get("/buy/success", walletController.user_buy_success);
router.get("/buy/cancel", walletController.user_buy_cancel);
router.get("/send", walletController.user_send_get);
router.post("/send", walletController.user_send_post);
router.get("/mining", walletController.user_mining);

module.exports = router;
