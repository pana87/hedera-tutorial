const { Client, TopicMessageSubmitTransaction, PrivateKey, AccountId, TopicCreateTransaction, TopicMessageQuery } = require("@hashgraph/sdk");

require("dotenv").config();

const util = require("util");

async function main() {
  // grab hedera keys from .env
  const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

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

  // create the query to subscribe to a topic
  const topicMessageQuery = new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      let messageAsString = Buffer.from(message.contents, "utf8").toString();
      console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
      console.log(util.inspect(message));
    });

  console.log(util.inspect(topicMessageQuery));

  // send one message
  const submitMessage = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Hello, HCS!",
  }).execute(client);
  console.log(util.inspect(submitMessage));

  // get the receipt of the transaction
  const getReceipt = await submitMessage.getReceipt(client);
  console.log(util.inspect(getReceipt));

  // get the status of the transaction
  const transactionStatus = getReceipt.status
  console.log(`The message transaction status ${transactionStatus}`);

}
main();
