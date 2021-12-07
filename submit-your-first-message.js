const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction, TopicCreateTransaction } = require("@hashgraph/sdk");
const { resolve } = require("path");
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

  // create connection to hedera network
  const client = Client.forPreviewnet();
  client.setOperator(myAccountId, myPrivateKey);

  // create new topic
  const txResponse = await new TopicCreateTransaction().execute(client);
  console.log(util.inspect(txResponse));

  // get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);
  console.log(util.inspect(receipt));

  // grab the new topic id from the receipt
  const topicId = receipt.topicId;

  // log the topic id
  console.log(`Your topic ID is: ${topicId}`);

  // wait 5 seconds between consensus topic creation and subscription
  await new Promise(resolve => setTimeout(resolve, 5000));
}
main();
