# Voting dApp – Truffle & Ganache (MG3012 – Assignment 3)

**Student:** Noorah | **Roll No:** 24I-5669
**Course:** MG3012 – Blockchain Technology for Business (Dr. Usama Arshad)
**Program:** BSFT – 5th Semester (Fall 2026)

This project extends Assignment 2. The same `SimpleVoting` smart contract is now compiled and deployed with the **Truffle Suite** on a local **Ganache** blockchain (instead of Remix + Sepolia). A simple HTML/CSS/JavaScript frontend using **ethers.js** talks to the deployed contract.

## What the contract does
| Function | Type | Description |
|---|---|---|
| `addCandidate(string)` | Write | Only the owner (deployer) can add a candidate |
| `vote(uint256)` | Write | Each account can vote once |
| `getCandidateCount()` | Read | Number of candidates |
| `getCandidate(uint256)` | Read | Name and votes of one candidate |
| `getWinner()` | Read | Candidate currently leading |
| `owner()` / `hasVoted(address)` | Read | Contract owner / has an account voted |

## Folder structure
```
├── contracts/
│   └── SmartContract.sol        (SimpleVoting contract)
├── migrations/
│   └── 1_deploy_contract.js     (deployment script)
├── test/
│   └── SimpleVoting.test.js     (5 automated tests)
├── src/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── logo.svg
├── build/contracts/             (created by truffle compile / migrate)
├── truffle-config.js
├── README.md
└── screenshots/                 (compile, migrate, test and UI screenshots)
```

## Requirements
- Windows with **Node.js (LTS 18 or 20 recommended)** – check with `node -v`
- Internet connection for the first install and first compile
- Google Chrome

## Setup steps
1. Install Truffle (command line):
   ```
   npm install -g truffle
   ```
2. Install the **Ganache desktop app** from https://archive.trufflesuite.com/ganache/ (Windows download).
3. Check the installation:
   ```
   node -v
   truffle version
   ```
4. (How this project was created) A new folder was made and `truffle init` was run in it. The contract was copied into `contracts/`, the migration was added to `migrations/`, and `truffle-config.js` was edited to connect to Ganache on `127.0.0.1:7545`.

## Commands used (run each in the project folder)
**Step 1 – start the local blockchain (keep it open):**
Open the **Ganache** desktop app and click **Quickstart**. Ganache listens on `http://127.0.0.1:7545` and gives 10 accounts with 100 ETH each.

**Terminal – compile, deploy, test:**
```
truffle compile
truffle migrate
truffle test
```
If you need to deploy again from scratch: `truffle migrate --reset`.

**Terminal – run the frontend:**
```
npx http-server -p 3000
```
(or `python -m http.server 3000`), then open **http://localhost:3000/src/index.html** in Chrome.

## How to test the project
1. Click **Connect to Ganache**. The page loads the contract address from `build/contracts/SimpleVoting.json` and shows 10 accounts. Account 0 is the owner.
2. With Account 0 selected, type `Candidate A` and click **Add Candidate**. Do the same for `Candidate B`.
3. Click **Load Candidates** – both candidates appear with 0 votes.
4. Switch to **Account 1** in the dropdown, enter `0` and click **Vote**. The votes and progress bar update.
5. Click **Show Current Leader** – it shows Candidate A with 1 vote.
6. Try voting again with Account 1 – the page shows the error **"You have already voted"**.
7. Switch to **Account 2** and vote for `1` to see a second voter work.
8. Try **Add Candidate** with Account 1 – it fails with **"Only owner can add candidates"**.

### Optional: use MetaMask with Ganache
1. In MetaMask add a custom network: RPC URL `http://127.0.0.1:7545`, Chain ID `1337`, symbol `ETH`.
2. Import a Ganache account using its private key (shown in the Ganache terminal).
3. Click **Connect MetaMask (optional)** on the page.

## Screenshots
The `screenshots/` folder contains:
1. Truffle and Node versions installed
2. Ganache app running (Quickstart, 10 accounts, RPC server 127.0.0.1:7545)
3. `truffle compile` – successful compilation
4. `truffle migrate` – successful deployment with the contract address
5. Ganache app – Transactions tab showing the contract creation
6. The dApp connected to Ganache
7. Adding candidates and voting through the UI (candidate votes and leader)
8. Ganache app – Transactions tab after adding candidates and voting

## Notes
- The file `test/SimpleVoting.test.js` contains 5 automated tests (owner, add candidate, non-owner blocked, vote and winner, double vote blocked). Run them with `truffle test`.
- The contract address changes every time `truffle migrate --reset` is run on a new Ganache workspace. The frontend reads the current address automatically from `build/contracts/SimpleVoting.json`.

## Technologies
Solidity 0.8.20, Truffle, Ganache, Node.js, HTML, CSS, JavaScript, ethers.js v6.
