export function createLayout(RW, RH) {
  return {
    room: { x: 0, y: 0, w: RW, h: RH },
    win: { x: 427, y: 178, w: 1071, h: 473 },
    chair: {"x":-3,"y":499,"w":667,"h":588},
    lamp: {"x":346,"y":462,"w":200,"h":304},
    hifi: { x: 540, y: 347, w: 1041, h: 490 },
    recordPlayer: { x: 558, y: 553, w: 203, h: 131 },
    headphones: { x: 770, y: 603, w: 84, h: 79 },
    tv: { x: 1292, y: 525, w: 247, h: 177 },
    table: {"x":748,"y":517,"w":1038,"h":788},
    mug: {"x":924,"y":865,"w":185,"h":130},
    remote: {"x":1101,"y":887,"w":141,"h":126},
    books: {"x":1399,"y":793,"w":256,"h":222},
    cube: { x: 1250, y: 819, w: 140, h: 164 },
    cubeGlow: { x: 1320, y: 875 },
    screen: { x: 1337, y: 555, w: 104, h: 104 },
    rackDisplay: { x: 788, y: 692, w: 165, h: 12 },
    //rackKnobs: { x: 913, y: 705 },
    recordSleeve: { x: 523, y: 689, w: 79, h: 74 },
    lampMouth: {"x":462,"y":524},
    lampTarget: { x: 506, y: 781 },
    tvGlowOrigin: { x: 1378, y: 601 },
    tvGlowSpill: { x: 1111, y: 733 },
    hifiGlowOrigin: { x: 811, y: 699 },
    hifiGlowSpill: { x: 811, y: 751 },
    moon: { x: 1266, y: 213, w: 76, h: 37 },
    clock: { x: 1096, y: 597, w: 118, h: 66 },
    clockScreen: { x: 1120, y: 623, w: 53, h: 28 },
    plant: { x: 982, y: 556, w: 166, h: 113 },
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
    hit: { x: 383, y: 484, w: 109, h: 269 },
    focus: { x: 379, y: 472, w: 129, h: 300 },
    card: null,
    zoom: { s: 1.85, ax: 0.32, ay: 0.55 }
  },
  {
    id: 'clock',
    label: 'the clock',
    hit: { x: 1108, y: 606, w: 102, h: 59 },
    focus: { x: 1100, y: 615, w: 124, h: 33 },
    card: null,
    zoom: null
  }
];

export const tracks = [
  { title: 'Blue Potion', subtitle: 'Plush Gun', coverHue: '#8ed6ff' },
  { title: 'Tokyo Static', subtitle: 'Hush Radio', coverHue: '#ff94db' },
  { title: 'Hush', subtitle: 'Suite 27', coverHue: '#b1a1ff' }
];
