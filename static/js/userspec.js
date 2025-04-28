//#region user spec
function specAndDOM(callbacks = []) {
	//after getting init data: G is up to date, ready to be presented
	initSETTINGS();

	//init DOM: prepare UI for game, structure and table setup
	initPageHeader();
	initTABLES();
	initDom();
	//for now just 1 board detected
	if (S.settings.useSpec) initSTRUCTURES(); else detectBoard(G.table,'a_d_game'); //spaeter kommt das mit board detection!!!
	//if (S.settings.tooltips) activateTooltips();

	if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}
function initTABLES() {
	// timit.showTime(getFunctionCallerName());

	//prepare areas for default objects
	let tables;
	if (nundef(S.user.spec) && S_boardDetection) {
		S.settings.present.object.defaultArea = 'a_d_objects';
		S.settings.present.player.defaultArea = 'a_d_players';
		openTabTesting('Vienna');
		tables = {
			a_d_game: [1000, 800],
		};
	} else	if (nundef(S.user.spec)) {
		S.settings.present.object.defaultArea = 'a_d_game';
		S.settings.present.player.defaultArea = 'a_d_players';
		openTabTesting('Vienna');
		tables = {
			a_d_game: [1000, '65vh'],
		};
	} else{
		S.settings.present.object.defaultArea = 'a_d_objects';
		S.settings.present.player.defaultArea = 'a_d_players';
		tables = S.user.spec.TABLES;
		let d = document.getElementById('a_d_game');
		d.style.overflow = 'hidden';
		d.classList.remove('flexWrap')
		openTabTesting('Seattle');
	}

	for (const areaName of [S.settings.present.object.defaultArea, S.settings.present.player.defaultArea]) {
		let d = document.getElementById(areaName);
		d.style.overflow = 'auto';
		d.classList.add('flexWrap');
	}

	//set table sizes
	//console.log('tables', tables)
	for (const areaName in tables) {
		//TODO: add area if not exists as Tab in previous area! for now, just existing areas!
		let cssVarNameWidth = AREAS[areaName][0];
		let w = tables[areaName][0];
		if (isNumber(w)) w = '' + w + 'px';
		setCSSVariable(cssVarNameWidth, w);
		let cssVarNameHeight = AREAS[areaName][1];
		let h = tables[areaName][1];
		if (isNumber(h)) h = '' + h + 'px';
		setCSSVariable(cssVarNameHeight, h);
	}
}
function initSTRUCTURES() {
	// timit.showTime(getFunctionCallerName());
	let data = S.user.spec.STRUCTURES;
	if (nundef(data)) return;

	for (const areaName in data) {
		//console.log(areaName)
		reqs = data[areaName];
		let ms = createMainDiv(areaName, reqs.location);

		for (const prop in reqs) {
			if (prop == 'location') continue;
			if (prop == 'structure') {
				let info = reqs.structure;

				let func = info.type; // rsg will build a structure of desired type if known! eg., hexGrid, quadGrid,...

				let odict = parseDictionaryName(info.object_pool);
				if (!odict) odict = G.table; //default object pool to get board and board member objects from

				let boardInfo = info.cond; //object in object_pool representing board, its id will be board main id!

				let structObject = window[func](odict, areaName, boardInfo);
				//console.log(structObject,func,areaName)
			} else if (typeof reqs[prop] == 'object' && 'binding' in reqs[prop]) {
				let info = reqs[prop].binding;
				//hier muss ich jetzt registry einsetzen!!!
				/**
				 * wenn ich playerUpdate mache, muss ich 
				 * 
				 */
				let filterFunc = 0;//d
				let statement = `getVisual(${areaName}).set${prop.toUpperCase}(${info.object_pool}.)`
				let odict = parseDictionaryName(info.object_pool);

			} else {
				// rsg tries to set this prop for areaName object! eg., visual props bg, fg, bounds
				let lst = jsCopy(reqs[prop]);

				let func = 'set' + capitalize(prop);
				let params = lst;
				if (!Array.isArray(params)) params = params.split(',');
				if (ms[func] !== null) ms[func](...params);
			}
		}
	}
}

