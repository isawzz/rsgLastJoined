function presentTable() {
	let i = 2;
	for (const oid of G.tableCreated) {
		if (!defaultVisualExists(oid) && S.settings.present.object.createDefault) makeDefaultObject(oid, G.table[oid], S.settings.present.object.defaultArea);

		if (mainVisualExists(oid)) continue;

		//hier wuerde dann create behaviors aufrufen
		if (S.settings.useBehaviors) updatedVisuals = runBEHAVIOR_new(oid, G.table, TABLE_CREATE);
		else makeMainVisual(oid, G.table[oid]);

		//if (S.settings.tooltips) createTooltip(oid, G.table);

		i -= 1;	//if (i<=0)return;
	}
	for (const oid in G.tableUpdated) {
		let changedProps = G.tableUpdated[oid].summary;
		//if (G.tableCreated.includes(oid)) { continue; }

		//if (S.settings.tooltips && TT_JUST_UPDATED == oid) updateTooltipContent(oid, G.table);

		//update main visual
		let ms = getVisual(oid);
		if (ms) {
			let updatedVisuals = {};
			if (S.settings.useBehaviors) updatedVisuals = runBEHAVIOR_new(oid, G.table, TABLE_UPDATE);
			if (!updatedVisuals[oid]) {
				if (changedProps.includes('loc')) presentLocationChange(oid, ms);
				presentMain(oid, ms, G.table);
			}
		}

		//update default visual
		if (!S.settings.present.object.createDefault || ms && S.settings.present.object.createDefault != true) continue;
		presentDefault(oid, G.table[oid]);
	}
}
function presentLocationChange(oid, ms) {
	//TODO: cleanup code!
	if (G.table[oid].obj_type == 'robber') {
		let o = G.table[oid];
		let changedProps = G.tableUpdated[oid];
		//		//console.log(changedProps)
		if (changedProps.summary.includes('loc')) {
			//alert('hallo! robber loc change!');
			//			//console.log(ms);
			let oidLoc = o.loc._obj;
			let visLoc = getVisual(oidLoc);
			ms.setPos(visLoc.x, visLoc.y);
		}
	}
}
function presentPlayers() {
	//creation of new players
	for (const pid of G.playersCreated) {

		if (!defaultVisualExists(pid) && S.settings.present.player.createDefault) makeDefaultPlayer(pid, G.playersAugmented[pid], S.settings.present.player.defaultArea);

		if (mainVisualExists(pid)) continue;

		//hier wuerde dann create behaviors aufrufen

		//if (S.settings.tooltips) createTooltip(pid, G.playersAugmented);
	}
	//presentation of existing changed players 
	for (const pid in G.playersUpdated) {
		//if (G.playersCreated.includes(pid)) { continue; }

		//if (S.settings.tooltips && TT_JUST_UPDATED == pid) updateTooltipContent(pid, G.playersAugmented);

		//update main visual
		let o = getVisual(pid);
		if (o) {
			let updatedVisuals = {};
			if (S.settings.useBehaviors) updatedVisuals = runBEHAVIOR_new(pid, G.playersAugmented, PLAYER_UPDATE);
			//if (!updatedVisuals[pid]) o.table(G.playersAugmented[pid]);
		}

		//update default visual
		if (!S.settings.present.player.createDefault || o && S.settings.present.player.createDefault != true) continue;
		presentDefault(pid, G.playersAugmented[pid], false);
	}
}
function presentStatus() {
	if (isdef(G.serverData.status)) {
		let lineArr = G.serverData.status.line;
		let areaName = 'c_d_statusText';
		let d = document.getElementById(areaName);
		let ms = UIS[areaName];
		ms.clear(); clearElement(d);

		//make aux for current player (TODO: could reuse these but maybe not necessary)
		let pl = G.player;
		let msStatus = makeAux(G.playersAugmented[pl].user+' ('+pl+')', pl, areaName);
		let color = getPlayerColor(pl);
		msStatus.setBg(color);
		msStatus.setFg(colorIdealText(color));

		d.appendChild(document.createTextNode(': '));

		for (const item of lineArr) {
			if (isSimple(item)) {
				let s = trim(item.toString());
				if (!empty(s)) {
					//console.log('adding item:', s, 'to log');
					d.appendChild(document.createTextNode(item)); //ausgabe+=item+' ';
				}
			} else if (isDict(item)) {
				//console.log(item);
				if (item.type == 'obj') {
					let oid = item.ID;
					let ms = makeAux(item.val, oid, areaName);
				} else if (item.type == 'player') {
					let oid = item.val;
					let ms = makeAux(item.val, oid, areaName);
				}
			}
		}
	}
}
function setStatus(s) {
	let areaName = 'c_d_statusText';
	let d = document.getElementById(areaName);
	let ms = UIS[areaName];
	ms.clear(); clearElement(d);
	d.innerHTML = s;
}

