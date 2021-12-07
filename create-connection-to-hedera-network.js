const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

const util = require("util");

async function main() {
  // grab hedera keys from .env
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  // if we are not able to grab it, we should throw an error
  if (myAccountId == null || myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
  }

  console.log(`My account ID: ${myAccountId}`);
  console.log(`My private key: ${myPrivateKey}`);

  // create connection to hedera network
  const client = Client.forPreviewnet();
  client.setOperator(myAccountId, myPrivateKey);

  console.log(`The client: `);
  console.log(util.inspect(client));

}
main();
