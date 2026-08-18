import axios from 'axios';

async function seedData() {
  console.log("Seeding mock slow query data...");
  try {
    const response = await axios.post('http://localhost:3001/api/metrics', {
      query: "SELECT * FROM users WHERE last_login > '2023-01-01' ORDER BY created_at DESC;",
      executionCount: 1500,
      totalTimeMs: 1800000,
      meanTimeMs: 1200,
      maxTimeMs: 4500
    });
    console.log("Mock metric ingested successfully:", response.data);
  } catch (err: any) {
    console.error("Failed to ingest mock metric:", err.message);
  }
}

seedData();
