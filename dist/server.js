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
const REGISTERED_BANKS = ['icici', 'hdfc', 'sbi', 'rbi'];
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
app.post('/registerBank', async (req, res) => {
    const { bank, name, pin, mobile, aadhaar, profilePicUrl, accountNumber, ifscCode } = req.body;
    if (!validateInput([
        { value: bank, type: 'string' },
        { value: name, type: 'string' },
        { value: pin, type: 'string', length: 6 },
        { value: mobile, type: 'string', length: 10 },
        { value: aadhaar, type: 'string', length: 12 },
        { value: profilePicUrl, type: 'string' },
        { value: accountNumber, type: 'string' },
        { value: ifscCode, type: 'string' },
    ])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    if (!REGISTERED_BANKS.includes(bank)) {
        res.status(400).json({ "error": "Invalid bank" });
        return;
    }
    const vpa = `${mobile}@${bank}`;
    db.all(`SELECT * FROM ${bank}_users WHERE vpa = "${vpa}"`, async (err, rows) => {
        if (err || rows.length) {
            res.status(400).json({ "error": err ? err.message : "Already registered" });
            return;
        }
        const privateKey = generateBankPrivateKey(pin, bank, accountNumber, ifscCode);
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
        db.run(`INSERT INTO ${bank}_users (vpa, publicKey, mobile, aadhaar, name, profilePicUrl, accountNumber, ifscCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [vpa, publicKey, mobile, aadhaar, name, profilePicUrl, accountNumber, ifscCode], (err) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            return res.send(vpa);
        });
    });
});
// Only authority user should be able to call this end point.
// For demo ease this is publically exposed but in reality this shouldn't be even exposed.
app.post('/mint', async (req, res) => {
    const { vpa, amount } = req.body;
    if (!validateInput([{ value: vpa, type: 'string' }, { value: amount, type: 'number' }])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    let bank = vpa.split('@')[1];
    if (bank === 'wallet') {
        bank = 'rbi';
    }
    if (!REGISTERED_BANKS.includes(bank)) {
        res.status(400).json({ "error": "Invalid vpa bank" });
        return;
    }
    db.all(`SELECT * FROM ${bank}_users WHERE vpa = "${vpa}"`, async (err, rows) => {
        if (err || rows.length === 0) {
            res.status(400).json({ "error": err ? err.message : "VPA not found" });
            return;
        }
        const publicKey = rows[0].publicKey;
        try {
            const signer = new ethers_1.ethers.Wallet(AUTHORITY_PRIVATE_KEY, new ethers_1.ethers.JsonRpcProvider(NETWORK_URL));
            const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, DigitalRupee_json_1.default.abi, signer);
            return res.send(await contract.mint(publicKey, amount));
        }
        catch (err) {
            res.status(400).json({ "error": err });
            return;
        }
    });
});
// Only authority user should be able to call this end point.
// For demo ease this is publically exposed but in reality this shouldn't be even exposed.
app.post('/burn', async (req, res) => {
    const { amount } = req.body;
    if (!validateInput([{ value: amount, type: 'number' }])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    try {
        const signer = new ethers_1.ethers.Wallet(AUTHORITY_PRIVATE_KEY, new ethers_1.ethers.JsonRpcProvider(NETWORK_URL));
        const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, DigitalRupee_json_1.default.abi, signer);
        return res.send(await contract.burn(amount));
    }
    catch (err) {
        res.status(400).json({ "error": err });
        return;
    }
});
app.post('/getDetails', async (req, res) => {
    const { vpa, pin } = req.body;
    if (!validateInput([{ value: vpa, type: 'string' }, { value: pin, type: 'string', length: 6 }])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    let bank = vpa.split('@')[1];
    if (bank === 'wallet') {
        bank = 'rbi';
    }
    if (!REGISTERED_BANKS.includes(bank)) {
        res.status(400).json({ "error": "Invalid vpa bank" });
        return;
    }
    db.all(`SELECT * FROM ${bank}_users WHERE vpa = "${vpa}"`, async (err, rows) => {
        if (err || rows.length === 0) {
            res.status(400).json({ "error": err ? err.message : "Not found" });
            return;
        }
        const pic = rows[0]['pic'];
        const mobile = rows[0]['mobile'];
        const aadhaar = rows[0]['aadhaar'];
        const name = rows[0]['name'];
        const publicKey = rows[0]['publicKey'];
        const flag = rows[0]['flag'];
        try {
            const privateKey = generateWalletPrivateKey(pin, mobile, aadhaar);
            const signer = new ethers_1.ethers.Wallet(privateKey, new ethers_1.ethers.JsonRpcProvider(NETWORK_URL));
            const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, DigitalRupee_json_1.default.abi, signer);
            const balance = (await contract.balanceOf(publicKey)).toString();
            const status = 0;
            return res.send({ flag, name, mobile, aadhaar, pic, balance });
        }
        catch (err) {
            res.status(400).json({ "error": err });
            return;
        }
    });
});
app.post('/detailsLinkedWithNumber', async (req, res) => {
    const { mobile, pin } = req.body;
    if (!validateInput([
        { value: mobile, type: 'string', length: 10 },
        { value: pin, type: 'string', length: 6 }
    ])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    let foundDetails = [];
    for (const bank of REGISTERED_BANKS) {
        db.all(`SELECT * FROM ${bank}_users WHERE mobile = "${mobile}"`, async (err, rows) => {
            if (!err && rows.length !== 0) {
                const pic = rows[0]['pic'];
                const mobile = rows[0]['mobile'];
                const aadhaar = rows[0]['aadhaar'];
                const name = rows[0]['name'];
                const publicKey = rows[0]['publicKey'];
                const vpa = rows[0]['vpa'];
                const flag = rows[0]['flag'];
                try {
                    const privateKey = generateWalletPrivateKey(pin, mobile, aadhaar);
                    const signer = new ethers_1.ethers.Wallet(privateKey, new ethers_1.ethers.JsonRpcProvider(NETWORK_URL));
                    const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, DigitalRupee_json_1.default.abi, signer);
                    const balance = (await contract.balanceOf(publicKey)).toString();
                    if (bank === 'rbi') {
                        foundDetails.push({ flag, vpa, name, mobile, aadhaar, pic, balance });
                    }
                    else {
                        foundDetails.push({ flag, vpa, name, mobile, aadhaar, pic, balance, accountNumber: rows[0]['accountNumber'], ifscCode: rows[0]['ifscCode'] });
                    }
                }
                catch (err) {
                    res.status(400).json({ "error": err });
                    return;
                }
            }
            if (bank === REGISTERED_BANKS.slice(-1)[0]) {
                res.send(foundDetails);
            }
        });
    }
});
app.post('/transfer', async (req, res) => {
    const { vpaFrom, pin, vpaTo, amount } = req.body;
    if (!validateInput([
        { value: vpaFrom, type: 'string' },
        { value: pin, type: 'string', length: 6 },
        { value: vpaTo, type: 'string' },
        { value: amount, type: 'number' },
    ])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    let bankFrom = vpaFrom.split('@')[1];
    if (bankFrom === 'wallet') {
        bankFrom = 'rbi';
    }
    let bankTo = vpaTo.split('@')[1];
    if (bankTo === 'wallet') {
        bankTo = 'rbi';
    }
    if (!REGISTERED_BANKS.includes(bankFrom) || !REGISTERED_BANKS.includes(bankTo)) {
        res.status(400).json({ "error": "Invalid vpa bank" });
        return;
    }
    db.all(`SELECT * FROM ${bankFrom}_users WHERE vpa = "${vpaFrom}"`, async (err, rowsFrom) => {
        if (err || !rowsFrom.length) {
            res.status(400).json({ "error": err ? err.message : "Vpa from found" });
            return;
        }
        const privateKey = bankFrom === 'rbi' ?
            generateWalletPrivateKey(pin, rowsFrom[0].mobile, rowsFrom[0].aadhaar) :
            generateBankPrivateKey(pin, bankFrom, rowsFrom[0].accountNumber, rowsFrom[0].ifsc);
        db.all(`SELECT * FROM ${bankTo}_users WHERE vpa = "${vpaTo}"`, async (err, rowsTo) => {
            if (err || !rowsTo.length) {
                res.status(400).json({ "error": err ? err.message : "Vpa to found" });
                return;
            }
            try {
                const signer = new ethers_1.ethers.Wallet(privateKey, new ethers_1.ethers.JsonRpcProvider(NETWORK_URL));
                const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, DigitalRupee_json_1.default.abi, signer);
                const response = await contract.transfer(rowsTo[0].publicKey, amount);
                if (response.hash !== undefined && typeof (response.hash) === "string") {
                    // Add to transactions table.
                    db.run(`INSERT INTO ${bankFrom}_transactions (vpaFrom, vpaTo, amount, timestamp) VALUES (?, ?, ?, ?)`, [vpaFrom, vpaTo, amount, Date.now().toString()], (err) => {
                        if (err) {
                            res.status(400).json({ "error": err.message });
                            return;
                        }
                        return res.send("SUCCESS");
                    });
                }
                else {
                    res.send("FAILED");
                }
            }
            catch (err) {
                res.status(400).json({ "error": err });
                return;
            }
        });
    });
});
app.post('/history', async (req, res) => {
    const { vpa, pin } = req.body;
    if (!validateInput([{ value: vpa, type: 'string' }, { value: pin, type: 'string', length: 6 }])) {
        res.status(400).json({ "error": "Invalid params" });
        return;
    }
    let bank = vpa.split('@')[1];
    if (bank === 'wallet') {
        bank = 'rbi';
    }
    db.all(`SELECT * FROM ${bank}_transactions WHERE vpaFrom = "${vpa}"`, async (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.send(rows);
    });
});
app.listen(SERVER_PORT, () => {
    return console.log(`Express is listening at http://localhost:${SERVER_PORT}`);
});
function generateWalletPrivateKey(pin, mobile, aadhar) {
    const seed = (0, keccak256_1.default)(`${pin}${mobile}${aadhar}`).toString('hex');
    return `0x${seed}`;
}
function generateBankPrivateKey(pin, bank, accountNumber, ifsc) {
    const bankIndex = REGISTERED_BANKS.indexOf(bank);
    const seed = (0, keccak256_1.default)(`${pin}${bankIndex}${accountNumber}${ifsc}`).toString('hex');
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
