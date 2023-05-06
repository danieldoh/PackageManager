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
exports.getPR = void 0;
const rest_1 = require("@octokit/rest");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const octokit = new rest_1.Octokit({ auth: process.env.OAUTH_TOKEN });
/**
 *
 * @param {string} owener
 * @param {string} repo
 * @return {number}
 */
async function getPR(owener, repo) {
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
exports.getPR = getPR;
// getPR('vesln', 'package');
//# sourceMappingURL=pullRequest.js.map