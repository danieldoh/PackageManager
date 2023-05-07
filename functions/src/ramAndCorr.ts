import {exec, ExecException} from "child_process";
import * as fs from "fs-extra";
// import {tmp} from "tmp";
const {tmp} = require("tmp");
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
async function deleteFolder(path: string): Promise<void> {
  return await fs.remove(path);
}

/**
 *
 * @param {string} cloneDir
 * @return {number[]}
 */
async function getCloc(cloneDir: string): Promise<number[]> {
  // const tmpDir = tmp.dirSync().name;

  const clocOutputs: number[] = [];

  const pattern = "**/*{test,Test}*";
  // const repoDir = tmpDir;

  const testFiles: string[] = await glob(pattern, {cwd: cloneDir});
  const testFilesNum = testFiles.length;

  const clocDir = tmp.dirSync().name;
  const testClocDir = tmp.dirSync().name;

  let cmd =
    "npx cloc " +
    cloneDir +
    " --sum-one" +
    " --json" +
    " --report-file=" +
    clocDir;

  if (testFilesNum > 0) {
    const testCmd = " --no-match-f=\".*(t|T)est.*\"";
    cmd.concat(testCmd);
    await runCmd(cmd);

    cmd =
      "npx cloc " +
      cloneDir +
      " --sum-one" +
      " --json" +
      " --report-file=" +
      testClocDir +
      " --match-f=\".*(t|T)est.*\"";
    await runCmd(cmd);
  } else {
    await runCmd(cmd);
  }

  try {
    const clocJson = await fs.promises.readFile(clocDir, "utf8");
    const clocArr = JSON.parse(clocJson.toString());
    clocOutputs.push(clocArr.SUM.code, clocArr.SUM.comment);
    if (testFilesNum > 0) {
      const testClocJson = await fs.promises.readFile(testClocDir, "utf8");
      const testClocArr = JSON.parse(testClocJson.toString());
      clocOutputs.push(testClocArr.SUM.code, testClocArr.SUM.comment);
    } else {
      clocOutputs.push(0, 0);
    }

    await deleteFolder(clocDir);
    await deleteFolder(testClocDir);
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
  const cloneDir: string = tmp.dirSync().name;
  await gitClone(owner, repo, cloneDir);
  console.log("clone completed");
  const clocArr: number[] = await getCloc(cloneDir);
  await deleteFolder(cloneDir);
  console.log("delete completed");

  const rampScore: number =
    (clocArr[0] + clocArr[3]) / clocArr[1] > 1 ?
      1 :
      (clocArr[0] + clocArr[3]) / clocArr[1];
  const corrScore: number = clocArr[3] / (clocArr[1] - clocArr[3]);

  return [rampScore, corrScore];
}

// const resutlt = getRampCorr('vesln', 'package');
