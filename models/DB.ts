import * as crypto from "crypto";
const mysql = require("mysql2/promise");

export class DB {
  private host = process.env.DB_HOST;
  private user = process.env.DB_USER;
  private password = process.env.DB_PASSWORD;
  private database = process.env.DB_NAME;
  private port = process.env.DB_PORT;
  private connection: any;

  public is_connected() {
    if (
      typeof this.connection !== "undefined" &&
      this.connection.connection._closing != true
    ) {
      return true;
    }
    return false;
  }

  public async connect() {
    if (this.is_connected()) return;
    try {
      this.connection = await mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port,
      });
    } catch (error) {
      throw error;
    }
  }

  public async disconnect() {
    if (this.is_connected()) await this.connection.destroy();
  }

  // helps when using custom queries EXAMPLE => (this.database.get_connection.query(...))
  public get_connection() {
    return this.connection;
  }

  public async get_admin_public_key() {
    const query = "SELECT Public_Key FROM users WHERE ID = 1";
    const [result, fields] = await this.connection.query(query);
    return result[0].Public_Key;
  }

  public async init() {
    await this.create_database();
    await this.connect();

    const users_table_query =
      "CREATE TABLE IF NOT EXISTS users (ID INT(10) AUTO_INCREMENT PRIMARY KEY,Public_Key VARCHAR(2000) NOT NULL, Private_Key VARCHAR(2000) UNIQUE NOT NULL, Email VARCHAR(100) NOT NULL, Password VARCHAR(255) NOT NULL,Balance INT(10) DEFAULT 0, isAdmin INT(1) NOT NULL DEFAULT 0, Successful_Minings INT(10) NOT NULL DEFAULT 0)";
    await this.create_table(users_table_query);

    const [rows, fields] = await this.connection.execute(
      "SELECT * FROM users WHERE isAdmin = 1"
    );
    if (rows.length == 0) {
      let keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });

      await this.insert_user(
        keyPair.publicKey,
        keyPair.privateKey,
        process.env.ADMIN_EMAIL!,
        process.env.ADMIN_PASSWORD!,
        1000000000,
        1
      );
    }

    const transactions_table_query =
      "CREATE TABLE IF NOT EXISTS transactions (ID INT(10) AUTO_INCREMENT PRIMARY KEY, User_ID INT(10), Sender VARCHAR(2000) NOT NULL, Receiver VARCHAR(2000) NOT NULL, Amount INT(10) NOT NULL, Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT UT_ID FOREIGN KEY (User_ID) REFERENCES users(ID) ON DELETE CASCADE ON UPDATE CASCADE)";
    await this.create_table(transactions_table_query);

    const rewards_table_query =
      "CREATE TABLE IF NOT EXISTS rewards (R_ID INT(10) AUTO_INCREMENT PRIMARY KEY, U_ID INT(10), Hash VARCHAR(2000) UNIQUE NOT NULL, Reward INT(10) NOT NULL, Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT UR_ID FOREIGN KEY (U_ID) REFERENCES users(ID) ON DELETE CASCADE ON UPDATE CASCADE)";
    await this.create_table(rewards_table_query);
  }

  private async create_database() {
    this.connection = await mysql.createConnection({
      host: this.host,
      user: this.user,
      password: this.password,
      port: this.port,
    });
    await this.connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    await this.disconnect();
  }

  private async create_table($query: string) {
    if (this.connection == null) return;
    await this.connection.query($query);
  }

  public async insert_user(
    public_key: string,
    private_key: string,
    email: string,
    password: string,
    balance = 0,
    isAdmin = 0
  ) {
    const query = `INSERT INTO users (Public_Key, Private_Key, Email, Password, Balance, isAdmin) VALUES ("${public_key}","${private_key}","${email}",SHA1("${password}"),${balance},${isAdmin})`;
    await this.connection.query(query);
  }

  public async update_user_balance(id: number, balance: number) {
    const query = `UPDATE users SET Balance = ${balance} WHERE ID = ${id}`;
    await this.connection.query(query);
  }

  public async insert_transaction(
    sender_id: number,
    sender_public_key: string,
    receiver_public_key: string,
    amount: number
  ) {
    const query = `INSERT INTO transactions (User_ID, Sender, Receiver, Amount) VALUES (${sender_id},"${sender_public_key}","${receiver_public_key}",${amount})`;
    await this.connection.query(query);
  }

  public async insert_reward(user_id: number, hash: string, reward: number) {
    const query = `INSERT INTO rewards (U_ID, Hash, Reward) VALUES (${user_id}, "${hash}", ${reward})`;
    await this.connection.query(query);
  }

  public async substract_from_balance(user_id: number, amount: number) {
    const query = `UPDATE users SET Balance = Balance - ${amount} WHERE ID = ${user_id}`;
    await this.connection.query(query);
  }

  public async add_to_balance(public_key: string, amount: number) {
    const query = `UPDATE users SET Balance = Balance + ${amount} WHERE REPLACE(REPLACE(Public_Key, " ", ""), "\n", "") = "${public_key}"`;
    await this.connection.query(query);
  }

  public async add_successful_mining(user_id: number) {
    const query = `UPDATE users SET Successful_Minings = Successful_Minings + 1 WHERE ID = ${user_id}`;
    await this.connection.query(query);
  }

  // returns data from a selected table
  public async get_data(table_name: string) {
    const query = `SELECT * FROM ${table_name}`;
    let [rows, fields] = await this.connection.query(query);
    return rows;
  }
}
