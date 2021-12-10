console.clear();
const util = require('util');
const { Hbar, ContractCallQuery, ContractFunctionParameters, ContractCreateTransaction, FileCreateTransaction, Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
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

  // instantiate the contract instance
  const contractTx = await new ContractCreateTransaction()
    // set the file ID of the hedera file storing the bytecode
    .setBytecodeFileId(bytecodeFileId)
    // set the gas to instantiate the contract
    .setGas(100000)
    // provide the contstructor parameters for the contract
    .setConstructorParameters(new ContractFunctionParameters().addString('Hello from Hedera!'));
  // console.log(util.inspect(contractTx));

  // submit the transaction to the hedera network
  const contractResponse = await contractTx.execute(client);

  // get the receipt of the file create transaction
  const contractReceipt = contractResponse.getReceipt(client);

  // get the smart contract ID
  const newContractID = (await contractReceipt).contractId;

  // log the smart contract ID
  console.log(`- The smart contract ID is ${newContractID}`);

  // calls a function of the smart contract
  const contractQuery = await new ContractCallQuery()
    // set the gas for the query
    .setGas(100000)
    // set the contract ID to return the request for
    .setContractId(newContractID)
    // set the contract function call
    .setFunction('get_message')
    // set the query payment for the node returning the request
    // this value must cover the cost of the request otherwise will fail
    .setQueryPayment(new Hbar(2));
  // console.log(util.inspect(contractQuery));

  // submit to a hedera network
  const getMessage = await contractQuery.execute(client);
  // console.log(util.inspect(getMessage));

  // get a string from the result at index 0
  const message = getMessage.getString(0);
  // console.log(util.inspect(message));

  // log the message
  console.log(`- The contract message: ${message}`);
}

main();
