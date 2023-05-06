"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getRampCorr = void 0;
var child_process_1 = require("child_process");
var fs = require("fs-extra");
var glob = require("glob").glob;
/**
 *
 * @param {string} cmd
 * @return {void}
 */
function runCmd(cmd) {
    return new Promise(function (resolve, reject) {
        (0, child_process_1.exec)(cmd, function (error) {
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
function gitClone(owner, repo, path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runCmd("git clone https://github.com/" + owner + "/" + repo + ".git ./" + path)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 *
 * @param {string} path
 * @return {void}
 */
function deleFolder(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.remove(path)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 *
 * @return {number[]}
 */
function getCloc() {
    return __awaiter(this, void 0, void 0, function () {
        var clocOutputs, pattern, repoDir, testFiles, testFilesNum, cmd, testCmd, clocJson, clocArr, testClocJson, testClocArr, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clocOutputs = [];
                    pattern = "**/*{test,Test}*";
                    repoDir = "repoDir/";
                    return [4 /*yield*/, glob(pattern, { cwd: repoDir })];
                case 1:
                    testFiles = _a.sent();
                    testFilesNum = testFiles.length;
                    cmd = "npx cloc" +
                        " repoDir/" +
                        " --sum-one" +
                        " --json" +
                        " --report-file=clocOutput.json";
                    testCmd = " --no-match-f=\".*(t|T)est.*\"";
                    if (!(testFilesNum > 0)) return [3 /*break*/, 4];
                    cmd.concat(testCmd);
                    return [4 /*yield*/, runCmd(cmd)];
                case 2:
                    _a.sent();
                    cmd =
                        "npx cloc" +
                            " repoDir/" +
                            " --sum-one" +
                            " --json" +
                            " --report-file=testClocOutput.json" +
                            " --match-f=\".*(t|T)est.*\"";
                    return [4 /*yield*/, runCmd(cmd)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, runCmd(cmd)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 11, , 12]);
                    return [4 /*yield*/, fs.promises.readFile("clocOutput.json", "utf8")];
                case 7:
                    clocJson = _a.sent();
                    clocArr = JSON.parse(clocJson.toString());
                    clocOutputs.push(clocArr.SUM.code, clocArr.SUM.comment);
                    if (!(testFilesNum > 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, fs.promises.readFile("testClocOutput.json", "utf8")];
                case 8:
                    testClocJson = _a.sent();
                    testClocArr = JSON.parse(testClocJson.toString());
                    clocOutputs.push(testClocArr.SUM.code, testClocArr.SUM.comment);
                    return [3 /*break*/, 10];
                case 9:
                    clocOutputs.push(0, 0);
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, clocOutputs];
            }
        });
    });
}
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number[]}
 */
function getRampCorr(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var repoDir, clocArr, rampScore, corrScore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repoDir = "repoDir";
                    return [4 /*yield*/, gitClone(owner, repo, repoDir)];
                case 1:
                    _a.sent();
                    console.log("clone completed");
                    return [4 /*yield*/, getCloc()];
                case 2:
                    clocArr = _a.sent();
                    return [4 /*yield*/, deleFolder(repoDir)];
                case 3:
                    _a.sent();
                    console.log("delete completed");
                    rampScore = (clocArr[0] + clocArr[3]) / clocArr[1] > 1 ?
                        1 :
                        (clocArr[0] + clocArr[3]) / clocArr[1];
                    corrScore = clocArr[3] / (clocArr[1] - clocArr[3]);
                    return [2 /*return*/, [rampScore, corrScore]];
            }
        });
    });
}
exports.getRampCorr = getRampCorr;
// const resutlt = getRampCorr('vesln', 'package');
