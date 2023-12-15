import { create } from 'kubo-rpc-client'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config("./.env");

const ipfs = create(new URL(process.env.IPFS_URL))

export async function uploadFileToIPFS(filepath) {
    try {
        const file = fs.readFileSync(filepath)
        const result = await ipfs.add({ path: filepath, content: file })
        // console.log(result)
        return result
    } catch (error) {
        console.error('Failed to add file to IPFS:', error);
    }
}


export async function uploadJsonToIPFS(json) {
    try {
        const result = await ipfs.add(JSON.stringify(json))
        // console.log(result)
        return result
    } catch (error) {
        console.error('Failed to add JSON to IPFS:', error);
    }
}

//测试能否成功上传到ipfs网络并得到cid
// uploadFileToIPFS('files/play.jpg')
// uploadJsonToIPFS({
//     "name": "app.js",
// })


