console.clear();
const util = require('util');
const { FileCreateTransaction, Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
require('dotenv').config();

// import the compiled contract from the HelloHedera.json file
let helloHedera = require('./contracts/HelloHedera.json');
const bytecode = helloHedera.data.bytecode.object;
const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_PVKEY = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forPreviewnet().setOperator(OPERATOR_ID, OPERATOR_PVKEY);

async function main() {
  // console.log(util.inspect(bytecode));
  // console.log(util.inspect(helloHedera));
  // console.log(util.inspect(helloHedera.data));
  // console.log(util.inspect(helloHedera.data.bytecode));
  // console.log(OPERATOR_PVKEY);
  // console.log(OPERATOR_ID);

  // create a file on hedera and store the hex-encoded bytecode
  const fileCreateTx = new FileCreateTransaction()
    // set the bytecode of the contract
    .setContents(bytecode);
  // console.log(util.inspect(fileCreateTx));

  // submit the file to the hedera test network signing with the transaction fee payer key specified in the client
  const submitTx = await fileCreateTx.execute(client);

  // get the receipt of the file create transaction
  const fileReceipt = await submitTx.getReceipt(client);

  // get the file ID from the receipt
  const bytecodeFileId = fileReceipt.fileId;

  // log the file ID
  console.log(`- The smart contract byte code file ID is ${bytecodeFileId}`);




}

main();
