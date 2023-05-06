import {Octokit} from "@octokit/rest";
import * as dotenv from "dotenv";
dotenv.config();

const octokit = new Octokit({auth: process.env.OAUTH_TOKEN});

/**
 *
 * @param {string} owener
 * @param {string} repo
 * @return {number}
 */
export async function getPR(owener: string, repo: string): Promise<number> {
  const PRlist = await octokit.pulls.list({
    owner: owener,
    repo: repo,
    state: "all",
    per_page: 100,
  });

  const PRlistNum = PRlist.data.length;
  let reviewedPRNum = 0;

  for (const PR of PRlist.data) {
    const reviewList = await octokit.pulls.listReviews({
      owner: owener,
      repo: repo,
      pull_number: PR.number,
      per_page: 100,
    });

    if (reviewList.data.length > 0) {
      reviewedPRNum += 1;
    }
  }

  return reviewedPRNum / PRlistNum;
}

// getPR('vesln', 'package');
