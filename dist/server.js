"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ethers_1 = require("ethers");
const DigitalRupee_json_1 = __importDefault(require("./artifacts/contracts/DigitalRupee.sol/DigitalRupee.json"));
const fs = __importStar(require("fs"));
const keccak256_1 = __importDefault(require("keccak256"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const NETWORK_URL = "http://localhost:8545";
const AUTHORITY_PRIVATE_KEY = "1b85dda22f84f7e1f48bd125d345bc47b79be0c64465ecca03efa748afc956a5";
const SERVER_PORT = 5008;
const CONTRACT_ADDRESS = fs.readFileSync('./deployed-contract-address', 'utf-8');
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const db = new sqlite3_1.default.Database('./database.db', (err) => {
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
        const wallet = new ethers_1.ethers.Wallet(privateKey);
        const publicKey = wallet.address;
        // Authority in real scenario should first validate documents, it will be a manual process that will take some time
        // Once validated authority will manually use their secret private key to sign the contract to register the user.
        // For the sake of demo directly using private key.
        try {
            const signer = new ethers_1.ethers.Wallet(AUTHORITY_PRIVATE_KEY, new ethers_1.ethers.JsonRpcProvider(NETWORK_URL));
            const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, DigitalRupee_json_1.default.abi, signer);
            if (!(await contract.authorizedAddresses(publicKey))) {
                await contract.enableAccount(publicKey, { value: ethers_1.ethers.parseEther("10") });
            }
        }
        catch (err) {
            res.status(400).json({ "error": err });
            return;
        }
        db.run("INSERT INTO rbi_users (vpa, publicKey, mobile, aadhaar, name, profilePicUrl) VALUES (?, ?, ?, ?, ?, ?)", [vpa, publicKey, mobile, aadhaar, name, profilePicUrl], (err) => {
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
function generateWalletPrivateKey(pin, mobile, aadhar) {
    const seed = (0, keccak256_1.default)(`${pin}${mobile}${aadhar}`).toString('hex');
    return `0x${seed}`;
}
function validateInput(input) {
    for (const { value, type, length } of input) {
        if (value === undefined || value === null || typeof (value) !== type) {
            if (!length || (type !== 'string' || value.length !== length)) {
                return false;
            }
        }
    }
    return true;
}
