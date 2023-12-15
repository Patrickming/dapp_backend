import { ethers, JsonRpcProvider } from "ethers";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config("./.env");

export async function mint(to, uri) {
    const provider = new JsonRpcProvider(process.env.RPC);
    const signer = await provider.getSigner()
    const NFTAbi = JSON.parse(fs.readFileSync('./abis/MyToken.json'));
    
    const NFTContract = new ethers.Contract(process.env.NFT, NFTAbi, signer);

    const result = await NFTContract.safeMint(to, uri);
    console.log(result.hash);
}

// //测试
// mint("0x5FbDB2315678afecb367f032d93F642f64180aa3", "https://sample.com")

