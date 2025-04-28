//#region all
function handleSet(x) {
	//console.log('handleSet')
	let irgend=x.map(exp);

	//soll list von list of actions returnen
	let res=stripSet(irgend);
	//console.log('set returns',res)
	return res;
	// //console.log(irgend)
	// //console.log(tsRec('irgend',irgend))
}
function multiCartesi(){
	//each arg is a list of list
	let arr = Array.from(arguments);
	if (arr.length > 2) {
		return cartesi(arr[0],stripSet(multiCartesi(...arr.slice(1))));
	}	else if (arr.length == 2) return cartesi(arr[0],arr[1]);
	else if (arr.length == 1) return arr[0];
	else return [];
}
function extractTuples(x){

	if (isList(x))
	if (isListOfListOfActions(x)) return x;
	return isList(x)&&x.length>0?stripSet(x[0]):x;
}
function stripSet(x){
	if (isListOfListOfActions(x)) return x;
	else if (isActionElement(x)) return [[x]];
	else if (isList(x) && isActionElement(x[0])) return [x];
	else return [].concat(...x.map(stripSet));
	//return isList(x)&&x.length>0?stripSet(x[0]):x;
}
function isListOfListOfActions(x){
	return isList(x) && x.length>0 && isList(x[0]) && x[0].length > 0 && isActionElement(x[0][0]);
}
function handleTuple(x) {
	//console.log('handleTuple')

	let irgend=x.map(exp);//console.log('irgend',tsRec(irgend))
	//supposedly, irgend contains lists of action elements
	//these should be combined via cartesian
	return multiCartesi(...irgend);
}

function handleAction(x) {
	return [[x]];
}
function expand1_99(x) {
	//console.log('input', tsRec(x))
	if (isDict(x)) {
		if ('_set' in x) {
			//console.log('handleSet wird aufgerufen')
			return handleSet(x._set);
		} else if ('_tuple' in x) {
			//console.log('handleTuple wird aufgerufen')
			return handleTuple(x._tuple);
		} else if ('type' in x) {
			return handleAction(x);
		} else { error('IMPOSSIBLE OBJECT', x); return null; }
	} else { error('IMPOSSIBLE TYPE', x); return null; }
}










//toString
function tsRec(x) {
	//console.log('input',x)
	if (isList(x)) { return '['+x.map(tsRec).join('')+']'; }
	if (isDict(x)) {
		if ('_set' in x) {
			return '{' + tsRec(x._set) + '}';
		} else if ('_tuple' in x) {
			return '(' + tsRec(x._tuple) + ')'
		} else if ('type' in x) {
			return tsAction(x)
		} else { return 'obj unknown'; }
	} else return 'type unknown';
}
function tsAction(x) {	if ('ID' in x) return x.ID; else return x.val;}




















//rest
function findPool(id) {
	if (G.players[id]) return G.playersAugmented;
	else if (G.table[id]) return G.table;
}

function getGamePlayer() {
	for (const k in G.playersAugmented) {
		o = G.playersAugmented[k];
		if (o.obj_type == 'GamePlayer') return o;
	}
}
function sysColor(iPalette, ipal) { return S.pals[iPalette][ipal]; }
function t2(act) {
	let res = [];
	for (const key in act) {
		let data = act[key].actions;
		//console.log('data', data);
		let e = exp(data);
		//console.log(e)
		res.push(e)
	}
	return res;
}


