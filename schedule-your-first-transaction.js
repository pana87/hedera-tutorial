console.clear();
const { HbarUnit, TransactionId, KeyList, ScheduleInfoQuery, ScheduleSignTransaction, ScheduleCreateTransaction, TransferTransaction, AccountBalanceQuery, Hbar, AccountCreateTransaction, Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
require('dotenv').config();
const util = require('util');

const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_PVKEY = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forPreviewnet().setOperator(OPERATOR_ID, OPERATOR_PVKEY);


async function main() {
  // create key list
  const signerKey1 = PrivateKey.generate();
  const signerPublicKey1 = signerKey1.publicKey;

  const signerKey2 = PrivateKey.generate();
  const signerPublicKey2 = signerKey2.publicKey;

  const signerKey3 = PrivateKey.generate();
  const signerPublicKey3 = signerKey3.publicKey;

  const publicKeyList = [];

  publicKeyList.push(signerPublicKey1);
  publicKeyList.push(signerPublicKey2);
  publicKeyList.push(signerPublicKey3);

  const keys = new KeyList(publicKeyList);

  // console.log(publicKeyList);
  // console.log(keys);

  // create sender account
  // const senderAccountPrivateKey = PrivateKey.generate();
  // const signerPVKey1 = key1;
  // // const senderAccountPublicKey = senderAccountPrivateKey.publicKey;
  // const signerPubKey1 = publicKey1;







  // create admin account from key list
  const adminAccountCreateTx = await new AccountCreateTransaction()
    // .setKey(senderAccountPublicKey)
    // use the key list instead of the one public key here
    .setKey(keys)
    .setInitialBalance(new Hbar(5))
    .execute(client);

  //   let retry = true;
  // while (retry) {
  //     .execute(client)
  //     .then(() => {
  //       retry = false;
  //       console.log("-----> SUCCESS");
  //     })
  //     .catch(async error => {
  //       console.log(error);
  //       if (error.message.includes('RST_STREAM')) {
  //         console.log("-----> RETRY");
  //       }
  //     })
  //   console.log(util.inspect(senderAccountCreateTx));
  // }

  const adminAccountCreateRx = await adminAccountCreateTx.getReceipt(client);
  // console.log(util.inspect(senderAccountCreateRx));
  const adminAccountId = adminAccountCreateRx.accountId;

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(adminAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Created admin account with ID: ${adminAccountId} and balance: ${checkBalance}`);







  // create sender account
  const senderAccountCreateTx = await new AccountCreateTransaction()
    .setKey(signerPublicKey1)
    .freezeWith(client)
    .execute(client);
  const senderAccountId = (await senderAccountCreateTx.getReceipt(client)).accountId;


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the sender account
  console.log(`- Created sender account with ID: ${senderAccountId} and balance: ${checkBalance}`);










  // create recipient account
  // const recipientAccountPrivateKey = PrivateKey.generate();
  // const signerAccountPrivateKey1 = key2;
  // const recipientAccountPublicKey = recipientAccountPrivateKey.publicKey;
  // const recipientAccountPublicKey = publicKey2;
  const recipientAccountCreateTx = await new AccountCreateTransaction()
    .setKey(signerPublicKey2)
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






  // create third party signer for learning
  const someSignerAccountCreateTx = await new AccountCreateTransaction()
    .setKey(signerPublicKey3)
    .freezeWith(client)
    .execute(client);
  const someSignerAccountId = await (await someSignerAccountCreateTx.getReceipt(client)).accountId;

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(someSignerAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the signer account
  console.log(`- Created signer account with ID: ${someSignerAccountId} and balance: ${checkBalance}`);











  // send hbar to sender account without schedule
  // if the admin account is involved in the transaction, it needs all keys to sign.
  // double check by making a transaction without admin account
  var transferTx = await new TransferTransaction()
    .addHbarTransfer(adminAccountId, -2)
    .addHbarTransfer(senderAccountId, 2)
    .freezeWith(client);
    // .sign(signerKey1);
    // .execute(client);

  // sign with correct key
  var transferTxSigned = await (await (await transferTx.sign(signerKey1)).sign(signerKey2)).sign(signerKey3);
  // const transferTxSigned = await transferTx.sign(OPERATOR_PVKEY);

  // submit to hedera and get receipt
  var transferTxSubmit = await transferTxSigned.execute(client);

  var transferReceipt = await transferTxSubmit.getReceipt(client);
  console.log(`- The transfer transaction without schedule from admin to sender is: ${transferReceipt.status}`);


  // check the balance after transaction

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(adminAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Admin balance after first normal transaction: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Sender balance after first normal transaction: ${checkBalance}`);

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(recipientAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Recipient balance after first normal transaction: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(someSignerAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Some Signer balance after first normal transaction: ${checkBalance}`);










  // send hbar to recipient account without schedule
  // if the admin account is involved in the transaction, it needs all keys to sign.
  // double check by making a transaction without admin account
  var transferTx = await new TransferTransaction()
    .addHbarTransfer(senderAccountId, -1)
    .addHbarTransfer(recipientAccountId, 1)
    .freezeWith(client);
    // .sign(signerKey1);
    // .execute(client);

  // sign with correct key from sender id
  // const transferTxSigned = await (await (await transferTx.sign(signerKey1)).sign(signerKey2)).sign(signerKey3);
  var transferTxSigned = await transferTx.sign(signerKey1);

  // submit to hedera and get receipt
  var transferTxSubmit = await transferTxSigned.execute(client);

  var transferReceipt = await transferTxSubmit.getReceipt(client);
  console.log(`- The transfer transaction without schedule from sender to recipient is: ${transferReceipt.status}`);


  // check the balance after transaction

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(adminAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Admin balance after second normal transaction: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Sender balance after second normal transaction: ${checkBalance}`);

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(recipientAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Recipient balance after second normal transaction: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(someSignerAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Some Signer balance after second normal transaction: ${checkBalance}`);













  // create a transaction to schedule from admin key list to the third party
  const transaction = new TransferTransaction()
    .addHbarTransfer(adminAccountId, Hbar.from(-3))
    .addHbarTransfer(someSignerAccountId, Hbar.from(3));
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
    .sign(signerKey1))
    .execute(client);
  // console.log(util.inspect(signature1));

  // verify the transaction was successful and submit a schedule info request
  const receipt1 = await signature1.getReceipt(client);

  const query1 = await new ScheduleInfoQuery()
  .setScheduleId(scheduleId)
  .execute(client);

  // confirm the signature was added to the schedule
  // console.log(query1);

  console.log(`- The transaction signing is: ${receipt1.status.toString()} and was signed by ${query1.signers.toArray().length} of the required signers.`);





    // check the balance betweent signings

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(adminAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Admin balance between signing: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Sender balance between signing: ${checkBalance}`);

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(recipientAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Recipient balance between signing: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(someSignerAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Some Signer balance between signing: ${checkBalance}`);















  // submit the second signature
  const signature2 = await (await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(signerKey2))
    .execute(client);
  // console.log(util.inspect(signature2));

  // verify the transaction was successful
  const receipt2 = await signature2.getReceipt(client);
  console.log(`- The transaction status ${receipt2.status.toString()}`);

  // get the schedule info
  const query2 = await new ScheduleInfoQuery()
    .setScheduleId(scheduleId)
    .execute(client);

  // console.log(query2);

  // const scheduleTxRecord = await TransactionId.fromString(scheduleTxId.toString());
  // console.log(`The schedule transaction record is: ${scheduleTxRecord}`);
  console.log(`- The transaction signing is: ${receipt2.status.toString()} and was signed by ${query2.signers.toArray().length} of the required signers.`);






    // check the balance betweent signings

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(adminAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Admin balance between signing: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Sender balance between signing: ${checkBalance}`);

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(recipientAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Recipient balance between signing: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(someSignerAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Some Signer balance between signing: ${checkBalance}`);









  // submit the second signature
  const signature3 = await (await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(signerKey3))
    .execute(client);
  // console.log(util.inspect(signature2));

  // verify the transaction was successful
  const receipt3 = await signature3.getReceipt(client);
  console.log(`- The transaction status ${receipt3.status.toString()}`);

  // get the schedule info
  const query3 = await new ScheduleInfoQuery()
    .setScheduleId(scheduleId)
    .execute(client);

  // console.log(query2);

  // const scheduleTxRecord = await TransactionId.fromString(scheduleTxId.toString());
  // console.log(`The schedule transaction record is: ${scheduleTxRecord}`);
  console.log(`- The transaction signing is: ${receipt3.status.toString()} and was signed by ${query3.signers.toArray().length} of the required signers.`);






    // check the balance betweent signings

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(adminAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Admin balance between signing: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Sender balance between signing: ${checkBalance}`);

  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(recipientAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Recipient balance between signing: ${checkBalance}`);


  // check the balance
  var checkBalanceTx = await new AccountBalanceQuery()
    .setAccountId(someSignerAccountId)
    .execute(client);
  var checkBalance = checkBalanceTx.hbars.toTinybars();

  // log the admin account
  console.log(`- Some Signer balance between signing: ${checkBalance}`);



  // const scheduleRx = await scheduleTransaction.getReceipt(client);
  // const scheduleRecord = await scheduleTransaction.getRecord(client).re;
  // console.log(scheduleRx);
  // console.log(scheduleRecord);

  const scheduleTransactionStatus = (await scheduleTransaction.getReceipt(client)).status;
  console.log(`- The scheduled transaction is complete: ${scheduleTransactionStatus}`);

  // var scheduleTxRecord = await TransactionId.fromString(scheduleTxId.toString());
  // console.log(`The schedule transaction record is: ${scheduleTxRecord}`);


}

main();
