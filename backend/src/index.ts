import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock metric ingestion endpoint
app.post('/api/metrics', async (req, res) => {
  try {
    const { query, executionCount, totalTimeMs, meanTimeMs, maxTimeMs } = req.body;
    
    const metric = await prisma.queryMetric.create({
      data: {
        query,
        executionCount,
        totalTimeMs,
        meanTimeMs,
        maxTimeMs,
      }
    });

    // Simple heuristic: if a query takes more than 1000ms on average, trigger an incident
    if (meanTimeMs > 1000) {
      const incident = await prisma.incident.create({
        data: {
          title: `High Latency Detected`,
          description: `Query "${query.substring(0, 50)}..." is executing with an average latency of ${meanTimeMs}ms.`,
          affectedQueries: JSON.stringify([metric.id])
        }
      });
      // In a real system, an async job would trigger LLM diagnosis here.
      // We will trigger it synchronously for the mock.
      analyzeIncident(incident.id, query);
    }

    res.status(201).json({ success: true, metric });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to ingest metric' });
  }
});

app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Mock LLM analysis
async function analyzeIncident(incidentId: string, query: string) {
  // In a real system, we'd use OpenAI API here.
  // For the MVP mock, we'll wait a second and provide a mock root cause.
  setTimeout(async () => {
    const rootCause = `The query is performing a sequential scan over a large table because it lacks an index.`;
    const suggestedFix = `CREATE INDEX idx_concurrent_fix ON table_name (column_name);`;
    
    await prisma.incident.update({
      where: { id: incidentId },
      data: { rootCause, suggestedFix }
    });
  }, 2000);
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Copilot backend running on port ${PORT}`);
  });
}

export { app, prisma };
