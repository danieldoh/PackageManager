import { getFirestore } from "firebase-admin/firestore";
const admin = require("firebase-admin");

/**
 * Validate JWT token and check the access
 * @param {string} token 
 * @returns {boolean}
 */
export async function validation(token: string): Promise<boolean> {
  const db = getFirestore(admin.apps[0]);
  const userRef = db.collection("users").doc(token);
  const doc = await userRef.get();
  if (doc.exists){
    const docData: any = doc.data();
    const access: string = docData["Admin"];
    if (access == 'true') {
      return true;
    } else {
      return false;
    }
  } 
  return false;
}