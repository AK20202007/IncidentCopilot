import request from 'supertest';
import { app, prisma } from '../src/index';

describe('Incident Copilot API', () => {
  beforeAll(async () => {
    // Clear db
    await prisma.incident.deleteMany();
    await prisma.queryMetric.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fetch incidents', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should ingest a healthy metric without creating an incident', async () => {
    const res = await request(app).post('/api/metrics').send({
      query: "SELECT 1;",
      executionCount: 1,
      totalTimeMs: 10,
      meanTimeMs: 10,
      maxTimeMs: 10
    });
    expect(res.statusCode).toEqual(201);
    
    // Check incidents
    const incidents = await request(app).get('/api/incidents');
    expect(incidents.body.length).toEqual(0);
  });

  it('should create an incident for a slow query', async () => {
    const res = await request(app).post('/api/metrics').send({
      query: "SELECT * FROM huge_table;",
      executionCount: 1,
      totalTimeMs: 2000,
      meanTimeMs: 2000,
      maxTimeMs: 2000
    });
    expect(res.statusCode).toEqual(201);
    
    // Check incidents
    const incidents = await request(app).get('/api/incidents');
    expect(incidents.body.length).toEqual(1);
    expect(incidents.body[0].title).toEqual('High Latency Detected');
  });
});
