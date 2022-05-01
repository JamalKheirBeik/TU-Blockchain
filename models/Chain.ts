import * as crypto from "crypto";
import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { DB } from "./DB";

export class Chain {
  public static instance = new Chain();
  public chain: Block[] = [new Block("", new Transaction(0, "---", "---"))];
  public difficultyMap: number[];
  public currentDifficulty: number;
  public isMiningAllowed: boolean;
  public reward: number;
  public coinPrice: number = 50;
  private database: DB = new DB();

  private constructor() {
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
  mine(nonce: number) {
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

  public addBlock(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ) {
    // signature verification using the sender public key
    const verifier = crypto.createVerify("SHA256");
    verifier.update(transaction.toString());
    const isValid = verifier.verify(senderPublicKey, signature);
    // if signature is valid add the new block to the chain
    if (!isValid) return console.log("block not valid");
    const newBlock = new Block(this.lastBlock.hash, transaction);
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
    if (this.difficultyMap[this.currentDifficulty - 1] != 0) return;
    if (this.currentDifficulty != 32) this.currentDifficulty++;
    this.isMiningAllowed = false;
    return;
  }
}
