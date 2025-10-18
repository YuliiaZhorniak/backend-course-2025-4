#!/usr/bin/env node

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');

program
  .requiredOption('-i, --input <path>', 'path to input JSON file')
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .parse(process.argv);

const opts = program.opts();
const inputPath = path.resolve(opts.input);
const host = opts.host;
const port = parseInt(opts.port, 10);

if (isNaN(port)) {
  console.error('Port must be a number');
  process.exit(1);
}

async function readJsonFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Cannot find input file');
      process.exit(1);
    } else {
      console.error('Error reading input file:', err.message);
      process.exit(1);
    }
  }
}

function normalizeRecord(rec) {
  const rainfall = parseFloat(rec.Rainfall);
  return {
    rainfall: isNaN(rainfall) ? '' : rainfall,
    pressure3pm: rec.Pressure3pm || '',
    humidity3pm: rec.Humidity3pm || ''
  };
}

function prepareOutput(records, query) {
  const showHumidity = query.get('humidity') === 'true';
  const minRainfall = query.get('min_rainfall') ? parseFloat(query.get('min_rainfall')) : null;
  const output = [];

  for (const rec of records) {
    const r = normalizeRecord(rec);
    if (minRainfall !== null && (r.rainfall === '' || r.rainfall <= minRainfall)) continue;

    const record = {
      rainfall: r.rainfall,
      pressure3pm: r.pressure3pm
    };
    if (showHumidity) record.humidity = r.humidity3pm;
    output.push(record);
  }

  return output;
}

function buildXml(records) {
  const builder = new XMLBuilder({ format: true });
  return builder.build({ weather_data: { record: records } });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = url.searchParams;

  const data = await readJsonFile(inputPath);
  const records = Array.isArray(data) ? data : [];
  const filtered = prepareOutput(records, query);
  const xml = buildXml(filtered);

  res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
  res.end(xml);
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
