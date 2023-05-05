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
exports.liceMain = exports.getResponsiveness = exports.getLicense = void 0;
// const fs = require('fs');
const dotenv = __importStar(require("dotenv"));
// import * as fs from 'fs';
const { Octokit } = require("@octokit/rest");
dotenv.config();
const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_TOKEN}`,
    userAgent: "461npm v1.2.3",
    baseUrl: "https://api.github.com",
});
// license
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
async function getLicense(owner, repo) {
    const { data } = await octokit.repos.get({ owner, repo });
    const license = data.license;
    try {
        const licenseName = [
            "BSD 2-Clause \"Simplified\" License",
            "Do What The F*ck You Want To Public License",
            "zlib License",
            "The Unlicense",
            "ncsa License",
            "MIT License",
            "ISC License",
            "GNU Lesser General Public License v3.0",
            "GNU Lesser General Public License v2.1",
            "GNU General Public License v2.0",
            "PostgreSQL License",
        ];
        if (license != null && licenseName.includes(license.name)) {
            // fs.appendFileSync('info.tmp', '1.0\n');
            return 1;
        }
        else {
            // fs.appendFileSync('info.tmp', '0.0\n');
            return 0;
        }
    }
    catch (error) {
        // fs.appendFileSync('info.tmp', '0.0\n');
        console.error(error);
        return 0;
    }
}
exports.getLicense = getLicense;
// responsiveness calculation
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
async function getResponsiveness(owner, repo) {
    // query for the total issues
    const issues = await octokit.issues.listForRepo({
        owner: owner,
        repo: repo,
        state: "all",
    });
    // query for the closed issues
    const closedissues = await octokit.issues.listForRepo({
        owner,
        repo,
        state: "closed",
    });
    // calcuate the ratio of closed issues/ total issues for the formula
    const issueLen = issues.data.length; // num of total issues
    const closedIssueLen = closedissues.data.length; // num of closed issues
    let total = closedIssueLen / issueLen; // ratio calculation
    // query for the commits
    const { data: commit } = await octokit.repos.listCommits({
        owner: owner,
        repo: repo,
        per_page: 1,
    });
    // date of last commit
    const commitDate = commit[0].commit.committer.date;
    // calculation to find number of days since last commit
    const currentDate = new Date();
    const dateParts = commitDate.split("-");
    const dateObject = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const timeDifference = currentDate.getTime() - dateObject.getTime();
    const differenceInDays = Math.round(timeDifference / (1000 * 3600 * 24));
    if (!issues.data.length || !closedissues.data.length) {
        total = 1;
        const num2 = 20 / differenceInDays; // (20/t)
        const final = Math.tanh(total * num2);
        // fs.appendFileSync('info.tmp', final.toString());
        // fs.appendFileSync('info.tmp', '\n');
        return final;
    }
    else {
        // plugging values into the formula
        const num2 = 20 / differenceInDays; // (20/t)
        const final = Math.tanh(total * num2);
        // fs.appendFileSync('info.tmp', final.toString());
        // fs.appendFileSync('info.tmp', '\n');
        return final;
    }
}
exports.getResponsiveness = getResponsiveness;
/**
 *
 * @param {string} owner
 * @param {string} repo
 */
async function liceMain(owner, repo) {
    // parameter 1 = repo, parameter 2 = owner
    await getLicense(owner, repo); // license
    await getResponsiveness(owner, repo); // responsiveness calculation
}
exports.liceMain = liceMain;
liceMain("vesln", "package");
// liceMain(process.argv[2], process.argv[3]);
//# sourceMappingURL=licAndResp.js.map