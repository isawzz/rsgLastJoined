function loadUserSpec(callbacks = []) {
	timit.showTime(getFunctionCallerName());
	S.path.spec = '/examples_front/' + S.settings.game + '/' + S.settings.game + '_ui.yaml';
	loadYML(S.path.spec, dSpec => {
		S.user.spec = dSpec;
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}
function loadUserCode(callbacks = []) {
	timit.showTime(getFunctionCallerName());
	S.path.script = '/examples_front/' + S.settings.game + '/' + S.settings.game + '_ui.js';
	loadScript(S.path.script, dScript => {
		loadText(S.path.script, code => {
			S.user.script = code;
			//console.log(code);
			if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	});
}
function sendInit(callbacks = []) {
	timit.timeStamp('send');
	_serverGet('init', { game: S.settings.game }, data => {
		processData(data);
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}
function sendAction(boat, callbacks = []) {
	timit.timeStamp('send');
	_serverGet('action', { iTuple: boat.iTuple }, data => {
		//console.log(data)
		processData(data);
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}

function _serverGet(cmd, { game = 'catan', iTuple = 0 }, callback) {
	counters.msg += 1;
	let url = SERVER_URL + (cmd == 'init' ? 'init/' + game : cmd == 'action' ? 'action/' + G.player + '/' + iTuple : 'status/' + G.player);
	//console.log(counters.msg + ': request sent: ' + url);

	$.ajax({
		url: url,
		type: 'GET',
		success: response => {
			//console.log('server:', response.substring(0, 200));
			if (response[0] != '{') {
				error('server response is NOT JSON string!!!... transforming...');
				if (callback) callback(JSON.parse('{"response":"' + response + '"}'));
			} else {
				//console.log(response);
				let data = JSON.parse(response);
				if ('error' in data) {
					error(data);
					alert(JSON.stringify(data.error));
				} else {
					if (callback) callback(data);
				}
			}
		},
		error: err => {
			error(err);
			alert(err);
		},
	});
}

//new host

function pickStringForAction(x){
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}
function sendAction_NotYet(boat, callbacks = []) {
	timit.timeStamp('send');
	let pl = G.playersAugmented[G.player];
	let route = '/action/'+pl.user+'/'+G.serverData.key+'/'+boat.desc+'/';
	let t=boat.tuple;
	//console.log('tuple is:',t);

	_sendRoute(route+t.map(x=>pickStringForAction(x)).join('+'), data => {
		//console.log(data)
		data = JSON.parse(data)
		processData(data);
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}

function _sendRoute(route, callback) {
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	//console.log(counters.msg + ': request sent: ' + url);

	$.ajax({
		url: url,
		type: 'GET',
		success: response => { 
			try{
				let js=JSON.parse(response);
				if (js.error){
					//alert('GSM ERROR MESSAGE: '+js.error.msg);
					console.log(js.error.msg)
				}
			}catch{
				//console.log('NOT JSON: ',response);
			}
			if (callback) callback(response);  },
		error: err => { error(err); alert(err); },
	});
}
