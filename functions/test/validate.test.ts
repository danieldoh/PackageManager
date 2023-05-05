import { getFirestore } from 'firebase-admin/firestore';
import 'jest';
import { firebaseConfig } from '../src/firebase';
import { validation } from '../src/validate';
const admin = require('firebase-admin');
const testToken = 'testToken';

admin.initializeApp(firebaseConfig);

describe('Validation function', () => {
  let db = getFirestore(admin.apps[0]);

  test('(1) should return [true, username] if the user has admin access', async () => {
    const username = 'adminUser';
    const userRef = db.collection('users').doc(testToken);
    await userRef.set({ Username: username, Admin: 'true' });

    const result = await validation(testToken);

    expect(result).toEqual([true, username]);
  });

  test('(2) should return [false, "Undefined"] if the user does not have admin access', async () => {
    const username = 'regularUser';
    const userRef = db.collection('users').doc(testToken);
    await userRef.set({ Username: username, Admin: 'false' });

    const result = await validation(testToken);

    expect(result).toEqual([false, 'Undefined']);
  });

  test('(3) should return [true, username] if the default admin has admin access', async () => {
    const username = 'defaultAdmin';
    const defaultRef = db.collection('Default Admin').doc(testToken);
    await defaultRef.set({ Username: username, Admin: 'true' });

    const result = await validation(testToken);

    expect(result).toEqual([true, username]);
  });

  test('(4) should return [false, "Undefined"] if the default admin does not have admin access', async () => {
    const username = 'defaultAdmin';
    const defaultRef = db.collection('Default Admin').doc(testToken);
    await defaultRef.set({ Username: username, Admin: 'false' });

    const result = await validation(testToken);

    expect(result).toEqual([false, 'Undefined']);
  });

  test('(5) should return [false, "Undefined"] if the token does not exist in the database', async () => {
    const result = await validation('invalidToken');

    expect(result).toEqual([false, 'Undefined']);
  });
});
