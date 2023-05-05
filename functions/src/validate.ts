import {DocumentData, getFirestore} from "firebase-admin/firestore";
const admin = require("firebase-admin");

/**
 * Validate JWT token and check the access
 * @param {string} token
 * @return {[boolean, string]}
 */
export async function validation(token: string): Promise<[boolean, string]> {
  const db = getFirestore(admin.apps[0]);
  const tokenRef = db.collection("token").doc(token);
  const docUser= await tokenRef.get();
  const defaultRef = db.collection("Default Admin").doc(token);
  const docDefault = await defaultRef.get();
  if (docUser.exists) {
    console.log("validate: found the user");
    const docData: DocumentData | undefined = docUser.data();
    const access: boolean = docData?.["Admin"];
    const Username: string = docData?.["Username"];
    if (access == true) {
      console.log("validate: isAdmin");
      return [true, Username];
    } else {
      console.log("validate: not isAdmin");
      return [false, "Undefined"];
    }
  } else if (docDefault.exists) {
    console.log("validate: found the default user");
    const docData: DocumentData | undefined = docDefault.data();
    const access: string = docData?.["Admin"];
    const Username: string = docData?.["Username"];
    if (access == "true") {
      console.log("validate: default isAdmin");
      return [true, Username];
    } else {
      console.log("validate: default not isAdmin");
      return [false, "Undefined"];
    }
  }
  console.log("validate: not found any user and default user");
  return [false, "Undefined"];
}
