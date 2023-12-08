import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { uploadJsonToIPFS, uploadFileToIPFS } from './ipfs-uploader.js';
import { mint } from './nft-mint.js';

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());



app.get('/', (req, res) => {
    res.render('home');
});



app.post('/upload', (req, res) => {
    // console.log("body", req.body);
    const title = req.body.title;
    const description = req.body.description;

    const file = req.files.file;
    // console.log("file", file);
    const fileName = file.name;;
    const filePath = "files/" + fileName;
    file.mv(filePath, async err => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    
        //上传图片到ipfs 获取CID
        const fileRestul = await uploadFileToIPFS(filePath);
        const fileCID = fileRestul.cid.toString();
        console.log("fileCID", fileCID);

        //生成meta数据 包含CID、imageName、imageDesciption etc.
        const metadata = {
            title: title,
            description: description,
            image: 'http://localhost:8080/ipfs/' + fileCID
        }
        //上传META数据到IPFS，获取CID
        const metadataResult = await uploadJsonToIPFS(metadata);
        const metadataCID = metadataResult.cid.toString();
        // console.log("metadataCID", metadataCID);

        //铸造NFT，包含MTEA数据的CID
        await mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "http://localhost:8080/ipfs" + metadataCID)

        //回显前端
        res.json({
            success: true,
            message: 'upload successful',
            metadata: metadata,
        })
    })



});

const HOST = '127.0.0.1';
const PORT = 3000;

app.listen(PORT, HOST, () => {
    console.log(`服务已启动....listening on ${HOST}:${PORT}`);
});
