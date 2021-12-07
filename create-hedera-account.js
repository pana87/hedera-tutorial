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

  console.log(`------------------------------create account--------------------------------`);
  const newAccountPrivateKey = await PrivateKey.generate();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  console.log(`New account pivate key: ${newAccountPrivateKey}`);
  console.log(`New account public key: ${newAccountPublicKey}`);

  const newAccountTransactionResponse = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  console.log("New account transaction response");
  console.log(util.inspect(newAccountTransactionResponse));

  const getReceipt = await newAccountTransactionResponse.getReceipt(client);
  console.log("New account receipt");
  console.log(util.inspect(getReceipt));

  const newAccountId = getReceipt.accountId;
  console.log("The new account ID is: " + newAccountId);

  const accountBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);
  console.log("New account balance query");
  console.log(util.inspect(accountBalance));

  console.log(`The new account balance is: ${accountBalance.hbars.toTinybars()} tinybar`);
}
main();
