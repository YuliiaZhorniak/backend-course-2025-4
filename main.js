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
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('Server is running');
});

server.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});
