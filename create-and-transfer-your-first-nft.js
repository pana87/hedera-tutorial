console.clear();
require("dotenv").config();
const {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
	TokenMintTransaction,
	TransferTransaction,
	AccountBalanceQuery,
  AccountCreateTransaction,
	TokenAssociateTransaction,
} = require("@hashgraph/sdk");

const util = require("util");


// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

const client = Client.forPreviewnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();

async function main() {
  // create treasury account needed
  const treasuryPrivateKey = PrivateKey.generate();
  const treasuryPublicKey = treasuryPrivateKey.publicKey;
  const treasuryAccountTx = await new AccountCreateTransaction()
    .setKey(treasuryPublicKey)
    .execute(client);
  const treasuryAccountId = (await treasuryAccountTx.getReceipt(client)).accountId;
  console.log(`Treasury Private Key: ${treasuryPrivateKey}`);
  console.log(`Treasury Public Key: ${treasuryPublicKey}`);
  console.log(`Treasury Account ID: ${treasuryAccountId}`);

  // create alice account needed
  const alicePrivateKey = PrivateKey.generate();
  const alicePublicKey = alicePrivateKey.publicKey;
  const aliceAccountTx = await new AccountCreateTransaction()
    .setKey(alicePublicKey)
    .execute(client);
  const aliceAccountId = await (await aliceAccountTx.getReceipt(client)).accountId;
  console.log(`Alice Private Key: ${alicePrivateKey}`);
  console.log(`Alice Public Key: ${alicePublicKey}`);
  console.log(`Alice Account ID: ${aliceAccountId}`);

  // create the nft
  const nftCreate = await new TokenCreateTransaction()
    .setTokenName("diploma")
    .setTokenSymbol("GRAD")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(250)
    .setSupplyKey(supplyKey)
    .freezeWith(client);

    // sign the transaction with treasury key
    const nftCreateTxSign = await nftCreate.sign(treasuryPrivateKey);

    // submit the transaction to a hedera network
    const nftCreateSubmit = await nftCreateTxSign.execute(client);

    // get the transaction receipt
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);

    // get the token ID
    const tokenId = nftCreateRx.tokenId;

    // log the token ID
    console.log(`- Created NFT with Token ID: ${tokenId}`);

    // console.log(util.inspect(nftCreate));
    // console.log(util.inspect(nftCreateTxSign));
    // console.log(util.inspect(nftCreateSubmit));
    // console.log(util.inspect(nftCreateRx));

    // ipfs content identifier for which we will create a nft
    CID = ["QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa"];

    // mint new nft
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(CID)])
      .freezeWith(client);

    // sign the transaction with the supply key
    const mintTxSign = await mintTx.sign(supplyKey);

    // submit the transaction to the hedera network
    const mintTxSubmit = await mintTxSign.execute(client);

    // get the transaction receipt
    const mintRx = await mintTxSubmit.getReceipt(client);

    // log the serial number
    console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low}`);

    // console.log(util.inspect(mintTx));
    // console.log(util.inspect(mintTxSign));
    // console.log(util.inspect(mintTxSubmit));
    // console.log(util.inspect(mintRx));

    // create the associate transaction and sign with alice key
    const associateAliceTx = await new TokenAssociateTransaction()
      .setAccountId(aliceAccountId)
      .setTokenIds([tokenId])
      .freezeWith(client)
      .sign(alicePrivateKey);

    // submit the transaction to the hedera network
    const associateAliceTxSubmit = await associateAliceTx.execute(client);

    // get the transaction receipt
    const associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

    // confirm the transaction was successful
    console.log(`- NFT association with Alice's account: ${associateAliceRx.status}`);

    console.log(util.inspect(associateAliceTx));
    console.log(util.inspect(associateAliceTxSubmit));
    console.log(util.inspect(associateAliceRx));

  }
main();
