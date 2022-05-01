"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    constructor(amount, sender, // public key
    receiver // public key
    ) {
        this.amount = amount;
        this.sender = sender;
        this.receiver = receiver;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Transaction = Transaction;
