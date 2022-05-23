const fs = require('fs');
const path = require('path');

fs.promises.mkdir(path.join(__dirname, 'project-dist'), {
  recursive: true
})
  .then(() => {
    const bundle = path.join(__dirname, 'project-dist', 'bundle.css');

    fs.writeFile(bundle, '', () => {});
    fs.promises.readdir(path.join(__dirname, 'styles'), {
      withFileTypes: true
    })
      .then(files => {
        for (let file of files) {
          if (file.isFile() && path.extname(file.name) === '.css') {
            fs.readFile(path.join(__dirname, 'styles', file.name), 'utf-8', (err, data) => {
              if(err) console.error(err);

              fs.appendFile(bundle, data + '\n', err => {
                if(err) console.error(err);
              });
            });      
          }
        }
      })
      .catch(err => console.error(err));
  })
  .catch(err => console.error(err));