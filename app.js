import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { uploadJsonToIPFS, uploadFileToIPFS } from './ipfs-uploader.js';
import { mint } from './nft-mint.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config("./.env");


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());
app.use(cors())


app.get('/', (req, res) => {
    res.render('home');
});



app.post('/upload', (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded.' });
    }

    // console.log("body", req.body);
    const title = req.body.title;
    const description = req.body.description;
    //这个是得到界面当前的账户address
    const address = req.body.address
    console.log(title, description, address)

    const file = req.files.file;
    // console.log("file", file);
    const fileName = file.name;;
    const filePath = "files/" + fileName;
    file.mv(filePath, async err => {
        if (err) {
            console.log('error: failed to download the file.');
            return res.status(500).send(err);
        }
    
        //上传图片到ipfs 获取CID
        const fileRestul = await uploadFileToIPFS(filePath);
        const fileCID = fileRestul.cid.toString();
        console.log('File added to IPFS:', fileCID);

        //生成meta数据 包含CID、imageName、imageDesciption etc.
        const metadata = {
            title: title,
            description: description,
            image: 'http://localhost:8080/ipfs/' + fileCID + '/' + fileName //增加了 '/' + fileName
        }
        //上传META数据到IPFS，获取CID
        const metadataResult = await uploadJsonToIPFS(metadata);
        const metadataCID = metadataResult.cid.toString();
        console.log('Metadata added to IPFS:', metadataCID);

        //铸造NFT给当前页面的账户，包含MTEA数据的CID  
        //并且如果界面没有连接账户 就默认铸造给设定好的默认账户ADDRESS
        const userAddress = address || process.env.ADDRESS;
        await mint(userAddress, "http://localhost:8080/ipfs" + metadataCID)

        //回显前端
        res.json({
            success: true,
            message: 'upload successful',
            metadata: metadata,
        })
    })



});


const HOST = process.env.HOST 
const PORT = process.env.PORT

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${HOST}:${PORT}`);
});
