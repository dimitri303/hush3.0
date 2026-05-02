export function createLayout(RW, RH) {
  return {
    room: { x: 0, y: 0, w: RW, h: RH },
    win: { x: 427, y: 178, w: 1071, h: 473 },
    chair: { x: 172, y: 534, w: 540, h: 464 },
    lamp: { x: 426, y: 462, w: 200, h: 304 },
    hifi: { x: 540, y: 347, w: 1041, h: 490 },
    recordPlayer: { x: 553, y: 556, w: 181, h: 112 },
    headphones: { x: 722, y: 598, w: 99, h: 81 },
    tv: { x: 1258, y: 485, w: 290, h: 206 },
    table: { x: 873, y: 617, w: 805, h: 602 },
    mug: { x: 961, y: 875, w: 147, h: 101 },
    remote: { x: 1139, y: 887, w: 117, h: 106 },
    books: { x: 1394, y: 856, w: 193, h: 148 },
    cube: { x: 1250, y: 819, w: 140, h: 164 },
    cubeGlow: { x: 1320, y: 875 },
    screen: { x: 1317, y: 526, w: 113, h: 113 },
    rackDisplay: { x: 775, y: 681, w: 192, h: 12 },
    rackKnobs: { x: 913, y: 705 },
    recordSleeve: { x: 675, y: 673, w: 79, h: 74 },
    lampMouth: { x: 541, y: 524 },
    lampTarget: { x: 582, y: 715 },
    tvGlowOrigin: { x: 1378, y: 601 },
    tvGlowSpill: { x: 828, y: 784 },
    hifiGlowOrigin: { x: 811, y: 689 },
    hifiGlowSpill: { x: 811, y: 751 },
    moon: { x: 1266, y: 213, w: 76, h: 37 }
  };
}

export const hotspots = [
  {
    id: 'window',
    label: 'the window',
    hit: { x: 535, y: 265, w: 825, h: 319 },
    focus: { x: 535, y: 265, w: 824, h: 319 },
    card: 'winUi',
    zoom: { s: 1.55, ax: 0.50, ay: 0.42 }
  },
  {
    id: 'hifi',
    label: 'the hi-fi',
    hit: { x: 641, y: 636, w: 440, h: 109 },
    focus: { x: 641, y: 635, w: 440, h: 111 },
    card: 'hifiUi',
    zoom: { s: 1.75, ax: 0.50, ay: 0.58 }
  },
  {
    id: 'tv',
    label: 'the television',
    hit: { x: 1258, y: 485, w: 290, h: 206 },
    focus: { x: 1258, y: 485, w: 290, h: 244 },
    card: 'tvUi',
    zoom: { s: 2.05, ax: 0.50, ay: 0.50 }
  },
  {
    id: 'holo',
    label: 'the holocube',
    hit: { x: 1248, y: 845, w: 150, h: 150 },
    focus: { x: 1248, y: 845, w: 150, h: 150 },
    card: 'holoUi',
    zoom: { s: 2.25, ax: 0.50, ay: 0.70 }
  },
  {
    id: 'lamp',
    label: 'the lamp',
    hit: { x: 479, y: 484, w: 81, h: 269 },
    focus: { x: 452, y: 472, w: 129, h: 300 },
    card: null,
    zoom: { s: 1.85, ax: 0.32, ay: 0.55 }
  }
];

export const tracks = [
  { title: 'Blue Potion', subtitle: 'Plush Gun', coverHue: '#8ed6ff' },
  { title: 'Tokyo Static', subtitle: 'Hush Radio', coverHue: '#ff94db' },
  { title: 'Hush', subtitle: 'Suite 27', coverHue: '#b1a1ff' }
];
