import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import digitalRupeeAbi from "./artifacts/contracts/DigitalRupee.sol/DigitalRupee.json";
import * as fs from 'fs';
import keccak256 from 'keccak256';
import sqlite3 from 'sqlite3';

const NETWORK_URL = "http://localhost:8545";
const AUTHORITY_PRIVATE_KEY = "1b85dda22f84f7e1f48bd125d345bc47b79be0c64465ecca03efa748afc956a5";
const SERVER_PORT = 5008;
const CONTRACT_ADDRESS = fs.readFileSync('./deployed-contract-address', 'utf-8');
const app = express();
app.use(cors())
app.use(express.json());
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

app.post('/registerWallet', async (req, res) => {
    const { name, pin, mobile, aadhaar, profilePicUrl } = req.body;
    if (!validateInput([
        { value: name, type: 'string' },
        { value: pin, type: 'string', length: 6 },
        { value: mobile, type: 'string', length: 10 },
        { value: aadhaar, type: 'string', length: 12 },
        { value: profilePicUrl, type: 'string' },
    ])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }

    const vpa = `${mobile}@wallet`;
    db.all(`SELECT * FROM rbi_users WHERE vpa = "${vpa}"`, async (err, rows) => {
        if (err || rows.length) {
            res.status(400).json({ "error": err ? err.message : "Already registered" });
            return;
        }

        const privateKey = generateWalletPrivateKey(pin, mobile, aadhaar);
        const wallet = new ethers.Wallet(privateKey);
        const publicKey = wallet.address;

        // Authority in real scenario should first validate documents, it will be a manual process that will take some time
        // Once validated authority will manually use their secret private key to sign the contract to register the user.
        // For the sake of demo directly using private key.
        try {
            const signer = new ethers.Wallet(AUTHORITY_PRIVATE_KEY, new ethers.JsonRpcProvider(NETWORK_URL));
            const contract = new ethers.Contract(CONTRACT_ADDRESS, digitalRupeeAbi.abi, signer);
            if (!(await contract.authorizedAddresses(publicKey))) {
                await contract.enableAccount(publicKey, { value: ethers.parseEther("10") });
            }
        } catch (err) {
            res.status(400).json({ "error": err });
            return;
        }

        db.run("INSERT INTO rbi_users (vpa, publicKey, mobile, aadhaar, name, profilePicUrl) VALUES (?, ?, ?, ?, ?, ?)",
            [vpa, publicKey, mobile, aadhaar, name, profilePicUrl],
            (err) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                return res.send(vpa);
            });
    });
});

app.listen(SERVER_PORT, () => {
    return console.log(`Express is listening at http://localhost:${SERVER_PORT}`);
});

function generateWalletPrivateKey(pin: string, mobile: string, aadhar: string): string {
    const seed = keccak256(`${pin}${mobile}${aadhar}`).toString('hex');
    return `0x${seed}`;
}

function validateInput(input: Array<{ value: any, type: string, length?: number }>) {
    for (const { value, type, length } of input) {
        if (value === undefined || value === null || typeof (value) !== type) {
            if (!length || (type !== 'string' || (value as string).length !== length)) {
                return false;
            }
        }
    }
    return true;
}
