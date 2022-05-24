const fs = require('fs');
const path = require('path');
const {
  constants
} = require('node:fs');

function copyDir(folder) {
  let distFolder = folder + '-copy';

  fs.promises.mkdir(distFolder, {
    recursive: true
  })
  .then(() => {
    fs.promises.rm(distFolder, { recursive: true })
    .then(() => {
      fs.promises.mkdir(distFolder, {
        recursive: true
      })
      .then(() => {
        (function goDeeper(folder, distFolder) {
          fs.promises.readdir(folder, {
              withFileTypes: true
            })
            .then(files => {
              for (let file of files) {
                if (file.isFile()) {
                  let srcPath = path.join(folder, file.name);
                  let distPath = path.join(distFolder, file.name);
  
                  fs.promises.copyFile(srcPath, distPath);
                } else if (file.isDirectory()) {
                  fs.promises.mkdir(path.join(distFolder, file.name), {
                      recursive: true
                    })
                    .then(() => {
                      goDeeper(path.join(folder, file.name), path.join(distFolder, file.name));
                    });
                }
              }
            })
            .catch(err => console.error(err));
        })(folder, distFolder);
      })
      .catch(err => console.error(err));
    });
  });
}

copyDir(path.join(__dirname, 'files'));