function t1() {
	let a1 = { type: 1 };
	let a2 = { type: 2 };
	let a3 = { type: 3 };
	let a = {
		tic: {
			actions:
			{
				_set:
					[{ _tuple: [{ _set: [a1, a2, a3] }] }]
			}
		}
	};
}
var cnt = 0;
function exp_dep(data) {
	//console.log('' + cnt + ": ", data); cnt += 1;
	if (isDict(data) && 'type' in data) {
		//console.log('returning', [data])
		return [data];
	}
	if (is_Set(data) && data._set.length == 1) {
		//console.log('returning', data._set[0])
		return exp(data._set[0]);
	}
	if (is_Set(data) && data._set.length > 1) {
		//console.log('returning', data._set.map(exp));
		return data._set.map(exp);
	}
	if (is_Tuple(data) && data._tuple.length == 1) {
		//console.log('returning', exp(data._tuple[0]))
		return exp(data._tuple[0]);
	}
	if (is_Tuple(data) && data._tuple.length > 1) data = data._tuple;
	if (isList(data) && empty(data)) return [];
	if (isList(data) && data.length == 1) return exp(data[0])
	if (isList(data)) {
		let a = exp(data[0]); //this is a list of tuples
		let rest = data.slice(1);
		let tlist = exp(rest);
		//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>returning', a, tlist, carteset(a, tlist))
		return carteset(a, tlist);

	}
}


function expand99(e) {
	let res = [];
	e = expand1_99(e);
	for (const el of e) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function isListOfActions(l) {
	return isList(l) && !empty(l) && isActionElement(l[0]);
}
function extractActionLists(lst) {
	//console.log(lst);
	let res = [];
	for (const l of lst) {
		if (isListOfActions(l)) res.push(l);
		else if (isActionElement(l)) res.push([l]);
		else {
			let r2 = extractActionLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
var exp = expand1_99;

function getTupleGroups() {
	let act = G.serverData.options;

	//console.log('options', act)
	// json_str = JSON.stringify(act);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], { type: "" }));

	let tupleGroups = [];
	for (const desc in act) {
		let tg = { desc: desc, tuples: [] };
		//let tuples = expand99(act[desc].actions);
		let tuples = exp(act[desc].actions);
		//console.log('*** ', desc, '........tuples:', tuples);

		if (tuples.length == 1 && !isList(tuples[0])) tuples = [tuples];
		//console.log(tuples)
		tg.tuples = tuples;
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	//console.log('tupleGroups', tupleGroups);
	return tupleGroups;
}


















function trash111() {
	let tgServer = G.serverData.tupleGroups;
	// let tupleGroups = [];
	for (const tg of tgServer) {
		let desc = tg.desc.line.toString();
		//console.log(tg, desc)
		let choices = tg.tuples._set; //an array of objects w/ key= '_tuple'
		let tuples = choices.map(x => x._tuple);
		//console.log(choices);
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	return tupleGroups;
}
function openTabTesting(cityName) {
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none';
	}
	tablinks = document.getElementsByClassName('tablinks');
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(' active', '');
	}
	document.getElementById('a_d_' + cityName).style.display = 'block';
	document.getElementById('c_b_' + cityName).className += ' active';
	//evt.currentTarget.className += ' active';
}
//non-essential functions, could deprecate
function _register(o, keyword, func) {
	if (nundef(S.registry[keyword])) S.registry[keyword] = {};
	S.registry[keyword][o.id] = func;
}
function _runRegistry(keyword) {
	if (nundef(S.registry[keyword])) return;
	for (const id in S.registry[keyword]) {
		S.registry[keyword][id](getVisual(id));
	}
}
function setBackgroundToPlayerColor() {
	//console.log(G.players, G.player);
	let c = G.playersAugmented[G.player].color;
	//setCSSVariable('--bgBody', c); //macht die gaps auf gesamten screen weiss, blau, rot
	// getVisual('a_d_game').setBg(c);
	//getVisual('a_d_game').setBg('transparent');
}
function toggleSettings(b, keyList, prefix, toggleList) {
	let options = S.settings;
	let val = lookup(options, keyList);
	let i = toggleList.indexOf(val);
	let newVal = toggleList[(i + 1) % toggleList.length];
	setKeys(options, keyList, newVal);
	b.textContent = prefix + newVal;

	if (keyList.includes('playMode')) initTableOptions(options.playMode);
}
function toggleTooltips(b) {
	if (S.settings.tooltips) {
		// deactivateTooltips();
		b.textContent = 'tooltips: OFF';
		S.settings.tooltips = false;
	} else {
		// activateTooltips();
		b.textContent = 'tooltips: ON';
		S.settings.tooltips = true;
	}
}
