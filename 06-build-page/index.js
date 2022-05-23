const fs = require('fs');
const path = require('path');

let assetsFolder = path.join(__dirname, 'assets');
let distFolder = path.join(__dirname, 'project-dist');

function createDistDirectory(distFolder) {
  fs.promises.mkdir(distFolder, {
    recursive: true
  })
    .catch(err => console.error(err));
}

function copyAssets(folder, distFolder) {
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
}

function mergeStyles(distFolder) {
  const bundle = path.join(distFolder, 'style.css');

  fs.writeFile(bundle, '', () => {});
  fs.promises.readdir(path.join(__dirname, 'styles'), {
    withFileTypes: true
  })
    .then(files => {
      for (let file of files) {
        if (file.isFile() && path.extname(file.name) === '.css') {
          fs.readFile(path.join(__dirname, 'styles', file.name), 'utf-8', (err, data) => {
            if (err) console.error(err);

            fs.appendFile(bundle, data + '\n', err => {
              if (err) console.error(err);
            });
          });
        }
      }
    })
    .catch(err => console.error(err));
}

function mergeHTMLComponents(distFolder) {
  const templateStream = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');

  let templateData = '';

  templateStream.on('data', chunk => templateData += chunk);
  templateStream.on('end', async () => {
    const bundle = path.join(distFolder, 'index.html');
    const regex = /{{.{1,}}}/g;
    const components = templateData.match(regex);

    if (components) {
      const placeComponent = (component) => 
        new Promise(resolve => {
          let componentFileName = component.slice(2, component.length - 2) + '.html';

          const componentStream = fs.createReadStream(path.join(__dirname, 'components', componentFileName));

          let componentData = '';

          componentStream.on('data', data => componentData += data);
          componentStream.on('end', () => resolve(templateData.replace(component, componentData)));
        });
            
      const placeAllComponents = async () => {
        for (let component of components) {
          templateData = await placeComponent(component);
        }
        return templateData;
      };
               
      templateData = await placeAllComponents();
    }

    fs.writeFile(bundle, templateData, err => {
      if(err) console.error(err);
    });
  });
}

createDistDirectory(distFolder);
copyAssets(assetsFolder, path.join(distFolder, path.basename(assetsFolder)));
mergeStyles(distFolder);
mergeHTMLComponents(distFolder);