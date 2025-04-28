function areaBlink(id) {
	let area = UIS[id];
	if (area) area.elem.classList.add('blink');
}
function stopBlinking(id) {
	let area = UIS[id];
	if (area) area.elem.classList.remove('blink');
}
function evToO(ev) {
	return getVisual(evToId(ev));
}



//TODO: integrieren, updaten!!!

function disableClick(el) {
	let ms = 'ms' in el ? el.ms : el;
	ms.clickHandler = null;
	ms.disable();
}
function enableClick(el, handler) {
	// //console.log('enableClick_________________start')
	let ms = 'ms' in el ? el.ms : el;
	ms.clickHandler = handler;
	ms.enable();
	// //console.log(ms,el,handler)
	// //console.log('enableClick_________________end')
}
function disableHover(el) {
	let ms = 'ms' in el ? el.ms : el;
	ms.mouseEnterHandler = null;
	ms.mouseLeaveHandler = null;
	ms.disable();
}
function enableHover(el, enterHandler, leaveHandler) {
	// //console.log('enableClick_________________start')
	// //console.log('enterHandler', enterHandler);
	// //console.log('leaveHandler', leaveHandler);
	let ms = 'ms' in el ? el.ms : el;
	ms.mouseEnterHandler = enterHandler;
	ms.mouseLeaveHandler = leaveHandler;
	ms.enable();

	// //console.log(ms, el);
	// //console.log('enableClick_________________end')
}
function glabels(board, ids, func, { bg, fg, contrastBackground = false, force = true, shrinkFont = false, wrap = false, fz = 20 } = {}) {
	for (const id of ids) {
		let el = board.objects[id];
		let val = func(el);
		glabel(el, val, { bg: bg, fg: fg, contrastBackground: contrastBackground, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz });
	}
}
function glabel(el, val, { bg, fg, contrastBackground = false, force = true, shrinkFont = false, wrap = false, fz = 20 } = {}) {
	let ms = el.ms;
	if (contrastBackground) {
		unitTestMS('.................fill black!!!');
		ms.text({ txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black' });
	} else {
		ms.text({ txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: bg, fill: fg });
	}
}
function updateColors(o) {
	let pal = S.pals[o.iPalette];
	let bg = pal[o.ipal];
	o.setBg(bg);
	if (o.strInfo && o.strInfo.ipals) {
		//hier muss ich aber wissen ob children colors via parent iPalette gesetzt wurden!
		let ipals = o.strInfo.ipals;
		for (const id of o.ids) {

			let o = getVisual(id);
			if (o.isManual) continue;
			let info = o.memInfo;
			if (info && info.isPal) {
				let ipal = ipals[info.memType == 'field' ? 0 : info.memType == 'corner' ? 1 : 2];
				// if (info.memType == 'edge'){
				// 	//console.log('updating edge color!!!',o.id)
				// }
				o.setBg(pal[ipal], false);
			}
		}
	}
}
function initTableOptions(playMode) {
	if (playMode == 'play') {
		S.settings.table = {
			// //affect: how to handle new objects coming up in object table
			// createDummy: false, //unspecified objects are created as dummy objects in 'objects' tab (under game area)
			// detectBoardLocation: true, //try detecting if this object has a field, edge or corner prop that hints at a board location
			//updateIf: 'changed', // always, changed, new
			// propPlayerIsColor: true,

			//affect: presentation of existing object's properties
			showComplexVals: false, // true, false (show lists and objects)
			optIn: null,
			optOut: { visible: -1, obj_type: -1, row: -1, col: -1, rows: -1, cols: -1, neighbors: -1, corners: -1, edges: -1, fields: -1, id: -1, name: -1 }, //any type names likely not to be relevant for user
			showProps: false,
			sysprop: { player: presentPlayer }, // S.settings.game == 'catan' ? null : {player: presentPlayer},
			fontSize: S.settings.game == 'catan' ? 12 : 60
		};
	} else {
		//dev mode
		S.settings.table = {
			// createDummy: true, //unspecified objects are created as dummy objects in 'objects' tab (under game area)
			// detectBoardLocation: false, //try detecting if this object has a field, edge or corner prop that hints at a board location
			//updateIf: 'always', // always, changed, new
			// propPlayerIsColor: false,

			showComplexVals: true, // true, false (show lists and objects)
			optin: null,
			optOut: { row: -1, col: -1, neighbors: -1, corners: -1, edges: -1, obj_type: -1, name: -1, id: -1 }, //any type names likely not to be relevant for user
			showProps: true,
			sysprop: S.settings.game == 'catan' ? null : { visible: presentVisible },
			fontSize: 12
		};
	}
}









