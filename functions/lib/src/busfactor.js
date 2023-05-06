"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusFactor = exports.calculateBusFactor = exports.calculateDays = exports.getRecentCommit = exports.getForkCount = void 0;
const core_1 = require("@octokit/core");
const dotenv = __importStar(require("dotenv"));
// import * as fs from 'fs';
dotenv.config();
/**
 * Call busfactor.js file as node busfactor.js "owner_name" "repo_name"
 */
// Send GraphQL query to GitHub API
// Returns a promise to the number of forks in a given repository
/**
 *  getForkCount
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
async function getForkCount(owner, repo) {
    const octokit = new core_1.Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
    const query = `{
      repository(owner: "${owner}", name: "${repo}") {
      forkCount
    }  
  }`;
    try {
        const response = await octokit.graphql(query);
        const forkData = JSON.parse(JSON.stringify(response));
        const forkCount = forkData.repository.forkCount;
        return forkCount;
    }
    catch (error) {
        if (error instanceof Error) {
            return 0;
        }
        return 0;
    }
}
exports.getForkCount = getForkCount;
// Send REST query to GitHub API
// Returns a promise to the most recent commit
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {string}
 */
async function getRecentCommit(owner, repo) {
    const octokit = new core_1.Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
    try {
        const commitResponse = await octokit.request("GET /repos/{owner}/{repo}/commits", {
            owner: owner,
            repo: repo,
            per_page: 1,
        });
        const commitData = JSON.parse(JSON.stringify(commitResponse));
        const commitDate = commitData.data[0].commit.author.date.split("T")[0];
        return commitDate;
    }
    catch (error) {
        if (error instanceof Error)
            return error.message;
        return "error";
    }
}
exports.getRecentCommit = getRecentCommit;
// Returns number of days passed since commitDate
/**
 *
 * @param {string} commitDate
 * @return {number}
 */
function calculateDays(commitDate) {
    const currentDate = new Date();
    const dateParts = commitDate.split("-");
    const dateObject = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const timeDifference = currentDate.getTime() - dateObject.getTime();
    const differenceInDays = Math.round(timeDifference / (1000 * 3600 * 24));
    return differenceInDays;
}
exports.calculateDays = calculateDays;
// Calculates bus factor
// If forkCount is 1000+, bus factor = 1/time factor
// Else busfactor = forkCount/1000/time factor
// Time factor = years passed since most recent commit + 1
// If most recent commit is within 1 year, time factor = 1
/**
 *
 * @param {number} forkCount
 * @param {number} daysSinceCommit
 * @return {number}
 */
function calculateBusFactor(forkCount, daysSinceCommit) {
    const timeFactor = Math.ceil(daysSinceCommit / 365);
    if (forkCount >= 1000)
        return 1 / timeFactor;
    else
        return forkCount / timeFactor / 1000;
}
exports.calculateBusFactor = calculateBusFactor;
// driver code
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
async function getBusFactor(owner, repo) {
    try {
        const forkCount = await getForkCount(owner, repo);
        const commitDate = await getRecentCommit(owner, repo);
        const daysSinceCommit = calculateDays(commitDate);
        const busFactor = calculateBusFactor(forkCount, daysSinceCommit);
        // fs.appendFileSync('info.tmp', busFactor.toString());
        return busFactor;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error);
        }
        return 0;
    }
}
exports.getBusFactor = getBusFactor;
// getBusFactor('vesln', 'package');
// getBusFactor(process.argv[2], process.argv[3]);
//# sourceMappingURL=busfactor.js.map