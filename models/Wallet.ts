import * as crypto from "crypto";
import { Block } from "./Block";
import { Chain } from "./Chain";
import { Transaction } from "./Transaction";
import { DB } from "./DB";

export class Wallet {
  private id: number = 0;
  public publicKey: string = "";
  private privateKey: string = "";
  public email: string = "";
  private is_admin: number = 0;
  public balance: number = 0;
  private database: DB = new DB();

  get pivate_key() {
    return this.privateKey;
  }

  get role() {
    return this.is_admin;
  }

  public async signup(email: string, password: string) {
    let response: any = {};
    // validate email
    const regexp = new RegExp(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (!regexp.test(email)) {
      response.email = "please enter a valid email";
    }
    if (email.length == 0) {
      response.email = "email cannot be empty";
    }
    // validate the password
    if (password.length == 0) {
      response.password = "password cannot be empty";
    }
    if (password.length < 6) {
      response.password = "password must be atleast 6 characters";
    }
    if (password.length > 25) {
      response.password = "password cannot have more than 25 characters";
    }
    if ("email" in response || "password" in response) return response;
    // connect to the database
    await this.database.connect();
    // generate the keypair
    let keyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    // add the user to the database
    await this.database.insert_user(
      keyPair.publicKey,
      keyPair.privateKey,
      email,
      password
    );
    await this.database.disconnect();
    return keyPair.privateKey;
  }

  // login
  async login(privateKey: string, password: string) {
    let hashedPassword = crypto
      .createHash("SHA1")
      .update(password)
      .digest("hex");
    privateKey = privateKey.split(" ").join("").split("\n").join("");
    await this.database.connect();
    let query = `SELECT * FROM users WHERE REPLACE(REPLACE(Private_Key, " ", ""), "\n", "") = "${privateKey}" AND Password = "${hashedPassword}"`;
    let [rows, fields] = await this.database.get_connection().query(query);
    if (rows.length == 0) return "wrong credentials";
    this.id = rows[0].ID;
    this.publicKey = rows[0].Public_Key;
    this.privateKey = rows[0].Private_Key;
    this.email = rows[0].email;
    this.balance = rows[0].Balance;
    this.is_admin = rows[0].isAdmin;
    await this.database.disconnect();
    return "logged in";
  }

  async transactions() {
    await this.database.connect();
    let filtered_key = this.publicKey.split(" ").join("").split("\n").join("");
    let query = `SELECT * FROM transactions WHERE REPLACE(REPLACE(Sender, " ", ""), "\n", "") = "${filtered_key}" OR REPLACE(REPLACE(Receiver, " ", ""), "\n", "") = "${filtered_key}"`;
    let [rows, fields] = await this.database.get_connection().query(query);
    await this.database.disconnect();
    return rows;
  }

  async send(amount: number, receiverPublicKey: string) {
    if (this.balance < amount) {
      return "not enough balance";
    }
    if (receiverPublicKey == this.publicKey) {
      return "you cant send coins to yourself";
    }
    // check if the receiver exists
    await this.database.connect();
    receiverPublicKey = receiverPublicKey
      .split(" ")
      .join("")
      .split("\n")
      .join("");
    const [rows, fields] = await this.database
      .get_connection()
      .query(
        `SELECT * FROM users WHERE REPLACE(REPLACE(Public_Key, " ", ""), "\n", "") = "${receiverPublicKey}"`
      );
    if (rows.length > 0) {
      // start the sending process
      const transaction = new Transaction(
        amount,
        this.publicKey,
        receiverPublicKey
      );
      const sign = crypto.createSign("SHA256");
      sign.update(transaction.toString()).end();

      const signature = sign.sign(this.privateKey);
      Chain.instance.addBlock(transaction, this.publicKey, signature);
      await this.database.insert_transaction(
        this.id,
        this.publicKey,
        receiverPublicKey,
        amount
      );
      this.balance -= amount;
      await this.database.substract_from_balance(this.id, amount);
      await this.database.add_to_balance(receiverPublicKey, amount);
      await this.database.disconnect();
      return "success";
    }
    await this.database.disconnect();
    return "user not found";
  }

  // allow user to mine
  async mine() {
    let chain = Chain.instance;
    let nonce = Math.round(Math.random() * 999999999);
    let solution = 1;
    chain.updateDifficulty();
    console.log("current difficulty is: ", chain.currentDifficulty);
    if (!chain.isMiningAllowed) return "mining is not allowed at this moment";
    let goal = "0".repeat(chain.currentDifficulty);
    console.log("Mining ...");

    while (true) {
      const hash = crypto.createHash("MD5");
      hash.update((nonce + solution).toString()).end();
      const attempt = hash.digest("hex");
      if (attempt.substring(0, chain.currentDifficulty) === goal) {
        await this.database.connect();
        const admin_public_key = await this.database.get_admin_public_key();
        const transaction = new Transaction(
          chain.reward,
          admin_public_key,
          this.publicKey
        );
        await this.database.insert_transaction(
          this.id,
          admin_public_key,
          this.publicKey,
          chain.reward
        );
        await this.database.insert_reward(this.id, attempt, chain.reward);
        // sign the transaction with the user private key
        const sign = crypto.createSign("SHA256");
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        // update user balance in DB and class
        this.balance += chain.reward;
        await this.database.update_user_balance(this.id, this.balance);
        await this.database.add_successful_mining(this.id);
        await this.database.disconnect();
        Chain.instance.addBlock(transaction, this.publicKey, signature);
        chain.difficultyMap[chain.currentDifficulty - 1]--;
        console.log("current difficulty map:", chain.difficultyMap);

        return `you found the solution after ${solution} tries! and the hash is: ${attempt}`;
      }
      solution += 1;
    }
  }
}
