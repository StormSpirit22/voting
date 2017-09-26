module.exports = class Vote {
  constructor(candidates = []) {
    this.candidates = candidates
  }

  compile() {
    const code = require('fs')
      .readFileSync('./contracts/Voting.sol')
      .toString()
    const compiledCode = require('solc')
      .compile(code)

    const abiDefinition = compiledCode
      .contracts[':Voting']
      .interface
    const byteCode = compiledCode
      .contracts[':Voting']
      .bytecode

    this.contractDefinition = {
      abis: JSON.parse(abiDefinition),
      bin: byteCode,
    }
  }

  launchBlockchain() {
    return new Promise((resolve, reject) => {
      const trpc = require('ethereumjs-testrpc')
      trpc
        .server()
        .listen(8545, (err, bc) => {
          if (err) reject(err)

          const provider = trpc.provider()
          const Web3 = require('web3')
          const web3 = new Web3(provider)

          web3
            .eth
            .getAccounts()
            .then(accounts => accounts[0])
            .then((account) => {
              this.web3 = web3
              this.account = account
              resolve(true)
            })
            .catch(err => reject(err))
        })
    })
  }

  deployContract(gas) {
    const options = {
      data: this.contractDefinition.bin,
      from: this.account,
      gas: gas || 4700000,
    }
    const contract = new this.web3
      .eth
      .Contract(
        this.contractDefinition.abis,
        options
      )
    const encodedNames = this.candidates
      .map(str => encode(str))

    return contract
      .deploy({
        arguments: [encodedNames]
      })
      .send()
      .then((r) => {
        this.contractAddress = r._address
      })
  }

  vote(candidate, gas) {
    const options = {
      from: this.account,
      gas: gas || 4700000,
    }
    const contract = new this.web3
      .eth
      .Contract(
        this.contractDefinition.abis,
        this.contractAddress,
        options
      )
    const encodedName = encode(candidate)

    return contract
      .methods
      .voteForCandidate(encodedName)
      .send()
  }

  async getScores() {
    const contract = new this.web3
      .eth
      .Contract(
        this.contractDefinition.abis,
        this.contractAddress
      )

    const scores = {}
    for (let i = 0; i < this.candidates.length; i++) {
      const candidate = this.candidates[i]
      const score = await contract
        .methods
        .totalVotesFor(encode(candidate))
        .call()

      scores[candidate] = score
    }

    return scores
  }
}

function encode(str) {
  const hex = new Buffer(str)
    .toString('hex')

  return `0x${hex}`
}
