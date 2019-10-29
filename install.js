const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

if (process.argv.length >= 2) {
  let direction = process.argv[2];
  if (direction === 'up') up();
  else if (direction === 'down') down();
}

function up() {
  console.log('Pushing Visual Studio Code Preferences Up');
  pushExtensionsUp();
  pushSettingsUp();
  pushKeybindingsUp();
  pushToGitHub();
}

function down() {
  console.log('Pulling Visual Studio Code Preferences Down');
  pullFromGitHub();
  pullExtensionsDown();
  pullKeybindingsDown();
  pullSettingsDown();
}

function pullFromGitHub() {
  exec(`git pull`);
}

function pushExtensionsUp() {
  let localExtensions = exec(`code --list-extensions`).toString();
  localExtensions = localExtensions.split('\n').filter((i) => i);
  fs.writeFileSync('./extensions.json', JSON.stringify(localExtensions, 'utf8', 2));
  console.log('Pushed Local Extensions To Remote');
}

function pushSettingsUp() {
  let localSettings = fs.readFileSync(require('./config').settingsPath).toString();
  localSettings = JSON.parse(localSettings);
  fs.writeFileSync('./settings.json', JSON.stringify(localSettings, 'utf8', 2));
  console.log('Pushed Local Settings To Remote');
}

function pushKeybindingsUp() {
  let localKeybindings = fs.readFileSync(require('./config').keybindingsPath).toString();
  localKeybindings = localKeybindings.replace(/\/\/.*/g, "");
  localKeybindings = JSON.parse(localKeybindings);
  fs.writeFileSync('./keybindings.json', JSON.stringify(localKeybindings, 'utf8', 2));
  console.log('Pushed Local Keybindings To Remote');
}

function pullExtensionsDown() {
  let remoteExtensions = require('./extensions.json');
  let localExtensions = exec(`code --list-extensions`).toString();
  let toUninstall = localExtensions.split('\n').filter((i) => remoteExtensions.indexOf(i) === -1);
  toUninstall.forEach((u) => exec(`code --uninstall-extension ${u}`));
  let toInstall = remoteExtensions.filter((e) => localExtensions.indexOf(e) === -1);
  toInstall.forEach((i) => exec(`code --install-extension ${i}`));
  console.log('Pulled Remote Extensions To Local');
}

function pullSettingsDown() {
  let remoteSettings = require('./settings.json');
  fs.writeFileSync(path.normalize(require('./config').settingsPath), JSON.stringify(remoteSettings, 'utf8', 2));
  console.log('Pulled Remote Settings To Local');
}

function pullKeybindingsDown() {
  let remoteKeybindings = require('./keybindings.json');
  fs.writeFileSync(path.normalize(require('./config').keybindingsPath), JSON.stringify(remoteKeybindings, 'utf8', 2));
  console.log('Pulled Remote Keybindings To Local');
}

function pushToGitHub() {
  exec(`git add .`);
  exec(`git commit -m "update"`);
  exec(`git push`);
}