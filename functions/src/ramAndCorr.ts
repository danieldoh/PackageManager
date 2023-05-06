import {exec, ExecException} from "child_process";
import * as fs from "fs-extra";
const {glob} = require("glob");

/**
 *
 * @param {string} cmd
 * @return {void}
 */
function runCmd(cmd: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, (error: ExecException | null) => {
      if (error) {
        reject(error);
      } else {
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
async function gitClone(
  owner: string,
  repo: string,
  path: string
): Promise<void> {
  return await runCmd(
    "git clone https://github.com/" + owner + "/" + repo + ".git ./" + path
  );
}

/**
 *
 * @param {string} path
 * @return {void}
 */
async function deleFolder(path: string): Promise<void> {
  return await fs.remove(path);
}

/**
 *
 * @return {number[]}
 */
async function getCloc(): Promise<number[]> {
  const clocOutputs: number[] = [];

  const pattern = "**/*{test,Test}*";
  const repoDir = "repoDir/";

  const testFiles: string[] = await glob(pattern, {cwd: repoDir});
  const testFilesNum = testFiles.length;

  let cmd =
    "npx cloc" +
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
  } else {
    await runCmd(cmd);
  }

  try {
    const clocJson = await fs.promises.readFile("clocOutput.json", "utf8");
    const clocArr = JSON.parse(clocJson.toString());
    clocOutputs.push(clocArr.SUM.code, clocArr.SUM.comment);
    if (testFilesNum > 0) {
      const testClocJson = await fs.promises.readFile(
        "testClocOutput.json",
        "utf8"
      );
      const testClocArr = JSON.parse(testClocJson.toString());
      clocOutputs.push(testClocArr.SUM.code, testClocArr.SUM.comment);
    } else {
      clocOutputs.push(0, 0);
    }
  } catch (error) {
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
export async function getRampCorr(
  owner: string,
  repo: string
): Promise<number[]> {
  const repoDir = "repoDir";
  await gitClone(owner, repo, repoDir);
  console.log("clone completed");
  const clocArr: number[] = await getCloc();
  await deleFolder(repoDir);
  console.log("delete completed");

  const rampScore: number =
    (clocArr[0] + clocArr[3]) / clocArr[1] > 1 ?
      1 :
      (clocArr[0] + clocArr[3]) / clocArr[1];
  const corrScore: number = clocArr[3] / (clocArr[1] - clocArr[3]);
  return [rampScore, corrScore];
}

// const resutlt = getRampCorr('vesln', 'package');
