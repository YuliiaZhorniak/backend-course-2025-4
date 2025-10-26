const fs = require('fs');
const http = require('http');
const { program } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');
program
  .requiredOption('-i, --input <path>', 'path to input JSON file')
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port');

program.parse(process.argv);
const options = program.opts();

const inputPath = options.input;
const host = options.host;
const port = Number(options.port);

if (!fs.existsSync(inputPath)) {
  console.error('Cannot find input file');
  process.exit(1);
}
const server = http.createServer(async (req, res) => {
try {
   const  raw = await fs.promises.readFile(inputPath, 'utf8');
   const data = JSON.parse(raw);
   const records = Array.isArray(data) ? data : [];
    const urlObj = new URL(req.url, `http://${host}:${port}`);
    const qs = urlObj.searchParams;
    const humidityFlag = qs.get('humidity') === 'true';
    const minRainParam = qs.get('min_rainfall');
    const minRain = minRainParam ? parseFloat(minRainParam) : null;
      const output = records.map(r => ({
        rainfall: r.Rainfall ?? r.rainfall ?? r.rain ?? 0,
        pressure3pm: r.Pressure3pm ?? r.pressure3pm ?? r.pressure ?? '',
        humidity: r.Humidity3pm ?? r.humidity3pm ?? r.humidity ?? ''
}));

const builder = new XMLBuilder({ format: true, indentBy: "  " });
const xml = builder.build({ weather_data: { record: output } });
    await fs.promises.writeFile('output.json', JSON.stringify(output, null, 2), 'utf8');
     res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
res.end(xml);

    }catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
   }
  
});

server.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});
