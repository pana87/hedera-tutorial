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

  console.log("--------------------------------transfer transaction----------------------------");

  const myAccountBalance = await new AccountBalanceQuery()
    .setAccountId(myAccountId)
    .execute(client);
  console.log("My account balance query");
  console.log(util.inspect(myAccountBalance));

  console.log(`My account balance is: ${myAccountBalance.hbars.toTinybars()} tinybar`);

  // create transfer transaction
  const transferTransactionResponse = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
    .execute(client);
  console.log("New transfer transaction response");
  console.log(util.inspect(transferTransactionResponse));

  const transactionReceipt = await transferTransactionResponse.getReceipt(client);
  console.log("new tranfer transaction receipt");
  console.log(util.inspect(transactionReceipt));

  console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

  // request cost of query
  const getBalanceCost = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .getCost(client);

  console.log(`The cost of the query is: ${getBalanceCost}`);

  // check new account balance
  const newAccountBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(`The account balance after tranfer is: ${newAccountBalance.hbars}`);
}
main();
