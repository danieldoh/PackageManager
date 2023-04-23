import {DocumentData, getFirestore} from "firebase-admin/firestore";
const admin = require("firebase-admin");

/**
 * Validate JWT token and check the access
 * @param {string} token
 * @return {[boolean, string]}
 */
export async function validation(token: string): Promise<[boolean, string]> {
  const db = getFirestore(admin.apps[0]);
  const userRef = db.collection("users").doc(token);
  const docUser= await userRef.get();
  const defaultRef = db.collection("Default Admin").doc(token);
  const docDefault = await defaultRef.get();
  if (docUser.exists) {
    const docData: DocumentData | undefined = docUser.data();
    const access: string = docData?.["Admin"];
    const Username: string = docData?.["Username"];
    if (access == "true") {
      return [true, Username];
    } else {
      return [false, "Undefined"];
    }
  } else if (docDefault.exists) {
    const docData: DocumentData | undefined = docDefault.data();
    const access: string = docData?.["Admin"];
    const Username: string = docData?.["Username"];
    if (access == "true") {
      return [true, Username];
    } else {
      return [false, "Undefined"];
    }
  }
  return [false, "Undefined"];
}
