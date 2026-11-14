const SimpleVoting = artifacts.require("SimpleVoting");

contract("SimpleVoting", (accounts) => {
  const owner = accounts[0];
  const voter = accounts[1];
  let voting;

  beforeEach(async () => {
    voting = await SimpleVoting.new({ from: owner });
  });

  it("sets the deployer as owner", async () => {
    assert.equal(await voting.owner(), owner);
  });

  it("lets the owner add candidates", async () => {
    await voting.addCandidate("Candidate A", { from: owner });
    await voting.addCandidate("Candidate B", { from: owner });
    const count = await voting.getCandidateCount();
    assert.equal(count.toString(), "2");
    const c = await voting.getCandidate(0);
    assert.equal(c[0], "Candidate A");
    assert.equal(c[1].toString(), "0");
  });

  it("does not let a non-owner add candidates", async () => {
    try {
      await voting.addCandidate("Hacker", { from: voter });
      assert.fail("Expected revert");
    } catch (err) {
      assert.include(err.message, "Only owner");
    }
  });

  it("counts a vote and finds the winner", async () => {
    await voting.addCandidate("Candidate A", { from: owner });
    await voting.addCandidate("Candidate B", { from: owner });
    await voting.vote(1, { from: voter });
    const w = await voting.getWinner();
    assert.equal(w[0], "Candidate B");
    assert.equal(w[1].toString(), "1");
  });

  it("blocks double voting from the same account", async () => {
    await voting.addCandidate("Candidate A", { from: owner });
    await voting.vote(0, { from: voter });
    try {
      await voting.vote(0, { from: voter });
      assert.fail("Expected revert");
    } catch (err) {
      assert.include(err.message, "already voted");
    }
  });
});
