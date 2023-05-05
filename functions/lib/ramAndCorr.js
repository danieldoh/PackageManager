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
exports.getRampCorr = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs-extra"));
const csv = require("csv-parser");
/**
 *
 * @param cmd
 * @returns
 */
function runCmd(cmd) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, (error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 *
 * @param owner
 * @param repo
 * @param path
 * @returns
 */
async function gitClone(owner, repo, path) {
    return await runCmd("git clone https://github.com/" + owner + "/" + repo + ".git ./" + path);
}
/**
 *
 * @param path
 * @returns
 */
async function deleFolder(path) {
    return await fs.remove(path);
}
async function getCloc(owner, repo) {
    const repoDir = "repoDir";
    const clocOutputs = [];
    const fileStream = (filename) => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filename)
                .pipe(csv())
                .on("data", (row) => {
                // const value = Object.values(row);
                console.log(row);
            })
                .on("error", (error) => {
                console.log(error);
                reject(error);
            })
                .on("end", () => {
                resolve();
            });
        });
    };
    const clocDir = "clocOutput.csv";
    let cmd = "npx cloc --csv --exclude-lang=Text,Tex " +
        repoDir +
        " | tail -n 1 > " +
        clocDir;
    await runCmd(cmd);
    console.log("cmd1 completed");
    await fileStream(clocDir);
    console.log("stream 1 completed");
    await deleFolder(clocDir);
    console.log("clocDir delete completed");
    const testClocDir = "testClocDir";
    cmd =
        "ls | grep -E 'test|Test' | " +
            "npx cloc --csv --match-d=- " +
            repoDir +
            " | tail -n 1 > " +
            testClocDir;
    await runCmd(cmd);
    await fileStream(testClocDir);
    await deleFolder(testClocDir);
    console.log("testclocDir delete completed", clocOutputs);
    return clocOutputs; // comment code x2
}
async function getRampCorr(owner, repo) {
    const repoDir = "repoDir";
    await gitClone(owner, repo, repoDir);
    console.log("clone completed");
    const clocArr = await getCloc(owner, repo);
    await deleFolder(repoDir);
    console.log("delete completed");
    const rampScore = (clocArr[0] + clocArr[3]) / clocArr[1] > 1 ?
        1 :
        (clocArr[0] + clocArr[3]) / clocArr[1];
    const corrScore = clocArr[3] / (clocArr[1] - clocArr[3]);
    return [rampScore, corrScore];
}
exports.getRampCorr = getRampCorr;
//# sourceMappingURL=ramAndCorr.js.map