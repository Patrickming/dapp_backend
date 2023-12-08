import { create } from 'kubo-rpc-client'
import fs from 'fs'


const ipfs_url = 'http://127.0.0.1:5001'
const ipfs = create(new URL(ipfs_url))

export async function uploadFileToIPFS(filepath) {
    const file = fs.readFileSync(filepath)
    const result = await ipfs.add({ path: filepath, content: file })
    // console.log(result)
    return result
}


export async function uploadJsonToIPFS(json) {
    const result = await ipfs.add(JSON.stringify(json))
    // console.log(result)
    return result
}

//测试能否成功上传到ipfs网络并得到cid
// uploadFileToIPFS('files/play.jpg')
// uploadJsonToIPFS({
//     "name": "app.js",
// })


