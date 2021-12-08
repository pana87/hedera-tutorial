console.clear();
const { TokenType, TokenSupplyType, TokenCreateTransaction, Client, PrivateKey, AccountId, AccountCreateTransaction } = require('@hashgraph/sdk');
require('dotenv').config();
const util = require('util');

const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_PVKEY = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

const client = Client.forPreviewnet().setOperator(OPERATOR_ID, OPERATOR_PVKEY);

const supplyKey = PrivateKey.generate();

async function main() {
  // create treasury account
  const treasuryPrivateKey = PrivateKey.generate();
  const treasuryPublicKey = treasuryPrivateKey.publicKey;
  const treasuryAccountTx = await new AccountCreateTransaction()
    .setKey(treasuryPublicKey)
    .execute(client);
  const treasuryAccountId = (await treasuryAccountTx.getReceipt(client)).accountId;
  console.log(`The treasury account ID is: ${treasuryAccountId}`);

  // create alice account
  const alicePrivateKey = PrivateKey.generate();
  const alicePublicKey = alicePrivateKey.publicKey;
  const aliceAccountCreateTx = await new AccountCreateTransaction()
    .setKey(alicePublicKey)
    .execute(client);
  const aliceAccountId = (await aliceAccountCreateTx.getReceipt(client)).accountId;
  console.log(`The Alice account ID is: ${aliceAccountId}`);

  // create fungible token (stable coin)
  let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName('USD Bar')
    .setTokenSymbol('USDB')
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(10000)
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .freezeWith(client);

  // sign with treasury key
  let tokenCreateSign = await tokenCreateTx.sign(treasuryPrivateKey);

  // submit the transaction
  let tokenCreateSubmit = await tokenCreateSign.execute(client);

  // get the transaction receipt
  let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

  // get the token id
  let tokenId = tokenCreateRx.tokenId;

  // log the token id to the console
  console.log(`- Created token with ID: ${tokenId}`);

  console.log(util.inspect(tokenCreateTx));
  console.log(util.inspect(tokenCreateSign));
  console.log(util.inspect(tokenCreateSubmit));
  console.log(util.inspect(tokenCreateRx));



}

main();
