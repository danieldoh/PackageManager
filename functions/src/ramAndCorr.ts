import {exec, ExecException} from "child_process";
import * as fs from "fs-extra";
const csv = require("csv-parser");

/**
 *
 * @param cmd
 * @returns
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
 * @param owner
 * @param repo
 * @param path
 * @returns
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
 * @param path
 * @returns
 */

async function deleFolder(path: string): Promise<void> {
  return await fs.remove(path);
}

async function getCloc(owner: string, repo: string): Promise<number[]> {
  const repoDir = "repoDir";

  const clocOutputs: number[] = [];
  const fileStream = (filename: string) => {
    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(filename)
        .pipe(csv())
        .on("data", (row: any) => {
          // const value = Object.values(row);
          console.log(row);
        })
        .on("error", (error: Error) => {
          console.log(error);
          reject(error);
        })
        .on("end", () => {
          resolve();
        });
    });
  };

  const clocDir = "clocOutput.csv";
  let cmd =
    "npx cloc --csv --exclude-lang=Text,Tex " +
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

export async function getRampCorr(
  owner: string,
  repo: string
): Promise<number[]> {
  const repoDir = "repoDir";
  await gitClone(owner, repo, repoDir);
  console.log("clone completed");
  const clocArr: number[] = await getCloc(owner, repo);
  await deleFolder(repoDir);
  console.log("delete completed");

  const rampScore: number =
    (clocArr[0] + clocArr[3]) / clocArr[1] > 1 ?
      1 :
      (clocArr[0] + clocArr[3]) / clocArr[1];
  const corrScore: number = clocArr[3] / (clocArr[1] - clocArr[3]);
  return [rampScore, corrScore];
}
