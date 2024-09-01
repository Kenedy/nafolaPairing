import fs from 'fs'
import { PairingEngine, type teamsFileContent, type rounds } from './pairingEngine'

const teamsFile = require('./2024/teams.json') as teamsFileContent
const rounds = fs.existsSync('./2024/rounds.json') ? (require('./2024/rounds.json') as rounds) : []

const pairing = new PairingEngine(teamsFile, rounds)
	.findAllPairings()
	.removePastPairings()
	.pairTeams()

if (pairing) {
	rounds.push(pairing)
	console.log(`Pairing for round ${rounds.length}:`)
	pairing.forEach((pair) => {
		console.log(pair[0], 'vs', pair[1])
	})
	fs.writeFileSync('./2024/rounds.json', JSON.stringify(rounds, null, 2))
}
