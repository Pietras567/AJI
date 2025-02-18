import app from '../src/app';

const request = require('supertest');

describe('GET /categories', () => {
    it('should return a list of categories', async () => {
        const response = await request(app).get('/categories');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        console.log("Categories: \n", response.body);
    });
});
