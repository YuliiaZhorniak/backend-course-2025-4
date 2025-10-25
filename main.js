const fs = require('fs');
const http = require('http');
const { program } = require('commander');

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
    await fs.promises.writeFile('output.json', JSON.stringify(data, null, 2), 'utf8');
     res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('Server is running');

    }catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
   }
  
});

server.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});
