var choiceCompleted = false;
var frozen=false;

function startInteraction() {
	boatFilters = [];
	if (isdef(IdOwner.a)) IdOwner.a.map(x => addStandardInteraction(x));
	if (isdef(IdOwner.l)) IdOwner.l.map(x => addStandardInteraction(x)); //da muss click handler removen!!!!
	if (isdef(IdOwner.p)) IdOwner.p.map(x => addStandardInteraction(x));
	if (isdef(IdOwner.r)) IdOwner.r.map(x => addStandardInteraction(x));
	if (isdef(IdOwner.s)) IdOwner.s.map(x => addStandardInteraction(x)); //anderen clickHandler
	if (isdef(IdOwner.t)) IdOwner.t.map(x => addStandardInteraction(x)); //anderen clickHandler
	preselectFirstVisualsForBoats();
	choiceCompleted = false;
	//console.log(S_autoplayFunction)
	let autoplay = S_autoplayFunction(G) || getBoatIds().length < 2;
	if (autoplay) {
		//console.log('ai is thinking...');
		setTimeout(onClickStep, S_AIThinkingTime);
		return;
	} else {
		setAutoplayFunctionForMode();
		unfreezeUI();
	}
}
function stopInteractionH(){
	//only unhighlight all, leave handlers on
	if (isdef(IdOwner.a)) IdOwner.a.map(x => removeAllHighlighting(x));
	if (isdef(IdOwner.l)) IdOwner.l.map(x => removeAllHighlighting(x)); //da muss click handler removen!!!!
	if (isdef(IdOwner.p)) IdOwner.p.map(x => removeAllHighlighting(x));
	if (isdef(IdOwner.r)) IdOwner.r.map(x => removeAllHighlighting(x));
	if (isdef(IdOwner.s)) IdOwner.s.map(x => removeAllHighlighting(x)); //anderen clickHandler
	if (isdef(IdOwner.t)) IdOwner.t.map(x => removeAllHighlighting(x)); //anderen clickHandler
	setTimeout(hideTooltip, 500);
}
function stopInteraction() {
	//remove all handlers
	if (isdef(IdOwner.a)) IdOwner.a.map(x => removeInteraction(x));
	if (isdef(IdOwner.l)) IdOwner.l.map(x => removeInteraction(x)); //da muss click handler removen!!!!
	if (isdef(IdOwner.p)) IdOwner.p.map(x => removeInteraction(x));
	if (isdef(IdOwner.r)) IdOwner.r.map(x => removeInteraction(x));
	if (isdef(IdOwner.s)) IdOwner.s.map(x => removeInteraction(x)); //anderen clickHandler
	if (isdef(IdOwner.t)) IdOwner.t.map(x => removeInteraction(x)); //anderen clickHandler
	setTimeout(hideTooltip, 500);
}

function onClickSelectTuple(ms, part) {
	if (choiceCompleted) return;
	choiceCompleted = true;
	let id = ms.id;
	iTuple = ms.o.iTuple;
	console.log(counters.msg + ': '+G.player+' :', iTuple, ms.o.desc, ms.o.text, ms.id);
	freezeUI();
	stopInteractionH();
	sendAction_NotYet(ms.o, [gameStep]);
}
var boatFilters = [];
function onClickFilterTuples(ms, part) {
	//hat auf irgendein object or player geclickt
	let id = ms.id;
	if (boatFilters.includes(id)) {
		removeFilterHighlight(ms);
		removeInPlace(boatFilters, id);
		let relids = getList(id2uids[id]);
		let boats = relids.filter(x => x[2] == 'a');
		if (empty(boats)) { return; } // no effect!
		for (const bid of boats) { if (!fi.includes(bid)) { showBoat(bid); } }//show boats that have been filtered out but do not contain any of the other filters
	} else {
		let relids = getList(id2uids[id]);
		//console.log(relids)
		let boats = relids.filter(x => x[2] == 'a');
		//console.log(boats)
		if (empty(boats)) { return }//console.log('no boat!'); return; } // no effect!

		if (boats.length == 1) {
			//console.log(boats[0])
			onClickSelectTuple(UIS[boats[0]]);
		} else {
			boatFilters.push(id);
			addFilterHighlight(ms);
			for (const bid of IdOwner.a) { if (!boats.includes(bid)) { hideBoat(bid) } } //soll von tuple liste nur die tuples anzeigen, wo diese id vorkommt
			//TODO!!! soll von objects nur die anzeigen, die in einem der visible tuples vorkommen
		}
	}
}
function onClickStep() {
	if (!this.choiceCompleted) {
		//let ms=getRandomBoat(); 
		let ms = getBoatWith(['demand', 'offer'], false);
		// let ms = getBoatWith(['demand', 'offer'], false);
		onClickSelectTuple(ms);
	}
}
function onClickToggleButton(button, handlerList) {
	let current = button.textContent;
	let idx = -1;
	let i = 0;
	for (const item of handlerList) {
		if (item[0] == current) {
			idx = i; break;
		}
		i += 1;
	}
	if (idx >= 0) {
		let idxNew = (idx + 1) % handlerList.length;
		button.textContent = handlerList[idxNew][0];
		handlerList[idxNew][1]();
	}
}
function onClickRestart() {
	unfreezeUI();
	_start(S.settings.game);
}
function onClickRunToNextPlayer() {
	let pl = G.player;
	S_autoplayFunction = (_G) => _G.player == pl;

	onClickStep(G);
}
function onClickRunToNextTurn() {
	let pl = G.player;
	S_autoplayFunction = (_G) => {
		if (_G.player != pl) {
			S_autoplayFunction = (_G1, _) => _G1.player != pl;
		};
		return true;
	};
	onClickStep(G);
}
function onClickRunToEnd() {
	S_autoplayFunction = () => true;
	onClickStep(G);
}
function onClickRunToAction(bId, keyword) {
	let b = document.getElementById(bId);
	S_autoplayFunction = (_G) => {
		//run to action available that contains keyword
		//should return true unless one of the boats.tuple has an element with val.includes(keyword)
		//console.log(getBoats());
		for (const ms of getBoats()) {
			for (const ti of ms.o.tuple) {
				if (ti.val.toString().includes(keyword)) {
					setAutoplayFunctionForMode();
					return false;
				}
			}
		}
		return true;
	}
	onClickStep(G);
}
function onClickStop() {
	//console.log('*** clicked STOP!!! ***');
	setAutoplayFunctionForMode(S_playMode);
	unfreezeUI();
	//startInteraction();
	// setTimeout(()=>setAutoplayFunctionForMode(S_playMode),1000);
	//STOP = true;
	//setTimeout(showStep,100);
}

