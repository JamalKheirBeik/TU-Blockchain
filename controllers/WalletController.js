"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wallet_1 = require("../models/Wallet");
const Chain_1 = require("../models/Chain");
const user_signup_get = (req, res) => {
    if (!req.session.loggedIn)
        return res.render("signup");
    res.redirect("/");
};
const user_signup_post = async (req, res) => {
    if (req.body.password != req.body.passwordConfirm)
        return res.render("signup", {
            confirmError: "please confirm the password",
        });
    let wallet = new Wallet_1.Wallet();
    let response = await wallet.signup(req.body.email, req.body.password);
    if (typeof response != "string" && "email" in response)
        return res.render("signup", { emailError: response === null || response === void 0 ? void 0 : response.email });
    if (typeof response != "string" && "password" in response)
        return res.render("signup", { passwordError: response === null || response === void 0 ? void 0 : response.password });
    res.render("signup", { privateKey: response });
};
const user_profile = async (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    let wallet = new Wallet_1.Wallet();
    let response = await wallet.login(req.session.username, req.session.password);
    if (response.includes("wrong"))
        return res.redirect("/dashboard");
    let history = await wallet.transactions();
    res.render("profile", {
        loggedIn: true,
        username: req.session.username,
        publicKey: req.session.publicKey,
        balance: wallet.balance,
        history: history,
    });
};
const user_login_get = (req, res) => {
    if (!req.session.loggedIn)
        return res.render("login", { loggedIn: false });
    res.render("index", { loggedIn: true });
};
const user_login_post = async (req, res) => {
    if (req.session.loggedIn)
        return res.redirect("/");
    let wallet = new Wallet_1.Wallet();
    let response = await wallet.login(req.body.username, req.body.password);
    if (response.includes("wrong"))
        return res.render("login", { error: response });
    // check if the wallet is a user wallet
    if (wallet.role != 0)
        return res.redirect("/");
    req.session.loggedIn = true;
    req.session.username = req.body.username;
    req.session.publicKey = wallet.publicKey;
    req.session.password = req.body.password;
    req.session.balance = wallet.balance;
    res.redirect("/dashboard");
};
const user_logout = (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    req.session.destroy();
    res.redirect("/");
};
const user_dashboard = (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    res.render("dashboard", { loggedIn: true });
};
const user_send_get = (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    res.render("send", { loggedIn: true });
};
const user_send_post = async (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    let wallet = new Wallet_1.Wallet();
    let login_response = await wallet.login(req.session.username, req.session.password);
    if (login_response.includes("wrong"))
        return res.redirect("/login");
    let send_response = await wallet.send(req.body.amount, req.body.receiver);
    if (send_response.includes("balance")) {
        return res.render("send", { loggedIn: true, notEnoughBalance: true });
    }
    if (send_response.includes("yourself")) {
        return res.render("send", { loggedIn: true, selfSend: true });
    }
    if (send_response.includes("not found")) {
        return res.render("send", { loggedIn: true, noReceiver: true });
    }
    res.render("send", { loggedIn: true, success: true });
};
const user_page_not_found = (req, res, next) => {
    res.status(404);
    res.send("404: File Not Found");
};
const user_mining = async (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    // start mining
    let wallet = new Wallet_1.Wallet();
    let login_response = await wallet.login(req.session.username, req.session.password);
    if (login_response.includes("wrong"))
        return res.redirect("/login");
    let mining_response = await wallet.mine();
    if (!mining_response.includes("found"))
        return res.render("mining", {
            loggedIn: true,
            isSuccess: false,
            message: mining_response,
        });
    res.render("mining", {
        loggedIn: true,
        isSuccess: true,
        message: mining_response,
        reward: Chain_1.Chain.instance.reward,
        newBalance: wallet.balance,
    });
};
const user_home = (req, res) => {
    if (!req.session.loggedIn)
        return res.render("index", { loggedIn: false });
    res.render("index", { loggedIn: true });
};
const user_contact_get = (req, res) => {
    if (!req.session.loggedIn)
        return res.render("contact", { loggedIn: false });
    res.render("contact", { loggedIn: true });
};
const user_contact_post = (req, res) => {
    res.send("hello");
    // if (!req.session.loggedIn) return res.render("contact", { loggedIn: false });
    // res.render("contact", { loggedIn: true });
};
const user_buy_get = (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/login");
    res.render("buy", { loggedIn: true });
};
const user_buy_post = async (req, res) => {
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: "usd",
    //         product_data: {
    //           name: "TU Coin",
    //           images: ["./public/images/coin.png"],
    //         },
    //         unit_amount: 50000000,
    //       },
    //       quantity: req.body.numberOfCoins,
    //     },
    //   ],
    //   mode: "payment",
    //   success_url: `${process.env.DOMAIN}/buy/success`,
    //   cancel_url: `${process.env.DOMAIN}/buy/cancel`,
    // });
    // res.json({ id: session.id });
};
const user_buy_success = (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    res.render("success", { loggedIn: true });
};
const user_buy_cancel = (req, res) => {
    if (!req.session.loggedIn)
        return res.redirect("/");
    res.render("cancel", { loggedIn: true });
};
const user_about = (req, res) => {
    if (!req.session.loggedIn)
        return res.render("about", { loggedIn: false });
    res.render("about", { loggedIn: true });
};
module.exports = {
    user_signup_get,
    user_signup_post,
    user_profile,
    user_logout,
    user_login_get,
    user_login_post,
    user_dashboard,
    user_send_get,
    user_send_post,
    user_page_not_found,
    user_mining,
    user_home,
    user_contact_get,
    user_contact_post,
    user_buy_get,
    user_buy_post,
    user_buy_success,
    user_buy_cancel,
    user_about,
};
