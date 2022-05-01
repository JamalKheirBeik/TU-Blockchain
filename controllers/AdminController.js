"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wallet_1 = require("../models/Wallet");
const Chain_1 = require("../models/Chain");
const DB_1 = require("../models/DB");
const admin_login_get = (req, res) => {
    res.render("./admin/index", { layout: "other", AdminloggedIn: false });
};
const admin_login_post = async (req, res) => {
    if (req.session.AdminloggedIn)
        return res.redirect("/");
    let wallet = new Wallet_1.Wallet();
    let login_response = await wallet.login(req.body.username, req.body.password);
    if (login_response.includes("wrong"))
        return res.redirect("/admin");
    // check if the wallet is an admin wallet
    if (wallet.role != 1)
        return res.redirect("/");
    req.session.AdminloggedIn = true;
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    res.redirect("/admin/dashboard");
};
const admin_dashboard = async (req, res) => {
    if (!req.session.AdminloggedIn)
        return res.redirect("/");
    let chain = Chain_1.Chain.instance;
    let coinPrice = chain.coinPrice;
    let miningDifficulty = chain.currentDifficulty;
    let miningReward = chain.reward;
    let db = new DB_1.DB();
    await db.connect();
    let users = await db.get_data("users");
    let transactions = await db.get_data("transactions");
    await db.disconnect();
    res.render("./admin/dashboard", {
        layout: "other",
        AdminloggedIn: true,
        price: coinPrice,
        difficulty: miningDifficulty,
        reward: miningReward,
        numberOfUsers: users.length,
        numberOfTransactions: transactions.length,
    });
};
const admin_users = async (req, res) => {
    if (!req.session.AdminloggedIn)
        return res.redirect("/admin");
    let chain = Chain_1.Chain.instance;
    let db = new DB_1.DB();
    await db.connect();
    let users = await db.get_data("users");
    await db.disconnect();
    res.render("./admin/users", {
        layout: "other",
        AdminloggedIn: true,
        users: users,
    });
};
const admin_transactions = async (req, res) => {
    if (!req.session.AdminloggedIn)
        return res.redirect("/admin");
    let chain = Chain_1.Chain.instance;
    let db = new DB_1.DB();
    await db.connect();
    let transactions = await db.get_data("transactions");
    await db.disconnect();
    res.render("./admin/transactions", {
        layout: "other",
        AdminloggedIn: true,
        transactions: transactions,
    });
};
const admin_logout = (req, res) => {
    if (!req.session.AdminloggedIn)
        return res.redirect("/");
    req.session.destroy();
    res.redirect("/admin");
};
module.exports = {
    admin_login_get,
    admin_login_post,
    admin_dashboard,
    admin_users,
    admin_transactions,
    admin_logout,
};
