var ROOT = null; //root of UIS domId('root')

//#region dom areas initialization
const AREAS = {
	a_d_action_header: ['--wActions', '--hStatus'],
	a_d_status: ['--wGame', '--hStatus'],
	a_d_history_header: ['--wLog', '--hStatus'],

	a_d_actions: ['--wActions', '--hGame'],
	a_d_game: ['--wGame', '--hGame'],
	a_d_log: ['--wLog', '--hGame'],

	a_d_buttons: ['--wActions', '--hTesting'],
	a_d_testing: ['--wGame', '--hTesting'],
	a_d_options: ['--wLog', '--hTesting'],
}

function initPageHeader() {
	let divGameName = document.getElementById('a_d_divGameName');
	divGameName.innerHTML = `<span style='color:white'><b>${capitalize(S.settings.game)}</b></span>`;
	let divPlayerNames = document.getElementById('a_d_divPlayerNames');
	divPlayerNames.style.color = 'dimgray';
	let s = 'Players:&nbsp;';//&nbsp;';
	for (const pid in G.playersAugmented) {
		let pl = G.playersAugmented[pid];
		let color = pl.color;
		let name = pl.altName;
		// let textColor = colorIdealText(color);
		// spl = `<div id='c_c_${name}' class='header_name' style='border:1px solid white;color:${textColor};background-color:${color}'>${name}</div>`;
		spl = `<div id='c_c_${name}' class='header_name' style='font-weight:bold;color:${color};'>${name}</div>`;
		s += spl;
	}
	divPlayerNames.innerHTML = s;
}
function initDom() {
	// timit.showTime(getFunctionCallerName());
	ROOT = makeRoot();

	createMSTree(ROOT); //existing DOM wrapped in MS, each area stored in UIS
	// timit.showTime('...ms tree built');

	simpleColors(S.settings.colors[0]);
	// timit.showTime('...colors');

	measureMSTree(ROOT); //each div is measured: x,y,w,h
	// timit.showTime('...measure tree');

}
function createMSTree(ms) {
	let areas = ms.elem.children;
	//console.log(areas);
	for (const ch of [...areas]) {
		if (!ch.id) { continue; } //console.log('not created:',ch);
		//console.log(ch)
		let msChild = makeDomArea(ch);
		//console.log(msChild)
		createMSTree(msChild);
	}
}
function measureMSTree(root) {
	//list of relevant dom els: named divs
	let divs = root.elem.getElementsByTagName('div');
	let divNames = [...divs].map(x => x.id);
	divNames = divNames.filter(x => !empty(x));
	divNames.map(x => { measureDomel(UIS[x]) });

	//correct measurement for hidden divs (tabs)
	let tabDivs = domId('a_d_testing').getElementsByClassName('divInTab');
	let correctTabName = 'a_d_objects';
	let correctMS = UIS[correctTabName];
	for (const div of [...tabDivs]) {
		let id = div.id;
		if (id == correctTabName) continue;
		let ms = UIS[id];
		ms.x = correctMS.x; ms.y = correctMS.y; ms.w = correctMS.w; ms.h = correctMS.h;
	}
}
function getAsInt(ms, styleInfo, prop) {
	let h = styleInfo.getPropertyValue(prop);
	h = trim(h);
	// console.log(h[h.length-1]);
	if (h[h.length - 1] == '%') {
		let perc = firstNumber(h);
		let parent = UIS[ms.idParent];
		h = parent.h * perc / 100;
		h = Math.round(h);
	} else if (h[h.length - 1] == 'x') {
		h = h.substring(0, h.length - 2);
		h = Number(h);
		h = Math.round(h);
	} else if (h == 'auto') {
		h = UIS[ms.idParent].h;
	}
	return h;
}
function measureDomel(ms) {
	//only works for divs (HTML elems), not for svg or g elems!!!
	//measure sets x,y,w,h from ms.elem or from parent size
	let el = ms.elem;
	//console.log('>>>>>>>>>>measuring',el.id,el.height,el.offsetHeight,$(el).position(),$(el).height(),$(el).width())
	// ms.w = Math.round($(el).width());
	// ms.h = Math.round($(el).height());
	// let pos = $(el).position(); 
	// //console.log('------------------------->',pos)
	// if(isdef(pos)){ms.x=Math.round(pos.left);ms.y=Math.round(pos.top);}else {ms.x=0;ms.y=0;}

	let info = window.getComputedStyle(el, null);
	// let h = window.getComputedStyle(el, null).getPropertyValue("height");
	// console.log(ms.id,h)
	//console.log(ms.id,info.left,info.top,info.width,info.height)
	ms.x = getAsInt(ms, info, 'left');
	ms.y = getAsInt(ms, info, 'top');
	ms.w = getAsInt(ms, info, 'width');
	ms.h = getAsInt(ms, info, 'height');

	// info.left == 'auto'?0:Math.round(firstNumber(info.left));
	// ms.y=info.top=='auto'?0:Math.round(firstNumber(info.top));
	// ms.w = info.width=='auto'?0:Math.round(firstNumber(info.width));
	// ms.h = info.height=='auto'?0:Math.round(firstNumber(info.height));
	ms.bg = info.backgroundColor;
	ms.fg = info.color;
	//console.log(ms.id,info);


	//ms.w = el.offsetWidth; ms.h = el.offsetHeight; ms.x = el.offsetLeft; ms.y = el.offsetTop;
	return [ms.x, ms.y, ms.w, ms.h];
}
function simpleColors(c = 'powderblue') {
	// timit.showTime(getFunctionCallerName());

	let pal = getPalette(c);
	S.settings.palette=pal;

	ROOT.children.map(x => UIS[x].setBg(pal[2], true));

	setCSSVariable('--bgBody', pal[5]);
	UIS['a_d_header'].setBg(pal[7]);

	UIS['a_d_action_header'].setBg(pal[3]);
	UIS['a_d_history_header'].setBg(pal[3]);

	UIS['a_d_game'].setBg(pal[1]);

	let c1 = pal[1];
	setCSSVariable('--bgTabActive', c1);
	setCSSVariable('--bgTabContent', c1);
	UIS['a_d_testing'].setBg(pal[2]);
	UIS['a_d_testing'].children.map(x => { UIS[x].setBg(c1, true); });

	setCSSVariable('--bgButton', pal[0]);
	setCSSVariable('--fgButton', 'white');
	setCSSVariable('--bgButtonHover', pal[3]);
	setCSSVariable('--bgButtonActive', pal[5]);

	// timit.showTime('end of colors');

}
function simpleSizes_unused(wGame = 1000, hGame = 800, wSide = 200) {
	setCSSVariable('--wGame', wGame + 'px');
	setCSSVariable('--hGame', hGame + 'px');
	setCSSVariable('--wActions', wSide + 'px');
	setCSSVariable('--wLog', wSide + 'px');
	setCSSVariable('--hStatus', 'auto');
	setCSSVariable('--hTesting', '100%');
}
