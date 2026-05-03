export const ASSET_DIR = 'assets/';

export const ASSETS = {
  books: 'books.png',
  chair: 'chair.png',
  clockAsset: 'clock.png',
  plant: 'plant.png',
  cubeBase: 'cubeBase.png',
  headphones: 'headphones.png',
  hifiRack: 'hifi-rack.png',
  lamp: 'lamp.png',
  mug: 'mug.png',
  recordPlayer: 'record-player.png',
  speaker: 'speaker.png',
  remote: 'remote.png',
  moon: 'moon.png',
  cityNight: 'city-night.png',
  roomBackplate: 'room-backplate.png',
  table: 'table.png',
  tv: 'tv.png'
};

export const images = {};

export function loadAssets(ui) {
  const assetEntries = Object.entries(ASSETS);
  let loadedAssets = 0;

  assetEntries.forEach(([key, file]) => {
    const img = new Image();
    img.onload = () => {
      loadedAssets += 1;
      ui.loaderTxt.textContent = `LOADING ASSETS… ${loadedAssets}/${assetEntries.length}`;
      if (loadedAssets === assetEntries.length) {
        setTimeout(() => ui.init.classList.add('hide'), 500);
      }
    };
    img.onerror = () => {
      loadedAssets += 1;
      ui.loaderTxt.textContent = `MISSING ${file}`;
      if (loadedAssets === assetEntries.length) {
        setTimeout(() => ui.init.classList.add('hide'), 900);
      }
    };
    img.src = ASSET_DIR + file;
    images[key] = img;
  });
}
