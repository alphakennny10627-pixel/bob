# QUACK / STRIKE

A browser FPS with duck enemies, nine rounds, bosses every third round, health bars, loot, a coin shop, and editable equipment.

## Files

- `dist/index.html` — complete playable game, including HTML, CSS and Three.js code.
- `test/game.test.cjs` — automated regression tests using Node's built-in test runner.
- `README.md` — this setup and controls guide.

## Play locally

Install Python 3, extract this package, and run this command from its folder:

```bash
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 in a desktop browser and click Deploy.
The scene, models and placeholder sounds are generated automatically; no scene editor or build step is required.

Internet access is required for Three.js 0.169.0 from jsDelivr. Google Fonts are optional and have system fallbacks. For offline use, save the Three.js module into `dist/three.module.js`, update the import in `index.html` to `./three.module.js`, and remove the font import.

## Controls

| Control | Action |
|---|---|
| WASD | Move |
| Mouse | Aim with mouse-look enabled |
| P | Toggle mouse capture / compatibility mouse-look |
| Left click / Space | Fire, punch or shield bash |
| Right click | Aim rifle / raise shield |
| 1 / 2 / 3 | Equipped gun / shield / gloves |
| R | Reload gun |
| Ctrl | Sprint |
| Q / E | Smoke / dash |
| 9 | Instant 180-degree turn |
| 0 | Open or close menu and shop |
| Esc | Pause or close shop |

If the browser rejects cursor capture, compatibility mouse-look hides the cursor over the game but cannot trap or recenter it. Right-drag or arrow keys also aim. A separate desktop browser tab may allow native capture. Touch controls are not included.

## Shop and loadout

Collect gold drops for coins. Open 0 → Shop to buy supplies, upgrades or equipment. Open Your Loadout → Equip to use a purchased Talon Carbine, Bulwark Shield or Shock Gloves. Original equipment can be re-equipped. The game pauses while the shop is open. Coins, ownership and upgrades carry through rounds in the current run and reset on redeploy or page reload.

## Run tests

Install Node.js 20 or newer. No npm packages are needed.

```bash
npm test
```

Tests check JavaScript syntax, actual shop/equipment code, coin guards, duplicate purchases, resource caps, equipment stats and the 180-degree turn. They extract functions from the real game file and use small mocks for UI/3D dependencies. They do not launch a browser or prove visual rendering, WebGL, sound, pointer lock or controller behavior; those require manual browser testing.

## Editing

All game code lives in `dist/index.html`. Start with `CONFIG` for round and rifle settings, `EQUIPMENT` for purchasable gear, `SHOP` for prices, `DuckEnemy` for bots, and `setupRound` for waves/bosses. Audio uses synthesized placeholders; assign recorded audio URLs in the Sound class to replace them. This is an original solo prototype, not an online multiplayer game.

## GitHub repository setup

The repository includes `dist/`, `test/`, `README.md`, `package.json`, `.gitignore` and `.github/workflows/test.yml`. There is no build step or npm dependency installation required. The committed `dist/index.html` is both the complete game source and the deployable page.

### Upload

Create an empty GitHub repository. Extract this ZIP, open the `quack-strike` folder, and upload its contents to the repository root. Include `.github/` and `.gitignore`. If using Git locally:

```bash
git init
git add .
git commit -m "Add Quack Strike game, tests, and documentation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository URL. GitHub Actions runs `npm test` on pushes and pull requests. It tests the game but does not deploy it. Static hosting providers should serve the contents of `dist/`.

### Commands

Run the game with Python 3:

```bash
python3 -m http.server 8000 --directory dist
```

On Windows, `py -m http.server 8000 --directory dist` is an alternative. Open http://localhost:8000.

Run tests with Node.js 20+ (npm is included):

```bash
npm test
```

Or directly: `node --test test/game.test.cjs`.
