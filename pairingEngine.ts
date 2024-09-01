export type teamsFileContent = { [couch: string]: string | string[] }
type team = { coach: string; name: string; possiblePairings: team[] }
export type pairing = [string, string]
export type roundPairings = pairing[]
export type rounds = roundPairings[]

export class PairingEngine {
	public teams: team[]
	constructor(public teamsFile: teamsFileContent, public rounds: rounds) {
		this.teams = splitToTeams(teamsFile)
	}
	public findAllPairings() {
		for (const team of this.teams) {
			team.possiblePairings = this.teams.filter((t) => t !== team && t.coach !== team.coach)
		}
		return this
	}
	public removePastPairings() {
		for (const round of this.rounds) {
			for (const pairing of round) {
				const teamA = this.teams.find((t) => t.name === pairing[0])
				const teamB = this.teams.find((t) => t.name === pairing[1])
				teamA!.possiblePairings = teamA!.possiblePairings.filter((t) => t !== teamB)
				teamB!.possiblePairings = teamB!.possiblePairings.filter((t) => t !== teamA)
			}
		}
		// this.teams.forEach((team) => {
		// 	console.log(
		// 		team.name,
		// 		team.possiblePairings.length,
		// 		team.possiblePairings.map((t) => t.name),
		// 	)
		// })
		return this
	}

	public pairTeams(): roundPairings | undefined {
		const pairings: [string, string][] = []
		while (this.teams.length > 1) {
			orderByNumberOfPairings(this.teams)
			// console.log('Ordered: ', this.teams.map((t) => t.name))
			const teamA = this.teams.shift()!
			if (teamA.possiblePairings.length === 0) {
				console.error('No possible pairings for team', teamA.name)
				return undefined
			}
			const teamB = findTeamWithLeastPairings(teamA.possiblePairings)
			this.teams = this.teams.filter((t) => t !== teamB)
			// remove teamA and teamB from possible pairings of remainging teams
			for (const team of this.teams) {
				team.possiblePairings = team.possiblePairings.filter((t) => t !== teamA && t !== teamB)
			}
			pairings.push([teamA.name, teamB.name])
		}
		return pairings
	}
}

/** Teams file is grouped by coach but for pairing we want to deal with array of teams */
function splitToTeams(teamsFile: teamsFileContent): team[] {
	const teams: team[] = []
	for (const coach in teamsFile) {
		if (typeof teamsFile[coach] === 'string') {
			const team: team = {
				coach,
				name: teamsFile[coach] as string,
				possiblePairings: [],
			}
			teams.push(team)
		} else {
			for (const name of teamsFile[coach] as string[]) {
				const team: team = {
					coach,
					name,
					possiblePairings: [],
				}
				teams.push(team)
			}
		}
	}
	return teams
}

/** Orders the teams based on the number of their pairings descending */
function orderByNumberOfPairings(teams: team[]) {
	teams.sort((a, b) => {
		return a.possiblePairings.length - b.possiblePairings.length + Math.random() - 0.5
	})
}

/** Finds teams with most possible pairings and picks randomly one of them */
function findTeamWithLeastPairings(possiblePairings: team[]) {
	return possiblePairings.sort((a, b) => {
		return a.possiblePairings.length - b.possiblePairings.length + Math.random() - 0.5
	})[0]
}
