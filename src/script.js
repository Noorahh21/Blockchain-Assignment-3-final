// ===================================================================
// Voting dApp frontend (Assignment 3: Truffle + Ganache)
// - Reads the contract ABI + address from Truffle's build file
// - Connects to Ganache directly (JSON-RPC) or through MetaMask
// ===================================================================

const GANACHE_URL = "http://127.0.0.1:7545";               // Ganache desktop app (Quickstart)
// If you use the Ganache command-line version instead, change 7545 to 8545.
const BUILD_FILE = "../build/contracts/SimpleVoting.json"; // created by "truffle migrate"

let provider, signer, contract, contractData;
let mode = ""; // "ganache" or "metamask"

const el = (id) => document.getElementById(id);

function showStatus(msg, type) {
  el("status").textContent = msg;
  el("status").className = "box " + (type || "");
}

// ---------- 1. Load ABI + address that Truffle saved ----------
async function loadContractData() {
  const res = await fetch(BUILD_FILE);
  if (!res.ok) {
    throw new Error("Cannot find " + BUILD_FILE + ". Run 'truffle migrate' and start the page from the project's main folder.");
  }
  contractData = await res.json();
}

// Truffle saves the address under the network id it deployed to
function pickAddress(networkId) {
  const nets = contractData.networks || {};
  if (nets[networkId]) return nets[networkId].address;
  const ids = Object.keys(nets);
  if (ids.length === 0) throw new Error("Contract is not deployed yet. Run: truffle migrate");
  return nets[ids[ids.length - 1]].address; // fall back to the latest deployment
}

async function setupContract() {
  const networkId = String(await provider.send("net_version", []));
  const address = pickAddress(networkId);
  contract = new ethers.Contract(address, contractData.abi, signer);
  el("contractInfo").textContent = "Contract: " + address + " (network id " + networkId + ")";
}

// ---------- 2. Connect to Ganache directly ----------
async function connectGanache() {
  try {
    await loadContractData();
    provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts(); // Ganache gives 10 unlocked accounts
    if (accounts.length === 0) throw new Error("No accounts found in Ganache.");

    const select = el("accountSelect");
    select.innerHTML = "";
    accounts.forEach((acc, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = "Account " + i + (i === 0 ? " (owner)" : "") + ": " + acc.address;
      select.appendChild(opt);
    });
    el("accountRow").classList.remove("hidden");

    mode = "ganache";
    await useGanacheAccount(0);
    showStatus("Connected to Ganache.", "success");
  } catch (err) {
    showStatus("Ganache connection failed: " + (err.shortMessage || err.message) + " (Is Ganache running?)", "error");
  }
}

async function useGanacheAccount(index) {
  signer = await provider.getSigner(Number(index));
  await setupContract();
  await showWalletInfo();
  await refreshVotedInfo();
}

// ---------- 3. Connect through MetaMask (optional) ----------
async function connectMetaMask() {
  if (!window.ethereum) {
    showStatus("MetaMask not found. Use 'Connect to Ganache' instead.", "error");
    return;
  }
  try {
    await loadContractData();
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    mode = "metamask";
    el("accountRow").classList.add("hidden");
    await setupContract();
    await showWalletInfo();
    await refreshVotedInfo();
    showStatus("MetaMask connected. Make sure it is on the Ganache network.", "success");
  } catch (err) {
    showStatus("MetaMask connection failed: " + (err.shortMessage || err.message), "error");
  }
}

async function showWalletInfo() {
  const address = await signer.getAddress();
  const balance = ethers.formatEther(await provider.getBalance(address));
  el("walletInfo").textContent =
    "Connected (" + mode + "): " + address + " | Balance: " + Number(balance).toFixed(4) + " ETH";
}

function needWallet() {
  if (!contract) {
    showStatus("Please connect first (Ganache or MetaMask).", "error");
    return true;
  }
  return false;
}

// ---------- 4. READ functions ----------
async function loadCandidates() {
  if (needWallet()) return;
  try {
    const count = Number(await contract.getCandidateCount());
    const list = el("candidateList");
    list.innerHTML = "";
    if (count === 0) {
      list.innerHTML = "<li>No candidates yet.</li>";
      showStatus("No candidates yet. Add one first.", "success");
      return;
    }
    const rows = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
      const [name, votes] = await contract.getCandidate(i);
      rows.push({ i, name, votes: Number(votes) });
      total += Number(votes);
    }
    rows.forEach((r) => {
      const pct = total === 0 ? 0 : Math.round((r.votes / total) * 100);
      const li = document.createElement("li");
      li.innerHTML = "<b>[" + r.i + "]</b> " + r.name.replace(/</g, "&lt;") +
        " — " + r.votes + " vote(s)" +
        '<div class="bar"><span style="width:' + pct + '%"></span></div>';
      list.appendChild(li);
    });
    showStatus("Candidates loaded: " + count + " | Total votes: " + total, "success");
  } catch (err) {
    showStatus("Read failed: " + (err.shortMessage || err.message), "error");
  }
}

async function showWinner() {
  if (needWallet()) return;
  try {
    const [name, votes] = await contract.getWinner();
    el("winnerInfo").textContent = "Leader: " + name + " (" + votes.toString() + " votes)";
    showStatus("Leader fetched.", "success");
  } catch (err) {
    showStatus("Read failed: " + (err.reason || err.shortMessage || err.message), "error");
  }
}

async function refreshVotedInfo() {
  try {
    const voted = await contract.hasVoted(await signer.getAddress());
    el("votedInfo").textContent = voted
      ? "Voting status: this account has ALREADY voted"
      : "Voting status: this account has not voted yet";
  } catch (e) { /* ignore */ }
}

// ---------- 5. WRITE functions ----------
async function sendTx(txPromise, label) {
  try {
    showStatus(label + ": sending transaction…");
    const tx = await txPromise;
    showStatus("Transaction sent. Hash: " + tx.hash + " (waiting for confirmation…)");
    const receipt = await tx.wait();
    showStatus(label + " confirmed in block " + receipt.blockNumber + " | Hash: " + tx.hash, "success");
    await loadCandidates();
    await refreshVotedInfo();
    await showWalletInfo();
  } catch (err) {
    showStatus(label + " failed: " + (err.reason || err.shortMessage || err.message), "error");
  }
}

function addCandidate() {
  if (needWallet()) return;
  const name = el("candidateName").value.trim();
  if (!name) { showStatus("Enter a candidate name.", "error"); return; }
  sendTx(contract.addCandidate(name), "Add candidate");
}

function castVote() {
  if (needWallet()) return;
  const id = el("voteId").value;
  if (id === "") { showStatus("Enter a candidate number.", "error"); return; }
  sendTx(contract.vote(id), "Vote");
}

// ---------- 6. Button events ----------
el("ganacheBtn").addEventListener("click", connectGanache);
el("metamaskBtn").addEventListener("click", connectMetaMask);
el("accountSelect").addEventListener("change", (e) => useGanacheAccount(e.target.value));
el("loadBtn").addEventListener("click", loadCandidates);
el("winnerBtn").addEventListener("click", showWinner);
el("addBtn").addEventListener("click", addCandidate);
el("voteBtn").addEventListener("click", castVote);
