import express from 'express';
import 'jest';
import request from 'supertest';
import { search } from '../src/regex';

const app = express();
app.use(express.json());
app.delete('/:packageName', search);

describe('DELETE /:packageName', () => {
  test("(1) should return a 200 status code and 'Package is deleted' message if the package exists and is deleted successfully", async () => {
    const response = await request(app)
      .delete('/test-package')
      .set('Accept', 'application/json')
      .set('x-authorization', 'valid-token');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Package is deleted');
  }, 20000);

  test('(2) should return a 404 status code if the package does not exist', async () => {
    const response = await request(app)
      .delete('/invalid-package')
      .set('Accept', 'application/json')
      .set('x-authorization', 'valid-token');

    expect(response.status).toBe(404);
    expect(response.text).toBe('Package does not exist.');
  });

  test('(3) should return a 400 status code if the AuthenticationToken is missing or invalid', async () => {
    const response = await request(app)
      .delete('/test-package')
      .set('Accept', 'application/json')
      .set('x-authorization', 'invalid-token');

    expect(response.status).toBe(400);
    expect(response.text).toBe('The AuthenticationToken is invalid.');
  });

  test('(4) should return a 400 status code if the PackageID is missing or formed improperly', async () => {
    const response = await request(app)
      .delete('/')
      .set('Accept', 'application/json')
      .set('x-authorization', 'valid-token');

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      'There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.'
    );
  });
});
