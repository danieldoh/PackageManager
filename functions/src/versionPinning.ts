import {Octokit} from "@octokit/rest";
import * as dotenv from "dotenv";
dotenv.config();

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

/**
 *
 * @param {Record<string, string>} content
 * @return {number}
 */
function getVPscore(content: Record<string, string>): number {
  try {
    const depNum: number =
      "dependencies" in content ? Object.keys(content.dependencies).length : 0;
    const devDepNum: number =
      "devDependencies" in content ?
        Object.keys(content.devDependencies).length :
        0;

    const totalDep: number = depNum + devDepNum;
    const VPscore: number = totalDep == 0 ? 1 : 1 / totalDep;
    return VPscore;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return 0;
  }
}

/**
 * Gets the score for Version Pinning
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
export async function getVP(owner: string, repo: string): Promise<number> {
  try {
    const {data} = await octokit.repos.getContents({
      owner: owner,
      repo: repo,
      path: "package.json",
    });

    let VPscore = 0;
    if ("content" in data) {
      const packagejson: Record<string, string> = JSON.parse(
        Buffer.from(data.content || '', "base64").toString()
      );
      VPscore = getVPscore(packagejson);
    }
    return VPscore;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return 0;
  }
}

// example usage
getVP('octokit', 'rest.js').then((score) => console.log(score));
