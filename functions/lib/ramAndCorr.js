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
const { glob } = require("glob");
/**
 *
 * @param {string} cmd
 * @return {void}
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
 * @param {string} owner
 * @param {string} repo
 * @param {string} path
 * @return {void}
 */
async function gitClone(owner, repo, path) {
    return await runCmd("git clone https://github.com/" + owner + "/" + repo + ".git ./" + path);
}
/**
 *
 * @param {string} path
 * @return {void}
 */
async function deleFolder(path) {
    return await fs.remove(path);
}
/**
 *
 * @return {number[]}
 */
async function getCloc() {
    const clocOutputs = [];
    const pattern = "**/*{test,Test}*";
    const repoDir = "repoDir/";
    const testFiles = await glob(pattern, { cwd: repoDir });
    const testFilesNum = testFiles.length;
    let cmd = "npx cloc" +
        " repoDir/" +
        " --sum-one" +
        " --json" +
        " --report-file=clocOutput.json";
    const testCmd = " --no-match-f=\".*(t|T)est.*\"";
    if (testFilesNum > 0) {
        cmd.concat(testCmd);
        await runCmd(cmd);
        cmd =
            "npx cloc" +
                " repoDir/" +
                " --sum-one" +
                " --json" +
                " --report-file=testClocOutput.json" +
                " --match-f=\".*(t|T)est.*\"";
        await runCmd(cmd);
    }
    else {
        await runCmd(cmd);
    }
    try {
        const clocJson = await fs.promises.readFile("clocOutput.json", "utf8");
        const clocArr = JSON.parse(clocJson.toString());
        clocOutputs.push(clocArr.SUM.code, clocArr.SUM.comment);
        if (testFilesNum > 0) {
            const testClocJson = await fs.promises.readFile("testClocOutput.json", "utf8");
            const testClocArr = JSON.parse(testClocJson.toString());
            clocOutputs.push(testClocArr.SUM.code, testClocArr.SUM.comment);
        }
        else {
            clocOutputs.push(0, 0);
        }
    }
    catch (error) {
        console.error(error);
    }
    return clocOutputs;
}
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number[]}
 */
async function getRampCorr(owner, repo) {
    const repoDir = "repoDir";
    await gitClone(owner, repo, repoDir);
    console.log("clone completed");
    const clocArr = await getCloc();
    await deleFolder(repoDir);
    console.log("delete completed");
    const rampScore = (clocArr[0] + clocArr[3]) / clocArr[1] > 1 ?
        1 :
        (clocArr[0] + clocArr[3]) / clocArr[1];
    const corrScore = clocArr[3] / (clocArr[1] - clocArr[3]);
    return [rampScore, corrScore];
}
exports.getRampCorr = getRampCorr;
// const resutlt = getRampCorr('vesln', 'package');
//# sourceMappingURL=ramAndCorr.js.map