function presentLog() {
	//add new logEntries to div
	let d = document.getElementById('a_d_log');
	let BASEMARGIN = 16;
	for (const k of G.logUpdated) {
		let logEntry = G.log[k];
		//let level = logEntry.level ? logEntry.level : 1; //TODO: use level!
		//level=Math.max(1,level);
		//d.appendChild(document.createTextNode('-'.repeat(level-1)));
		let lineArr = logEntry.line;
		let lineDiv = document.createElement('div');
		lineDiv.style.marginLeft = '' + (BASEMARGIN * (logEntry.level)) + 'px';
		//lineDiv.appendChild(document.createTextNode(''+logEntry.level))
		for (const item of lineArr) {
			if (isSimple(item)) {
				let s = trim(item.toString());
				if (!empty(s)) {
					//console.log('adding item:', s, 'to log');
					lineDiv.appendChild(document.createTextNode(item));
					//let node=document.createElement('div');
					//node.innerHTML = item;
					//d.appendChild(node); //ausgabe+=item+' ';
				}
			} else if (isDict(item)) {
				//console.log(item);
				if (item.type == 'obj') {
					let oid = item.ID;
					let ms = makeAux(item.val, oid, 'a_d_log', lineDiv);
				} else if (item.type == 'player') {
					let oid = item.val;
					let ms = makeAux(item.val, oid, 'a_d_log', lineDiv);
				} else {
					//console.log('unknown item in log:', item)
				}
			}
		}
		d.appendChild(lineDiv);
		lineDiv.scrollIntoView(false);
		//d.appendChild(document.createElement('br'));
	}



}
function presentEnd() {
	if (nundef(G.end)) return false;

	let winner = G.serverData.end.winner;
	//console.log('game over! winner',winner)

	let msg = winner == null ? 'Both players win!' : 'Winner is ' + G.playersAugmented[winner].name;
	setStatus('GAME OVER! ' + msg);
	if (winner) {
		setCSSVariable('--bgWinner', G.playersAugmented[winner].color);
		areaBlink('a_d_status');
	}

	//UI update
	S_autoplay = false;
	unfreezeUI();

	//clear action div
	let d = document.getElementById('a_d_divSelect');
	clearElement(d);
	d.scrollTop = 0;
	return true;
}
function presentActions() {
	deleteActions(); //clear rest of action data from last round
	let areaName = 'a_d_divSelect';
	UIS[areaName].elem.scrollTop = 0;
	let iGroup = 0;
	let iTuple = 0;

	for (const tg of G.tupleGroups) {
		for (const t of tg.tuples) {
			let boatInfo = { obj_type: 'boat', oids: [], desc: tg.desc, tuple: t, iGroup: iGroup, iTuple: iTuple, text: t.map(x => x.val), weg: false };
			let ms = makeDefaultAction(boatInfo, areaName);
			iTuple += 1;
		}
		iGroup += 1;
	}
}
function presentWaitingFor() {
	//console.log('changing player!')
	let pl = G.serverData.waiting_for[0];
	let user = G.playersAugmented[pl].user;
	_sendRoute('/status/' + user, d => {
		//console.log('reply to status request for',user,d);
		d = JSON.parse(d);
		processData(d);
		gameStep();
	});
}

//presentation of objects
function getUser(idPlayer) { return G.playersAugmented[idPlayer].user; }
function getPlayerColor(id) { return G.playersAugmented[id].color }
function getPlayerColorString(id) { return G.playersAugmented[id].altName }
function presentMain(oid, ms, pool) {
	let optin = S.settings.game == 'catan' ? ['res', 'num', 'building', 'port'] : ['symbol']; //cheat! keywords fuer catan vs ttt

	let o = pool[oid];

	//first check if color or player is in keys
	let color = o.color ? o.color : o.player ? getPlayerColor(o.player._player) : ms.fg;
	let akku = isField(o)?[''+oid]:[];
	let bg, fg;
	for (const k of optin) {
		let val = o[k];
		if (isSimple(val)) akku.push(val.toString());
	}
	if (!empty(akku)) { ms.multitext({ txt: akku, fill: color }); }
}
function presentDefault(oid, o, isTableObject = true) {
	let ms = getDefVisual(oid);
	if (!ms) return;

	//filter keys using optin and optout lists
	let optin = isTableObject ? S.settings.present.object.optin : S.settings.present.player.optin;
	let optout = isTableObject ? S.settings.present.object.optout : S.settings.present.player.optout;
	//console.log('optin',optin,'optout',optout)
	keys = optin ? optin : optout ? arrMinus(getKeys(o), optout) : getKeys(o);

	let x = ms.tableY(o, keys); //adds or replaces table w/ prop values
	//if (!isTableObject) //console.log(ms.parts.table.innerHTML);
}





