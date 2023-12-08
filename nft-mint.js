import { ethers, JsonRpcProvider } from "ethers";
import fs from 'fs';


export async function mint(to, uri) {
    const provider = new JsonRpcProvider("http://127.0.0.1:8545");//这里不能写localhost
    const signer = await provider.getSigner()
    const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const NFTAbi = JSON.parse(fs.readFileSync('./abis/MyToken.json'));
    
    const NFTContract = new ethers.Contract(ContractAddress, NFTAbi, signer);

    const result = await NFTContract.safeMint(to, uri);
    console.log(result.hash);
}

// //测试
// mint("0x5FbDB2315678afecb367f032d93F642f64180aa3", "https://sample.com")

