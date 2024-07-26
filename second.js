const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");
const fs = require("fs");

const bytecodePath = path.join(__dirname, "0.bin");
const bytecode = fs.readFileSync(bytecodePath, "utf8");

// Project secrets are hardcoded here - do not do this in real life

// No 0x prefix
const myPrivateKeyHex =
  "0xacf739d93b303f098ce36fdc76589b1451cca5f0276482e427732ed01e81c1d4";
const infuraProjectId = "be7c518afb7844039a2ae1af79fd898e";

const provider = new HDWalletProvider({
  privateKeys: [myPrivateKeyHex],
  providerOrUrl: `https://sepolia.infura.io/v3/${infuraProjectId}`,
});

const web3 = new Web3(provider);

const myAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKeyHex);

const abi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "_newFactory", type: "address" }],
    name: "addFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "factoryIndex", type: "uint256" },
          { internalType: "bool", name: "mintable", type: "bool" },
          { internalType: "bool", name: "burnable", type: "bool" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "ticker", type: "string" },
          { internalType: "uint256", name: "initialSupply", type: "uint256" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
          { internalType: "bool", name: "taxToken", type: "bool" },
          { internalType: "uint256", name: "sellTax", type: "uint256" },
          { internalType: "uint256", name: "buyTax", type: "uint256" },
          { internalType: "uint256", name: "liquidityShare", type: "uint256" },
          { internalType: "uint256", name: "teamShare", type: "uint256" },
        ],
        internalType: "struct IAlienbaseTokenFactory.DeploymentParams",
        name: "params",
        type: "tuple",
      },
      { internalType: "bytes", name: "additionalData", type: "bytes" },
    ],
    name: "deployToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "factories",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "removeFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_fee", type: "uint256" }],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const myContract = new web3.eth.Contract(abi);
myContract.handleRevert = true;

async function deploy() {
  const contractDeployer = myContract.deploy({
    data: "0x" + bytecode,
  });

  try {
    const gas = await contractDeployer.estimateGas({
      from: myAccount.address,
    });
    console.log("Estimated gas:", gas);

    const tx = await contractDeployer.send({
      from: myAccount.address,
      gas,
      gasPrice: 10000000000,
    });
    console.log("Contract deployed at address: " + tx.options.address);

    const deployedAddressPath = path.join(__dirname, "MyContractAddress.txt");
    fs.writeFileSync(deployedAddressPath, tx.options.address);
  } catch (error) {
    console.error("Error during deployment:", error);
  }
}

deploy();
