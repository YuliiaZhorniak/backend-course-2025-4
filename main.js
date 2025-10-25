const { program } = require('commander');

program
  .requiredOption('-i, --input <path>', 'path to input JSON file')
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port');

program.parse(process.argv);
const options = program.opts();
if (!fs.existsSync(inputPath)) {
  console.error('Cannot find input file');
  process.exit(1);
}
