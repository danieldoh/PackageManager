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
exports.getVP = void 0;
var rest_1 = require("@octokit/rest");
var dotenv = require("dotenv");
dotenv.config();
var octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
/**
 *
 * @param {Record<string, string>} content
 * @return {number}
 */
function getVPscore(content) {
    try {
        var depNum = "dependencies" in content ? Object.keys(content.dependencies).length : 0;
        var devDepNum = "devDependencies" in content ?
            Object.keys(content.devDependencies).length :
            0;
        var totalDep = depNum + devDepNum;
        var VPscore = totalDep == 0 ? 1 : 1 / totalDep;
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
function getVP(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var data, VPscore, packagejson, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.repos.getContents({
                            owner: owner,
                            repo: repo,
                            path: "package.json"
                        })];
                case 1:
                    data = (_a.sent()).data;
                    VPscore = 0;
                    if ("content" in data) {
                        packagejson = JSON.parse(Buffer.from(data.content || "", "base64").toString());
                        VPscore = getVPscore(packagejson);
                    }
                    return [2 /*return*/, VPscore];
                case 2:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        console.error(error_1.message);
                    }
                    return [2 /*return*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getVP = getVP;
// example usage
getVP("octokit", "rest.js").then(function (score) { return console.log(score); });