//#region helpers
function addFilterHighlight(ms) { ms.highC('green'); }
function addStandardInteraction(id) {
	//console.log(id)
	let ms = UIS[id];
	switch (id[2]) {
		case 'a': ms.addClickHandler('elem', onClickSelectTuple); break;
		case 'l': break;
		case 'r': break;
		default: ms.addClickHandler('elem', onClickFilterTuples); break;
	}
	//if (id[0]=='m') return;
	ms.addMouseEnterHandler('title', highlightMsAndRelatives);
	ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
}
function fullViewObjects() { let ids = getDefaultObjectIds(); ids.map(x => UIS[x].maximize()); }
function minimizeObjects() { let ids = getDefaultObjectIds(); ids.map(x => UIS[x].minimize()); }
function preselectFirstVisualsForBoats() {
	let oidlist = [];
	for (const id of getBoatIds()) {
		//select firstVisual for each oid in boat
		let oids = id2oids[id];
		//console.log(oids);
		if (isdef(oids)) oids.map(x => addIf(oidlist, x))
	}
	//console.log('oids to select:',oidlist);

	//console.log(oidlist);
	let vislist = oidlist.map(x => getMainId(x)).filter(x => x !== null);
	vislist = vislist.concat(oidlist.map(x => getDefId(x)));
	//console.log(vislist);
	vislist.map(id => UIS[id].highFrame());
}
function removeFilterHighlight(ms) { ms.unhighC(); }
function removeAllHighlighting(id) {let ms = UIS[id];	ms.unhighAll(); }
function removeClickHandler(id) {let ms = UIS[id];	ms.removeHandlers();	 }
function removeHoverHandlers(id) { let ms = UIS[id];	ms.removeHandlers();}
function removeInteraction(id) {	let ms = UIS[id];	ms.removeHandlers();	ms.unhighAll();}

function hideBoat(id) { let ms = UIS[id]; ms.hide(); ms.o.weg = true; }
function showBoat(id) { let ms = UIS[id]; ms.show(); ms.o.weg = false; }

function highlightMsAndRelatives(ms, partName) {
	//console.log(ms,ms.id,partName)
	let id = ms.id;
	ms.high(partName);
	let relativeIds = id2uids[id];
	if (nundef(relativeIds)) return;
	for (const idRel of relativeIds) {
		let msRel = UIS[idRel];
		msRel.high('title');
	}
}
function unhighlightMsAndRelatives(ms, partName) {
	let id = ms.id;
	ms.unhigh(partName);
	let relativeIds = id2uids[id];
	if (nundef(relativeIds)) return;
	for (const idRel of relativeIds) {
		let msRel = UIS[idRel];
		msRel.unhigh('title');
	}
}

function freezeUI() {
	if (frozen) return;
	frozen = true;
	if (S_autoplay && S_playMode == 'solo') {
		hide(document.getElementById('tempFreezer'));
		show(document.getElementById('freezer'));
	} else {
		hide(document.getElementById('freezer'));
		show(document.getElementById('tempFreezer'));
	}
}
function unfreezeUI() {
	if (!frozen) return;
	frozen = false;
	hide(document.getElementById('tempFreezer'));
	if (!S_autoplay) hide(document.getElementById('freezer'));
}

















function addTestInteraction(id) {
	let ms = UIS[id];
	ms.addClickHandler('title', onClickGetUIS);
	ms.addMouseEnterHandler('title', (x, pName) => x.high(pName));
	ms.addMouseLeaveHandler('title', (x, pName) => x.unhigh(pName));
}
function addBoatInteraction(id) {
	//console.log(id)
	let ms = UIS[id];
	ms.addClickHandler('elem', onClickSelectTuple);
	ms.addMouseEnterHandler('title', (x, pName) => x.high(pName));
	ms.addMouseLeaveHandler('title', (x, pName) => x.unhigh(pName));
}
function activateActions() { IdOwner.a.map(x => addBoatInteraction(x)) }
