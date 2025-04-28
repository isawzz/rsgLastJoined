var modern_palettes = {
	CD_green_blue: { GreenMountain: '#3d7c47', BlueMountain: '#09868b', LightBlueBackdrop: '#76c1d4', BarelyGrayEdge: '#f7f7f7' },
	CD_gelb_orange_grau: { Blueberry: '#6B7A8F', Apricot: '#F7882F', Citrus: '#F7C331', AppleCore: ' #DCC7AA' },
	CD_blue_brown: { FrenchLaundryBlue: '#3a4660', ComfortablyTan: '#c9af98', PeachyKreme: '#ed8a63', BrownBonnet: '#845007' },
	CD_yellow_grey: { Areyayellow: '#feda6a', SilverFox: '#d4d4dc', DeepMatteGrey: '#393f4d' }, //, DarkSlate: '#1d1e22'},
	CD_fresh_green_grey_yellow: { MorningSky: '#CAE4DB', Honey: '#DCAE1D', Cerulean: '#00303F', Mist: '#7A9D96' },
	CD_green_beige: { green: '#BFEB55', green2: '#458766', beige: '#F9F68A', beige2: '#FBF1B4' },
	CD_dark_beach: { c1: 'rgb(3, 74, 166)', c2: 'rgb(0, 6, 13)', c3: 'rgb(83, 119, 166)', c4: 'rgb(64, 95, 115)', c5: 'rgb(62, 89, 86)' },
	CD_color_beach: { c1: 'rgb(83, 111, 166)', c2: 'rgb(3, 74, 166)', c3: 'rgb(126, 174, 217)', c4: 'rgb(242, 181, 107)', c5: 'rgb(4, 173, 191)' }
};
function getColors(n = 3) {
	let key = chooseRandom(Object.keys(modern_palettes));
	let colors = Object.values(modern_palettes[key]);
	colors = choose(colors, n);
	shuffle(colors);
	console.log('*** new palette:',key,'colors:',colors.toString())
	return colors;
}
function setColorPalette(colors, type = 'shade') {
	//color 0 is main color
	//color 1 is secondary color
	//color 2 is highlightColor (will be named --palh_x in css!)
	let pals = colors.map(x=>getPalette(x)); //getPalette(colors); //getPalette(colors, type);
	//set all css color variables to I can use them in css
	let i = 0;
	let d = 0;
	let ch = ['0', '1', 'h'];
	for (const p of pals) {
		for (const c of p) {
			setCSSVariable('--pal' + ch[i] + '_' + d, c);
			d += 1;
		}
		i += 1;
		d=0;
	}
	if (nundef(S.pals))	S.pals = pals;
	else {S.pals[0]=pals[0];S.pals[1]=pals[1];S.pals[2]=pals[2];}
}
function colorChrome() {
	let pals = S.pals;
	setCSSVariable('--bgTabs', pals[0][3]);
	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
}
function colorSystem() {
	//console.log(S.pals)
	simpleColors(randomColor());
	return;

	let colors = getColors(3);
	setColorPalette(colors);
	ROOT.ids.map(x => { let o = getVisual(x); setCSSVariable(o.cssColor, S.pals[o.iPalette][o.ipal]); });
	colorChrome();

	_runRegistry('paletteUpdates');
}

//************************************************************ */
//#region newer
function colorElem(id, setFg = true) {
	let spa = getVisual(id);
	//console.log(spa);
	if (!('spa' in spa.isa)) return;
	let bg = S.pals[spa.iPalette][spa.ipal];
	let elem = M.uis[id];
	if (isdef(spa.cssColor)) {
		setCSSVariable(spa.cssColor, bg);
	} else {
		//todo was wenn nicht ein div?
		elem.style.backgroundColor = fg;
	}
	if (setFg) {
		let fg = colorIdealText(bg);
		elem.style.color = fg;
	}
}

function colorChildren(strid, setFg = true) {
	for (const spid of strid.ids) {
		colorElem(spid, setFg);
	}
}

