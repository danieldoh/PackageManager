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
exports.getVP = void 0;
const rest_1 = require("@octokit/rest");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
/**
 *
 * @param {Record<string, string>} content
 * @return {number}
 */
function getVPscore(content) {
    try {
        const depNum = "dependencies" in content ? Object.keys(content.dependencies).length : 0;
        const devDepNum = "devDependencies" in content ?
            Object.keys(content.devDependencies).length :
            0;
        const totalDep = depNum + devDepNum;
        const VPscore = totalDep == 0 ? 1 : 1 / totalDep;
        return VPscore;
    }
    catch (error) {
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
async function getVP(owner, repo) {
    try {
        const { data } = await octokit.repos.getContents({
            owner: owner,
            repo: repo,
            path: "package.json",
        });
        let VPscore = 0;
        if ("content" in data) {
            const packagejson = JSON.parse(Buffer.from(data.content || "", "base64").toString());
            VPscore = getVPscore(packagejson);
        }
        return VPscore;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return 0;
    }
}
exports.getVP = getVP;
// example usage
getVP("octokit", "rest.js").then((score) => console.log(score));
//# sourceMappingURL=versionPinning.js.map