var G, S, M, UIS, IdOwner, id2oids, id2uids, oid2ids;
var dHelp, counters, timit; //for testing
var DELETED_IDS=[];
var DELETED_THIS_ROUND=[];

//flow: 
// _mStart = prep => sendInit => process => setup => ||: gamestep = present => interact => sendAction => process :|| 
// interact can lead to _mStart (restart, loadGame, switchGame, gameOver)
function gameStep() {
	DELETED_THIS_ROUND=[];
	timit.showTime('start presentation!');

	presentTable();

	//timit.showTime('...objects presented!');
	presentPlayers();
	presentStatus();

	presentLog();
	if (G.end) { presentEnd(); return; }

	// timit.showTime('...log presented!');
	if (G.tupleGroups) {
		presentActions(); 
		timit.showTime('...presentation done!');
		startInteraction();	//...this will eventually end in sendAction>processData>gameStep
	}else presentWaitingFor();
}

//#region init
function initPlayers() {
	M.players = {};
	G.players = {};
	let colors = {
		red: '#D01013',
		blue: '#003399',
		green: '#58A813',
		orange: '#FF6600',
		yellow: '#FAD302',
		violet: '#55038C',
		pink: '#ED527A',
		beige: '#D99559',
		sky: '#049DD9',
		brown: '#A65F46',
	};
	let ckeys = Object.keys(colors);

	//match colors to better colors!
	let i = 0;
	for (const id in G.serverData.players) {
		let pl = G.serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : ckeys[i];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(colors[colorName]) ? colors[colorName] : colorName;
		//let name = isdef(pl.name) ? pl.name : isdef(pl.color) ? id : capitalize(colorName);
		M.players[id] = { user:G.gameInfo.userList[i], id: id, color: color, altName: altName, index: i };
		i += 1;
	}
}
function restartGame() { //just clear structures etc. and restart with same settings
	//TODO clear structures and data, sendInit, gameStep
}
function loadGame() { }
function saveGame() { }
function clearGame() { }
function clearAll() { }

