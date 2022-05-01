"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chain = void 0;
const crypto = __importStar(require("crypto"));
const Block_1 = require("./Block");
const Transaction_1 = require("./Transaction");
const DB_1 = require("./DB");
class Chain {
    constructor() {
        this.chain = [new Block_1.Block("", new Transaction_1.Transaction(0, "---", "---"))];
        this.coinPrice = 50;
        this.database = new DB_1.DB();
        // create the allowance for each mining difficulty level
        let map = [];
        let allowed = 40;
        for (let i = 1; i <= 32; i++) {
            map.push(allowed);
            if (i % 10 == 0) {
                allowed = allowed / 2;
            }
        }
        this.difficultyMap = map;
        this.currentDifficulty = 1;
        this.isMiningAllowed = true;
        this.reward = Math.max(Math.round(this.currentDifficulty / 2), 1) * 5;
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    // eliminate the double spending
    mine(nonce) {
        let solution = 1;
        while (true) {
            const hash = crypto.createHash("MD5");
            hash.update((nonce + solution).toString()).end();
            const attempt = hash.digest("hex");
            if (attempt.substr(0, 3) === "000") {
                console.log("coins sent successfully");
                return solution;
            }
            solution += 1;
        }
    }
    addBlock(transaction, senderPublicKey, signature) {
        // signature verification using the sender public key
        const verifier = crypto.createVerify("SHA256");
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        // if signature is valid add the new block to the chain
        if (!isValid)
            return console.log("block not valid");
        const newBlock = new Block_1.Block(this.lastBlock.hash, transaction);
        this.mine(newBlock.nonce);
        this.chain.push(newBlock);
    }
    // check if the blockchain is valid or not
    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];
            if (currentBlock.prevHash != prevBlock.hash) {
                return false;
            }
        }
        return true;
    }
    updateDifficulty() {
        if (this.difficultyMap[this.currentDifficulty - 1] != 0)
            return;
        if (this.currentDifficulty != 32)
            this.currentDifficulty++;
        this.isMiningAllowed = false;
        return;
    }
}
exports.Chain = Chain;
Chain.instance = new Chain();
