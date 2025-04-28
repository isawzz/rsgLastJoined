//new interface
function _start(game = 'catan') {
	_hStart(game);
}
function _test(){
	//test tuples
	let o1 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "91", "val": "Corner[91]", "type": "obj" },
							{ "ID": "92", "val": "Corner[92]", "type": "obj" },
							{ "ID": "93", "val": "Corner[93]", "type": "obj" },
						]
					}
				]
			}
		]
	};
	let o3 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "1", "val": "Corner[1]", "type": "obj" },
							{ "ID": "2", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "3", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			}
		]
	};
	let o4 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "1", "val": "Corner[1]", "type": "obj" },
					{ "ID": "2", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "3", "val": "Corner[3]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "4", "val": "Corner[3]", "type": "obj" },
					{ "ID": "5", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o2 = {
		"_set": [
			{ "ID": "1", "val": "Corner[1]", "type": "obj" },
			{ "ID": "2", "val": "Corner[2]", "type": "obj" },
			{ "ID": "3", "val": "Corner[2]", "type": "obj" },
		]
	};
	let o5 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "1", "val": "Corner[1]", "type": "obj" },
							{ "ID": "2", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "3", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			},
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "4", "val": "Corner[1]", "type": "obj" },
							{ "ID": "5", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "6", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			}
		]
	};
	let o6 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "4", "val": "Corner[1]", "type": "obj" },
					{ "ID": "5", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "6", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o7 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "1", "val": "Corner[1]", "type": "obj" },
					{ "ID": "2", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "3", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o = o5;
	console.log('output', exp(o) ? tsRec(exp(o)) : 'undefined');
}












function _hStart(game = 'ttt') {
	prelims(game);

	timit.showTime('sending restart host');
	_sendRoute('/restart', d0 => {
		//console.log(d0);
		timit.showTime('sending game/available');
		_sendRoute('/game/available', d1 => {
			//console.log(d1, getTypeOf(d1));
			let x = JSON.parse("[" + "0,1,2" + "]"); //console.log(x)
			x = JSON.parse("[" + '"0","hallo2"' + "]"); //console.log(x)
			x = JSON.parse(d1);// console.log(x);
			timit.showTime('sending select game');
			_sendRoute('/game/select/' + game, d2 => {
				//console.log(d2, getTypeOf(d2));
				timit.showTime('sending game info');
				_sendRoute('/game/info/' + game, d4 => {
					//console.log(d4, getTypeOf(d4));
					G.gameInfo = JSON.parse(d4);
					let chain = [];
					let users = ['felix', 'amanda', 'lauren', 'anuj', 'tawzz', 'gul', 'vladimir', 'tom'];
					let i = 0;
					G.gameInfo.userList = [];
					for (const pl of G.gameInfo.player_names) {
						let cmd = '/add/player/' + users[i] + '/' + pl;
						G.gameInfo.userList.push(users[i]);
						i += 1;
						chain.push(cmd);
					}
					timit.showTime('sending player logins');
					chainSend(chain, d5 => {
						//console.log(d5);
						//console.log(G);
						timit.showTime('sending begin');
						_sendRoute('/begin/1', d6 => {
							//console.log(d6, 'type:', typeof d6);
							let user = G.gameInfo.userList[0];
							timit.showTime('sending status');
							_sendRoute('/status/' + user, d7 => {
								//console.log(d7, 'type:', typeof d7);
								let data = JSON.parse(d7);
								//console.log(data);
								timit.showTime('start processing');
								processData(data);
								specAndDOM([gameStep]);
							});
						});
					});
				});
			});
		});
	});
}
function chainSend(msgChain, callback) {
	let akku = [];
	this.chainSendRec(akku, msgChain, callback);
}
function chainSendRec(akku, msgChain, callback) {
	if (msgChain.length > 0) {
		//console.log('sending:', msgChain[0]);
		_sendRoute(msgChain[0], d => {
			//console.log('received:', d)
			akku.push(d);
			this.chainSendRec(akku, msgChain.slice(1), callback)
		});
	} else {
		//console.log(akku);
		callback(akku);
	}
}



function prelims(game) {
	if (isdef(game)) S_startGame = game; //see settings.js
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };

	let firstTime = nundef(G);//test code
	if (isdef(G)) { _mClear(); S.settings.game = game; }
	else { S = { path: {}, user: {}, settings: {} }; setDefaultSettings(); }

	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();
	DELETED_IDS = [];

	G = { table: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	M = {};

}




//old interface
function _mStart(game) {

	if (isdef(game)) S_startGame = game; //see settings.js
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };

	let firstTime = nundef(G);//test code
	if (isdef(G)) { _mClear(); S.settings.game = game; }
	else { S = { path: {}, user: {}, settings: {} }; setDefaultSettings(); }

	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();
	DELETED_IDS = [];

	G = { table: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	M = {};

	//console.log('firstTime',firstTime,'UIS', UIS);
	//if (!firstTime) return; //testing clear


	//aufbau von structs.... mit spec und server data
	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInit, specAndDOM, gameStep]); else sendInit([specAndDOM, gameStep]);

}

