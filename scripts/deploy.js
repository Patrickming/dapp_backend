const { ethers } = require("hardhat");

async function main() {
  // 获取签名者（账户）
  const accounts = await ethers.getSigners();
  const account1 = accounts[0];

  // 获取合约工厂
  const MyContractFactory = await ethers.getContractFactory("MyToken", account1);

  // 部署合约
  const MyToken = await MyContractFactory.deploy(account1);

  // 等待合约部署完成
  // await MyToken.deployed();

  // 输出部署后的合约地址
  // console.log("MyContract deployed to:", MyToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
