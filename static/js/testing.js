function onClickGetUIS(ms, part) {
	let id = ms.id;
	//console.log('',counters.click,' ______ visuals for', id, id2uids[id])
}
function onClickAddInteraction() { for (const id in UIS) { addTestInteraction(UIS[id]); } }
function onClickRemoveInteraction() {
	timit.showTime('start ' + getFunctionCallerName());
	for (const id in UIS) UIS[id].removeEvents();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickRemoveActions() {
	timit.showTime('start ' + getFunctionCallerName());
	deleteActions();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickAddActions() {
	if (M.boats) { 
		//console.log('actions already presented!'); 
		return; 
	}
	timit.showTime('start ' + getFunctionCallerName());
	presentActions();
	activateActions();
	timit.showTime('...end ' + getFunctionCallerName());

}
function onClickRemoveDefaultObjects() {
	timit.showTime('start ' + getFunctionCallerName());
	deleteDefaultObjects();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickAddDefaultObjects() {
	timit.showTime('start ' + getFunctionCallerName());

	for(const oid in G.table){
		let ms = makeDefaultObject(oid, G.table[oid], S.settings.present.object.defaultArea);
		presentDefault(oid, G.table[oid]);
		//addTestInteraction(ms);
	}
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickRemoveDefaultPlayers() {
	timit.showTime('start ' + getFunctionCallerName());
	deleteDefaultPlayers();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickAddDefaultPlayers() {
	timit.showTime('start ' + getFunctionCallerName());

	for(const oid in G.players){
		let ms = makeDefaultPlayer(oid, G.playersAugmented[oid], S.settings.present.player.defaultArea);
		presentDefault(oid, G.playersAugmented[oid],false);
		//addTestInteraction(ms);
	}
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickToggle(b, key) {
	let content = b.textContent;
	//console.log(content);
	let isOn = (content[0] == '-');
	if (isOn) {
		window['S_' + key] = false;
		b.textContent = '+' + content.substring(1);
	} else {
		window['S_' + key] = true;
		b.textContent = '-' + content.substring(1);
	}
	//console.log('toggle is now:', S_showEvents, b.textContent)
}














