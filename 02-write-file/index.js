const path = require('path');
const fs = require('fs');

const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));

console.log('Введите текст');
process.on('exit', () => {
  console.log('Выход');
  process.exit();
});
process.on('SIGINT', () => {
  process.exit();
});
process.stdin.on('data', chunk => {
  if (chunk.toString('utf8').trim() == 'exit') {
    process.exit();
  }
  output.write(chunk);
});
process.stdin.on('error', error => console.log('Error', error.message));