import fs from "fs";

type teamsFileConntent = { [couch: string]: string | string[] };
type team = { coach: string; name: string; possiblePairings: team[] };
type pairing = [string, string];
type roundPairings = pairing[];
type rounds = roundPairings[];

const teamsFile = require("./2024/teams.json") as teamsFileConntent;
const rounds = fs.existsSync("./2024/rounds.json")
  ? (require("./2024/rounds.json") as rounds)
  : [];

const roundPairing = pairTeams(
  removePastPairings(transformAndFindAllPairings(teamsFile), rounds)
);

if (!roundPairing) {
  console.log("No possible pairings found");
  process.exit(1);
}
rounds.push(roundPairing);
console.log(roundPairing);

fs.writeFileSync("./2024/rounds.json", JSON.stringify(rounds, null, 2));

/** Transforms the teams file content into array of teams, finds all possible
 * parings */
function transformAndFindAllPairings(arg: teamsFileConntent): team[] {
  // Create an array of teams
  const teams: team[] = [];
  for (const coach in arg) {
    if (typeof arg[coach] === "string") {
      const team: team = {
        coach,
        name: arg[coach] as string,
        possiblePairings: [],
      };
      teams.push(team);
    } else {
      for (const name of arg[coach] as string[]) {
        const team: team = {
          coach,
          name,
          possiblePairings: [],
        };
        teams.push(team);
      }
    }
  }
  // Find all possible pairings for each team
  for (const team of teams) {
    team.possiblePairings = teams.filter(
      (t) => t !== team && t.coach !== team.coach
    );
  }
  return teams;
}

function removePastPairings(teams: team[], rounds: rounds) {
  for (const round of rounds) {
    for (const pairing of round) {
      const teamA = teams.find((t) => t.name === pairing[0]);
      const teamB = teams.find((t) => t.name === pairing[1]);
      teamA!.possiblePairings = teamA!.possiblePairings.filter(
        (t) => t !== teamB
      );
      teamB!.possiblePairings = teamB!.possiblePairings.filter(
        (t) => t !== teamA
      );
    }
  }
  return teams;
}

function pairTeams(teams: team[]): roundPairings | undefined {
  const pairings: [string, string][] = [];
  while (teams.length > 1) {
    orderByNumberOfPairings(teams);
    const teamA = teams.shift()!;
    if (teamA.possiblePairings.length === 0) {
      console.log("No possible pairings for team", teamA.name);
      return undefined;
    }
    const teamB = findTeamWithMostPairings(teamA.possiblePairings);
    teams = teams.filter((t) => t !== teamB);
    // remove teamA and teamB from possible pairings of remainging teams
    for (const team of teams) {
      team.possiblePairings = team.possiblePairings.filter(
        (t) => t !== teamA && t !== teamB
      );
    }
    pairings.push([teamA.name, teamB.name]);
  }
  return pairings;
}

/** Orders the teams based on the number of their pairings descending */
function orderByNumberOfPairings(teams: team[]) {
  teams.sort((a, b) => {
    return (
      a.possiblePairings.length -
      b.possiblePairings.length +
      Math.random() -
      0.5
    );
  });
}

/** Finds teams with most possible pairings and picks randomly one of them */
function findTeamWithMostPairings(possiblePairings: team[]) {
  return possiblePairings.sort((a, b) => {
    return (
      b.possiblePairings.length -
      a.possiblePairings.length +
      Math.random() -
      0.5
    );
  })[0];
}
