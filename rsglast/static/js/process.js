//convert data to various objects in G and M >pre-UI processing
function processData(data) {
	// timit.showSince('send', 'processData');
	timit.showTime('start processing!');
	G.serverData = data;

	processTable(data);
	// timit.showTime('...objects up to date!');
	processPlayers(data);
	// timit.showTime('...players up to date!');

	// processStatus(); //nothing to do
	processLog(data);

	if (processEnd(data)) return; //no more actions or waiting_for!

	if (!processActions(data)) processWaitingFor();

	// timit.showTime('...processing done!');

}
function processTable(data) {
	if (!G.table) G.table = {};
	G.tableCreated = [];
	G.tableRemoved = [];
	G.tableUpdated = {}; //updated also has prop change info

	if (data.table) {
		let allkeys = union(Object.keys(G.table), Object.keys(data.table));
		for (id of allkeys) {
			let o_new = id in data.table ? data.table[id] : null;
			let o_old = id in G.table ? G.table[id] : null;
			let changes = propDiffSimple(o_old, o_new); //TODO: could add prop filter here already!!!
			if (changes.hasChanged) {
				G.tableUpdated[id] = changes;
				if (nundef(o_old)) {
					G.tableCreated.push(id);
				} else if (nundef(o_new)) {
					G.tableRemoved.push(id);
				}
			}
		}
		G.table = data.table;
	}
}
function processPlayers(data) {
	//should also process player change!!!
	if (!M.players) initPlayers(); //adding additional player info for RSG! such as index,id,altName,color
	G.playersCreated = [];
	G.playersRemoved = [];
	G.playersUpdated = {}; //updated also has prop change info

	G.previousPlayer = G.player;
	delete G.playerChanged;
	if (data.players) {
		let plkeys = union(Object.keys(G.players), Object.keys(data.players));
		for (id of plkeys) {
			let pl_new = id in data.players ? data.players[id] : null;
			let pl_old = id in G.players ? G.players[id] : null;
			let changes = propDiffSimple(pl_old, pl_new); //TODO: could add prop filter here already!!!
			if (changes.hasChanged) {
				G.playersUpdated[id] = changes;
				if (nundef(pl_old)) {
					G.playersCreated.push(id);
				} else if (nundef(pl_new)) {
					G.playersRemoved.push(id);
				}
			}
			if (pl_new.obj_type == 'GamePlayer') {
				if (id != G.previousPlayer) G.playerChanged = true;
				G.player = id;
				G.playerIndex = M.players[id].index;
			}
		}

		//TODO: if players are created or removed during game, reflect in M.players!!! (for now, just assume player ids/# doesn't change)

		//augment player data
		G.players = data.players;
		G.playersAugmented = jsCopy(G.players);		//compute augmented players for convenience
		for (const pl in G.players) {
			G.playersAugmented[pl].color = M.players[pl].color;
			G.playersAugmented[pl].altName = M.players[pl].altName; //probier es aus!
			G.playersAugmented[pl].id = pl; //probier es aus!
			G.playersAugmented[pl].index = M.players[pl].index; //probier es aus!
			G.playersAugmented[pl].user = M.players[pl].user; //probier es aus!
		}
	}
}
function processLog(data) {
	if (!G.log) G.log = {}; //S.log contains all logs for game!
	G.logUpdated = []; //keys to new logs
	if (isdef(data.log)) {
		for (const logEntry of data.log) {
			//save this log so it isnt created multiple times!!!
			let key = logEntry.line.map(x => isSimple(x) ? x : x.val).join(' ');
			if (G.log[key]) continue;
			G.log[key] = logEntry;
			G.logUpdated.push(key);
		}
	}
}
function processEnd(data) {
	G.end=data.end; return G.end;
}
function processActions(data) {
	if (nundef(G.serverData.options)) {G.tupleGroups = null; return false;}

	G.tupleGroups = getTupleGroups();
	return true;
}
function processWaitingFor() {
	if (nundef(G.serverData.waiting_for)) {
		error('No options AND No waiting_for data!!!!!!!!!!');
		return;
	}

	//console.log('change player to ',G.serverData.waiting_for[0]);
	//error('Missed player change!'); //TODO: geht nur 1 action + fixed player order
}
