console.clear();
const { TransferTransaction, AccountBalanceQuery, Hbar, AccountCreateTransaction, Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
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

}

main();
