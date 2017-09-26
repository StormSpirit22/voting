const Voting = require('./index')

async function run() {
  const candidates = [
    'Tim',
    'Iwan',
    'Rama',
    'Cathy'
  ]
  const voting = new Voting({candidates})

  voting.compile()
  await voting.launchBlockchain()
  await voting.deployContract()

  await voting.vote('Tim')
  console.log('Voted Tim.')
  await voting.vote('Tim')
  console.log('Voted Tim.')
  await voting.vote('Tim')
  console.log('Voted Tim.')
  await voting.vote('Iwan')
  console.log('Voted Iwan.')
  await voting.vote('Iwan')
  console.log('Voted Iwan.')
  await voting.vote('Cathy')
  console.log('Voted Cathy.')
  await voting.vote('Rama')
  console.log('Voted Rama.')
  await voting.vote('Rama')
  console.log('Voted Rama.')
  console.log()

  const scores = await voting.getScores()
  console.log('Voting result:')
  console.log(scores)
}

run()
