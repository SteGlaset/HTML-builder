const fs = require('fs');
const path = require('path');

fs.promises.readdir(path.join(__dirname, 'secret-folder'), {
  withFileTypes: true
})
  .then(files => {
    for (let file of files) {
      if (file.isFile()) {
        fs.promises.stat(path.join(__dirname, 'secret-folder', file.name)).then(stats => console.log(
          path.basename(file.name, path.extname(file.name)) +
                    ' - ' + path.extname(file.name).slice(1) +
                    ' - ' + stats.size + 'b'));
      }
    }
  })
  .catch(err => {
    console.error(err);
  });