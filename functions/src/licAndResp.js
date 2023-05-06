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
exports.liceMain = exports.getResponsiveness = exports.getLicense = void 0;
// const fs = require('fs');
var dotenv = require("dotenv");
// import * as fs from 'fs';
var Octokit = require("@octokit/rest").Octokit;
dotenv.config();
var octokit = new Octokit({
    auth: "token ".concat(process.env.GITHUB_TOKEN),
    userAgent: "461npm v1.2.3",
    baseUrl: "https://api.github.com"
});
// license
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
function getLicense(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var data, license, licenseName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.repos.get({ owner: owner, repo: repo })];
                case 1:
                    data = (_a.sent()).data;
                    license = data.license;
                    try {
                        licenseName = [
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
                            return [2 /*return*/, 1];
                        }
                        else {
                            // fs.appendFileSync('info.tmp', '0.0\n');
                            return [2 /*return*/, 0];
                        }
                    }
                    catch (error) {
                        // fs.appendFileSync('info.tmp', '0.0\n');
                        console.error(error);
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getLicense = getLicense;
// responsiveness calculation
/**
 *
 * @param {string} owner
 * @param {string} repo
 * @return {number}
 */
function getResponsiveness(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var issues, closedissues, issueLen, closedIssueLen, total, commit, commitDate, currentDate, dateParts, dateObject, timeDifference, differenceInDays, num2, final, num2, final;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.issues.listForRepo({
                        owner: owner,
                        repo: repo,
                        state: "all"
                    })];
                case 1:
                    issues = _a.sent();
                    return [4 /*yield*/, octokit.issues.listForRepo({
                            owner: owner,
                            repo: repo,
                            state: "closed"
                        })];
                case 2:
                    closedissues = _a.sent();
                    issueLen = issues.data.length;
                    closedIssueLen = closedissues.data.length;
                    total = closedIssueLen / issueLen;
                    return [4 /*yield*/, octokit.repos.listCommits({
                            owner: owner,
                            repo: repo,
                            per_page: 1
                        })];
                case 3:
                    commit = (_a.sent()).data;
                    commitDate = commit[0].commit.committer.date;
                    currentDate = new Date();
                    dateParts = commitDate.split("-");
                    dateObject = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                    timeDifference = currentDate.getTime() - dateObject.getTime();
                    differenceInDays = Math.round(timeDifference / (1000 * 3600 * 24));
                    if (!issues.data.length || !closedissues.data.length) {
                        total = 1;
                        num2 = 20 / differenceInDays;
                        final = Math.tanh(total * num2);
                        // fs.appendFileSync('info.tmp', final.toString());
                        // fs.appendFileSync('info.tmp', '\n');
                        return [2 /*return*/, final];
                    }
                    else {
                        num2 = 20 / differenceInDays;
                        final = Math.tanh(total * num2);
                        // fs.appendFileSync('info.tmp', final.toString());
                        // fs.appendFileSync('info.tmp', '\n');
                        return [2 /*return*/, final];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getResponsiveness = getResponsiveness;
/**
 *
 * @param {string} owner
 * @param {string} repo
 */
function liceMain(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // parameter 1 = repo, parameter 2 = owner
                return [4 /*yield*/, getLicense(owner, repo)];
                case 1:
                    // parameter 1 = repo, parameter 2 = owner
                    _a.sent(); // license
                    return [4 /*yield*/, getResponsiveness(owner, repo)];
                case 2:
                    _a.sent(); // responsiveness calculation
                    return [2 /*return*/];
            }
        });
    });
}
exports.liceMain = liceMain;
liceMain("vesln", "package");
// liceMain(process.argv[2], process.argv[3]);
