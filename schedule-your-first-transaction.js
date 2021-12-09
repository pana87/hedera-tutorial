console.clear();
const { ScheduleInfoQuery, ScheduleSignTransaction, ScheduleCreateTransaction, TransferTransaction, AccountBalanceQuery, Hbar, AccountCreateTransaction, Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
require('dotenv').config();
const util = require('util');

const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_PVKEY = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forPreviewnet().setOperator(OPERATOR_ID, OPERATOR_PVKEY);

async function main() {
  // create sender account
  const senderAccountPrivateKey = PrivateKey.generate();
  const senderAccountPublicKey = senderAccountPrivateKey.publicKey;
  const senderAccountCreateTx = await new AccountCreateTransaction()
    .setKey(senderAccountPublicKey)
    .setInitialBalance(new Hbar(5))
    .execute(client);
  // console.log(util.inspect(senderAccountCreateTx));
  const senderAccountCreateRx = await senderAccountCreateTx.getReceipt(client);
  // console.log(util.inspect(senderAccountCreateRx));
  const senderAccountId = senderAccountCreateRx.accountId;

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the sender account
  console.log(`- Created sender account with ID: ${senderAccountId} and balance: ${checkBalance}`);

  // create recipient account
  const recipientAccountPrivateKey = PrivateKey.generate();
  const recipientAccountPublicKey = recipientAccountPrivateKey.publicKey;
  const recipientAccountCreateTx = await new AccountCreateTransaction()
    .setKey(recipientAccountPublicKey)
    .freezeWith(client)
    .execute(client);
  const recipientAccountId = (await recipientAccountCreateTx.getReceipt(client)).accountId;

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(recipientAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the recipient account
  console.log(`- Created recipient account with ID: ${recipientAccountId} and balance: ${checkBalance}`);

  // create a transaction to schedule
  const transaction = new TransferTransaction()
    .addHbarTransfer(senderAccountId, Hbar.fromTinybars(-1))
    .addHbarTransfer(recipientAccountId, Hbar.fromTinybars(1));
  // console.log(util.inspect(transaction));

  // schedule a transaction
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(transaction)
    .execute(client);

  // get the receipt
  const receipt = await scheduleTransaction.getReceipt(client);

  // get the schedule id
  const scheduleId = receipt.scheduleId;
  console.log(`- The schedule ID is: ${scheduleId}`);

  // get the schedule transaction id
  const scheduleTxId = receipt.scheduledTransactionId;
  console.log(`- The transaction schedule ID is: ${scheduleTxId}`);

  // console.log(util.inspect(scheduleTransaction));
  // console.log(util.inspect(receipt));

  // submit the first signature
  const signature1 = await (await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(senderAccountPrivateKey))
    .execute(client);
  // console.log(util.inspect(signature1));

  // verify the transaction was successful and submit a schedule info request
  const receipt1 = await signature1.getReceipt(client);
  console.log(`- The transaction status is: ${receipt1.status.toString()}`);

  const query1 = await new ScheduleInfoQuery()
    .setScheduleId(scheduleId)
    .execute(client);

  // confirm the signature was added to the schedule
  console.log(query1);

  // submit the second signature
  const signature2 = await (await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(recipientAccountPrivateKey))
    .execute(client);
  // console.log(util.inspect(signature2));

  // verify the transaction was successful
  const receipt2 = await signature2.getReceipt(client);
  console.log(`- The transaction status ${receipt2.status.toString()}`);


}

main();