//************************************************************ */
//#region old
function colorAreas(fromLocalStorage = true, nColors = 2) {
	//should be at least 2 colors (actually, 2 colors is ideal!)
	let key = chooseRandom(Object.keys(modern_palettes));
	//console.log('colors chosen from:', key);
	let colors = Object.values(modern_palettes[key]);
	colors = choose(colors, nColors + 1);
	shuffle(colors);
	//let ihighlight = randomNumber(0, nColors - 1);
	// let highlightColor = colors.splice(ihighlight, 1);
	// console.log('colors', colors);
	// console.log('highlightColor', highlightColor);

	let pals = colors.map(x=>getPalette(x)); //getPalette(colors);
	setSYS('pals', pals);
	// setSYS('hues', colors);
	//console.log('each array has', pals[0].length, 'colors');

	let ihue = 0;
	let idarkness = 1; //darkest reserved for buttons and bg main

	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	for (const areaName of getSYS('baseAreaNames')) {
		console.log(areaName, ihue, idarkness);
		let areaInfo = getArea(areaName);
		let a = areaInfo.div;
		let bg = pals[ihue][idarkness];
		a.style.backgroundColor = bg;
		areaInfo.bg = bg;
		//console.log(bg);
		let fg = colorIdealText(bg);
		a.style.color = fg;
		areaInfo.fg = fg;
		areaInfo.idarkness = idarkness;
		areaInfo.ihue = ihue;

		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1; //do NOT use lightest colors (want white foreground!)
		ihue = (ihue + 1) % 2; //alternate palettes!
	}
}
function colorAreas_wild(fromLocalStorage = true, { className = null } = {}) {
	let hues = getRandomHues(fromLocalStorage);
	let pals = getPaletteFromHues(hues);
	setSYS('pals', pals);
	setSYS('hues', hues);

	let ihue = 0;
	let idarkness = 1; //darkest reserved for buttons and bg main

	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	let areaNames = [];
	if (isdef(className)) {
		let divs = document.getElementsByClassName(className);
		areaNames = divs.map(x => x.id);
		console.log(divs, areaNames);
	} else {
		areaNames = getSYS('baseAreaNames');
	}
	console.log(areaNames);
	for (const areaName of areaNames) {
		if (isdef(className)) {
			let d = document.getElementById(areaName);
			a.style.backgroundColor = randomColor();
			let fg = colorIdealText(bg);
			continue;
		}
		let areaInfo = getArea(areaName);
		let a = areaInfo.div;
		let bg = pals[ihue][idarkness];
		a.style.backgroundColor = bg;
		areaInfo.bg = bg;
		let fg = colorIdealText(bg);
		a.style.color = fg;
		areaInfo.fg = fg;
		areaInfo.idarkness = idarkness;
		areaInfo.ihue = ihue;

		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1; //do NOT use lightest colors (want white foreground!)
		ihue = (ihue + 1) % pals.length; //alternate palettes!
	}
}
function getPal(ipal, pal) {
	return pal[ipal % pal.length];
}
function getPaletteFromHues(hues) {
	let colors = hues.map(h => colorFromHue(h));
	return colors.map(x=>getPalette(x));// getPalette(colors);
}
function getRandomHues(fromLocalStorage = true) {
	//super messy! REDO!!!
	let hue1 = randomNumber(0, 360); //30 * randomNumber(0, 12);
	if (hue1 > 165 && hue1 < 195) hue1 += 60;
	if (hue1 > 270 && hue1 < 325) hue1 = (hue1 + 120) % 360;
	let hue2 = randomNumber(0, 360); //30 * randomNumber(0, 12);
	if (hue2 > 168 && hue2 < 192) hue2 += 70;
	if (hue2 > 270 && hue2 < 325) hue2 = (hue2 + 120) % 360;
	if (Math.abs(hue1 - hue2) < 20) {
		hue1 = randomNumber(-30, 160);
		hue2 = randomNumber(200, 280);
	}
	if (fromLocalStorage) {
		let info = localStorage.getItem('palette');
		if (info) {
			let ns = allNumbers(info);
			hue1 = ns[0];
			hue2 = ns[1];
		}
	}
	return [hue1, hue2];
}

