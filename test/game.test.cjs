/** Dependency-free regression tests for the actual inline game code. Node 18+. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
function section(start, end) {
  const a = script.indexOf(start), b = script.indexOf(end, a);
  assert(a >= 0 && b > a, `Missing source section: ${start}`);
  return script.slice(a, b);
}
function economy() {
  const c = { state: 'shop', cash: 3000, player: { hp: 60 }, ammo: 8,
    reserve: 80, reloadLeft: 0, smokeCount: 2, shieldEnergy: 50,
    mouseDown: false, aim: false, CONFIG: { magazine: 25 },
    upgrades: { rifle: false, fists: false }, sound: { play() {} },
    updateHUD() {}, shopUI: { shopNotice: { textContent: '' } } };
  vm.createContext(c);
  vm.runInContext(section('const EQUIPMENT=', 'const gearSlots='), c);
  c.renderLoadout = () => {}; c.renderShop = () => {};
  vm.runInContext(section('const SHOP=[', 'const shopUI='), c);
  vm.runInContext(section('function shopUnavailable(', 'function renderShop('), c);
  vm.runInContext(section('function buyItem(', 'function selectShopTab('), c);
  return c;
}
test('complete game JavaScript parses as an ES module', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--check'],
    { input: script, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
test('shop charges once, rejects unowned equipment and preserves ammo on equip', () => {
  const c = economy();
  assert.equal(c.equipOwnedItem('talon'), false);
  assert.equal(c.buyItem('talon'), true);
  assert.equal(c.cash, 1800);
  assert.equal(c.buyItem('talon'), false);
  assert.equal(c.cash, 1800);
  assert.equal(c.equipOwnedItem('talon'), true);
  assert.equal(c.gunStats().body, 75);
  assert.equal(c.ammo, 8);
  assert.equal(c.buyItem('bulwark'), true);
  assert.equal(c.equipOwnedItem('bulwark'), true);
  assert.equal(c.shieldCapacity(), 175);
  assert.equal(c.shieldEnergy, 87.5);
  assert.equal(c.equipOwnedItem('aegis'), true);
  assert.equal(c.shieldEnergy, 50);
  assert.equal(c.buyItem('shock'), true);
  assert.equal(c.equipOwnedItem('shock'), true);
  assert.equal(c.fistStats().damage, 110);
  c.upgrades.fists = c.upgrades.rifle = true;
  assert.equal(c.fistStats().damage, 135);
  assert.equal(c.gunStats().body, 90);
  assert.equal(c.gunStats().head, 210);
});
test('consumables respect caps and purchases require coins and shop state', () => {
  const c = economy();
  c.cash = 150;
  assert.equal(c.buyItem('medkit'), true);
  assert.equal(c.cash, 0);
  assert.equal(c.player.hp, 100);
  assert.equal(c.buyItem('ammo'), false);
  c.cash = 1000;
  assert.equal(c.buyItem('medkit'), false);
  assert.equal(c.cash, 1000);
  c.smokeCount = 5;
  assert.equal(c.buyItem('smoke'), false);
  c.reserve = 190; c.ammo = 0; c.reloadLeft = 1;
  assert.equal(c.buyItem('ammo'), true);
  assert.equal(c.ammo, 25);
  assert.equal(c.reserve, 200);
  assert.equal(c.reloadLeft, 0);
  c.state = 'playing';
  assert.equal(c.buyItem('shock'), false);
  assert.equal(c.equipOwnedItem('kestrel'), false);
});
test('9 turns exactly 180 degrees, preserving pitch and respecting pause', () => {
  const c = { state: 'playing', player: { yaw: .7, pitch: .4 },
    camera: { rotation: { set(p, y) { c.cameraYaw = y; c.cameraPitch = p; } }, updateMatrixWorld() {} } };
  vm.createContext(c);
  vm.runInContext(section('function quickTurn(){', 'function dash(){'), c);
  c.quickTurn();
  assert(Math.abs(c.player.yaw - (.7 + Math.PI)) < 1e-10);
  assert.equal(c.player.pitch, .4);
  assert.equal(c.cameraYaw, c.player.yaw);
  c.state = 'paused'; const yaw = c.player.yaw;
  c.quickTurn(); assert.equal(c.player.yaw, yaw);
});
