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
exports.getBusFactor = exports.calculateBusFactor = exports.calculateDays = exports.getRecentCommit = exports.getForkCount = void 0;
var core_1 = require("@octokit/core");
var dotenv = require("dotenv");
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
function getForkCount(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, query, response, forkData, forkCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = new core_1.Octokit({ auth: "token ".concat(process.env.GITHUB_TOKEN) });
                    query = "{\n      repository(owner: \"".concat(owner, "\", name: \"").concat(repo, "\") {\n      forkCount\n    }  \n  }");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, octokit.graphql(query)];
                case 2:
                    response = _a.sent();
                    forkData = JSON.parse(JSON.stringify(response));
                    forkCount = forkData.repository.forkCount;
                    return [2 /*return*/, forkCount];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
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
function getRecentCommit(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, commitResponse, commitData, commitDate, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = new core_1.Octokit({ auth: "token ".concat(process.env.GITHUB_TOKEN) });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, octokit.request("GET /repos/{owner}/{repo}/commits", {
                            owner: owner,
                            repo: repo,
                            per_page: 1
                        })];
                case 2:
                    commitResponse = _a.sent();
                    commitData = JSON.parse(JSON.stringify(commitResponse));
                    commitDate = commitData.data[0].commit.author.date.split("T")[0];
                    return [2 /*return*/, commitDate];
                case 3:
                    error_2 = _a.sent();
                    if (error_2 instanceof Error)
                        return [2 /*return*/, error_2.message];
                    return [2 /*return*/, "error"];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getRecentCommit = getRecentCommit;
// Returns number of days passed since commitDate
/**
 *
 * @param {string} commitDate
 * @return {number}
 */
function calculateDays(commitDate) {
    var currentDate = new Date();
    var dateParts = commitDate.split("-");
    var dateObject = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    var timeDifference = currentDate.getTime() - dateObject.getTime();
    var differenceInDays = Math.round(timeDifference / (1000 * 3600 * 24));
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
    var timeFactor = Math.ceil(daysSinceCommit / 365);
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
function getBusFactor(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var forkCount, commitDate, daysSinceCommit, busFactor, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getForkCount(owner, repo)];
                case 1:
                    forkCount = _a.sent();
                    return [4 /*yield*/, getRecentCommit(owner, repo)];
                case 2:
                    commitDate = _a.sent();
                    daysSinceCommit = calculateDays(commitDate);
                    busFactor = calculateBusFactor(forkCount, daysSinceCommit);
                    // fs.appendFileSync('info.tmp', busFactor.toString());
                    return [2 /*return*/, busFactor];
                case 3:
                    error_3 = _a.sent();
                    if (error_3 instanceof Error) {
                        console.error(error_3);
                    }
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getBusFactor = getBusFactor;
// getBusFactor('vesln', 'package');
// getBusFactor(process.argv[2], process.argv[3]);