//light>dark
var blues = [
	'#f7fbff',
	'#ecf4fc',
	'#e2eef8',
	'#d8e7f5',
	'#cde0f1',
	'#c0d9ed',
	'#b0d2e8',
	'#9fc9e2',
	'#8bbfdd',
	'#77b4d8',
	'#63a8d2',
	'#529ccc',
	'#4190c5',
	'#3382be',
	'#2575b6',
	'#1a67ad',
	'#1059a1',
	'#0a4c92',
	'#083e7f',
	'#08306b'
];
var green = [
	'#f7fcf5',
	'#eff9ec',
	'#e7f6e2',
	'#dcf1d7',
	'#d0edca',
	'#c2e7bc',
	'#b3e0ac',
	'#a2d99d',
	'#90d18d',
	'#7dc87f',
	'#69be72',
	'#55b466',
	'#42a85c',
	'#339c52',
	'#268f47',
	'#18823d',
	'#0c7433',
	'#03652a',
	'#005522',
	'#00441b'
];
var greys = [
	'#ffffff',
	'#f9f9f9',
	'#f2f2f2',
	'#e9e9e9',
	'#e0e0e0',
	'#d5d5d5',
	'#cacaca',
	'#bdbdbd',
	'#aeaeae',
	'#9f9f9f',
	'#8f8f8f',
	'#808080',
	'#727272',
	'#636363',
	'#545454',
	'#434343',
	'#313131',
	'#202020',
	'#101010',
	'#000000'
];
var oranges = [
	'#fff5eb',
	'#ffefdf',
	'#fee8d1',
	'#fee0c1',
	'#fdd6af',
	'#fdcb9b',
	'#fdbe85',
	'#fdb06f',
	'#fda25a',
	'#fc9446',
	'#f98534',
	'#f57623',
	'#ee6815',
	'#e55a0b',
	'#d84d05',
	'#c84303',
	'#b43b02',
	'#a13403',
	'#902d04',
	'#7f2704'
];
var purples = [
	'#fcfbfd',
	'#f6f5fa',
	'#f0eff6',
	'#e9e8f2',
	'#e0dfee',
	'#d6d6e9',
	'#cacae3',
	'#bebedc',
	'#b1b0d4',
	'#a4a2cd',
	'#9894c6',
	'#8b87bf',
	'#8079b8',
	'#7668af',
	'#6c56a6',
	'#63449d',
	'#5a3294',
	'#51218c',
	'#481085',
	'#3f007d'
];
var bluegreen = [
	'#f7fcfd',
	'#eff9fb',
	'#e7f6f8',
	'#def2f3',
	'#d2eeeb',
	'#c4e9e2',
	'#b1e1d6',
	'#9cd9c9',
	'#86d0bb',
	'#72c7ab',
	'#5fbe9a',
	'#4fb587',
	'#40aa73',
	'#339d5f',
	'#268f4d',
	'#18823e',
	'#0c7433',
	'#03652a',
	'#005522',
	'#00441b'
];
var bluepurple = [
	'#f7fcfd',
	'#edf5f9',
	'#e3eef5',
	'#d7e5f0',
	'#c9dbeb',
	'#bcd1e5',
	'#aec7e0',
	'#a2bbd9',
	'#98add2',
	'#919eca',
	'#8d8dc1',
	'#8c7bb9',
	'#8b69b0',
	'#8a57a7',
	'#88449e',
	'#853192',
	'#801e84',
	'#741073',
	'#62075f',
	'#4d004b'
];

//dark>light
var cubehelix = [
	'#000000',
	'#130918',
	'#1a1732',
	'#192a47',
	'#15414e',
	'#17584a',
	'#246b3d',
	'#3f7632',
	'#647a30',
	'#8d7a3c',
	'#b17959',
	'#ca7b81',
	'#d485ac',
	'#d296d1',
	'#c9ade9',
	'#c2c5f3',
	'#c3dbf2',
	'#d0ecef',
	'#e6f7f1',
	'#ffffff'
];
var inferno = [
	'#000004',
	'#08051d',
	'#180c3c',
	'#2f0a5b',
	'#450a69',
	'#5c126e',
	'#71196e',
	'#87216b',
	'#9b2964',
	'#b1325a',
	'#c43c4e',
	'#d74b3f',
	'#e55c30',
	'#f1711f',
	'#f8870e',
	'#fca108',
	'#fbba1f',
	'#f6d543',
	'#f1ed71',
	'#fcffa4'
];
var magma = [
	'#000004',
	'#07061c',
	'#150e38',
	'#29115a',
	'#3f0f72',
	'#56147d',
	'#6a1c81',
	'#802582',
	'#942c80',
	'#ab337c',
	'#c03a76',
	'#d6456c',
	'#e85362',
	'#f4695c',
	'#fa815f',
	'#fd9b6b',
	'#feb47b',
	'#fecd90',
	'#fde5a7',
	'#fcfdbf'
];

//dark-light-dark
var purplegreen = [
	'#40004b',
	'#5c1768',
	'#753283',
	'#8a529a',
	'#9e74ae',
	'#b391c1',
	'#c7acd2',
	'#dac4e0',
	'#e9daea',
	'#f0ebf0',
	'#ecf2ea',
	'#def0d9',
	'#c8e8c2',
	'#acdca7',
	'#89c988',
	'#64b26a',
	'#409750',
	'#237b3b',
	'#0f5f2a',
	'#00441b'
];
function getHues(colorDict = { Blueberry: '#6B7A8F', Apricot: '#F7882F', Citrus: '#F7C331', AppleCore: ' #DCC7AA' }) {
	let res = [];
	for (const k in colorDict) {
		let hue = colorHue(colorDict[k]);
		res.push(hue);
	}
	return res;
}
