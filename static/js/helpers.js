//#region transfered to helpersNew!
function anyColorToStandardString(cAny, a, allowHsl = false) {
	//if allowHsl is false: only return rgb,rgba,or hex7,hex9 string! >pBSC algo!!!
	//if a is undefined, leaves a as it is in cAny, otherwise modifies to a
	if (Array.isArray(cAny)) {
		// cAny is rgb array
		if (cAny.length < 3) {
			return randomHexColor();
		} else if (cAny.length == 3) {
			//assume this is a rgb
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		}
	} else if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			//this is rbg or rgba string
			if (cAny[3] == 'a') {
				//rgba string!
				console.log('its an rgba string!!!!!');
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				// simple rgb string
				if (a < 1) {
					//console.log(cAny.length)
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			//hsl or hsla string
			//if hsla and hsla allowed do same as for rgba
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					//simple hsl string
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')'; //cAny.substring(0,cAny.length-1) + ',' + a + ')';
				}
			} else {
				//convert hsl(a) into rgb(a)
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return anyColorToStandardString(cAny, a, allowHsl);
			}
		} else {
			//cAny is color name
			let newcAny = colorNameToHex(cAny);
			//console.log(cAny,newcAny);
			return anyColorToStandardString(newcAny, a, allowHsl);
		}
	} else if (typeof cAny == 'object') {
		//console.log('anyColorToStandardString: cAny is object!!!', cAny);
		//koennte {h: ,s: , l:} oder {r: ,g: ,b:} sein
		if ('h' in cAny) {
			//hsl object
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return anyColorToStandardString(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			//rgb object
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
} //ok
function colorPalShade(color) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function setCSSVariable(varName, val) {
	let root = document.documentElement;
	root.style.setProperty(varName, val);
}


//#region _HACKS and fieldSorter!!!
function hackPhaseAndPlayerTest(msg) {
	testHelpers(msg);
	let res = stringAfterLast(msg, 'Beginning ');
	let phase = stringBefore(res, ' ');
	testHelpers(res, 'phase=' + phase);
	let res1 = stringAfter(res, '<br>');
	let player = stringBefore(res1, ' ');
	testHelpers(res1, 'player=' + player);
}
const fieldSorter = fields => (a, b) =>
	fields
		.map(o => {
			let dir = 1;
			if (o[0] === '-') {
				dir = -1;
				o = o.substring(1);
			}
			return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
		})
		.reduce((p, n) => (p ? p : n), 0);

function wlog() {
	let s = '';
	for (const a of arguments) {
		s += a + ' ';
	}
	console.log(s);
}



//the following will be dep
var UIDHelpers = 0;
function uidHelpers() {
	UIDHelpers += 1;
	return 'id' + UIDHelpers;
}
var NAMED_UIDS = {};
function getNamedUID(name) {
	if (!(name in NAMED_UIDS)) {
		NAMED_UIDS[name] = 0;
	}
	NAMED_UIDS[name] += 1;
	// return name[0]+'_'+NAMED_UIDS[name];
	return name[0] + NAMED_UIDS[name];
}
function getNamedUID(name) {
	if (!(name in NAMED_UIDS)) {
		NAMED_UIDS[name] = 0;
	}
	NAMED_UIDS[name] += 1;
	// return name[0]+'_'+NAMED_UIDS[name];
	return name[0] + NAMED_UIDS[name];
}
class TimeIt {
	constructor(msg) {
		this.init(msg);
		this.showOutput = true;
	}
	tacit() { this.showOutput = false; }
	timeStamp(name) {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.namedTimestamps.start.getTime();// this.t.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs * to', name);
		this.t = tNew;
		this.namedTimestamps[name] = tNew;
	}
	init(msg) {
		this.t = new Date(); //new Date().getTime();
		if (this.showOutput) console.log('___', msg);
		this.namedTimestamps = { start: this.t };
	}
	showSince(name, msg = 'now') {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tNamed = this.namedTimestamps[name];
		if (this.showOutput) if (!tNamed) { console.log(name, 'is not a timestamp!'); return; } //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - tNamed.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs', name, 'to', msg);
		this.t = tNew;
	}
	format(t) { return '___' + t.getSeconds() + ':' + t.getMilliseconds(); }
	showTime(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		if (this.showOutput) console.log(this.format(tNew), ':', tDiff, 'msecs to', msg, '(' + tDiffStart, 'total)');
		this.t = tNew;
	}
	start_of_cycle(msg) {
		this.init(msg);
	}
	end_of_cycle(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		if (this.showOutput) console.log('___ ' + tDiff + ' msecs', msg, 'to EOC (total: ' + tDiffStart + ')');
	}
}

class Counter extends Map {
	//usage:
	// results = new Counter([1, 2, 3, 1, 2, 3, 1, 2, 2]);
	// for (let [number, times] of results.entries()) //console.log('%s occurs %s times', number, times);
	// people = [
	// 		{name: 'Mary', gender: 'girl'},
	// 		{name: 'John', gender: 'boy'},
	// 		{name: 'Lisa', gender: 'girl'},
	// 		{name: 'Bill', gender: 'boy'},
	// 		{name: 'Maklatura', gender: 'girl'}
	// ];
	// byGender = new Counter(people, x => x.gender);
	// for (let g of ['boy', 'girl']) //console.log("there are %s %ss", byGender.get(g), g);

	//count objects with 2 conditions: objects of same type, same owner:
	// byType = new Counter(b.fire_order, x => x.unit.type+'_'+x.owner);
	// for (let g of cartesian(brep.allUnitTypes,brep.factions)) //console.log("there are %s %s", byType.get(g), g);

	constructor(iter, key = null) {
		super();
		this.key = key || (x => x);
		for (let x of iter) {
			this.add(x);
		}
	}
	add(x) {
		x = this.key(x);
		this.set(x, (this.get(x) || 0) + 1);
	}
}
class UniqueIdEngine {
	constructor() {
		this.next = -1;
	}
	get() {
		this.next += 1;
		return 'a###' + this.next;
		this.next += 1;
	}
}
var uniqueIdEngine = new UniqueIdEngine();
function getItemWithMaxValue(d) {
	let k = Object.keys(d).reduce((a, b) => (d[a] >= d[b] ? a : b));
	return [k, d[k]];
}
function getItemWithMax(d, propName) {
	testHelpers('getItemWithMax dict:', d, 'propName:', propName);
	let max = 0;
	let kmax = null;
	for (const key in d) {
		let val = d[key][propName];
		if (val > max) {
			max = val;
			kmax = key;
		}
	}
	return [kmax, d[kmax], max];
}

function executeFunctionByName(functionName, context /*, args */) {
	//usage: executeFunctionByName("My.Namespace.functionName", window, arguments);
	//simpler way to do this: window["foo"](arg1, arg2);
	var args = Array.prototype.slice.call(arguments, 2);
	var namespaces = functionName.split('.');
	var func = namespaces.pop();
	for (var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(context, args);
}
//#endregion HACKS


// def _expand_actions(code):
// 	if isinstance(code, set) and len(code) == 1:
// 		return _expand_actions(next(iter(code)))
	
// 	if isinstance(code, dict) or isinstance(code, ActionElement) or isinstance(code, str) or isinstance(code, int):
// 		return [code]
	
// 	# tuple case
// 	if isinstance(code, (tuple, list)):
// 		return list(product(*map(_expand_actions, code)))
// 	if isinstance(code, set):
// 		return chain(*map(_expand_actions, code))
// 	return code
// def _flatten(bla):
// 	output = ()
// 	for item in bla:
// 		output += _flatten(item) if isinstance(item, (tuple, list)) else (item,)
// 	return output
// def decode_action_set(code):
// 	code = _expand_actions(code)
// 	return tset(map(_flatten, code))



//#region array helpers
function addAll(akku, other) {
	for (const el of other) {
		akku.push(el);
	}
	return akku;
}
function addIfComma(csv, arr) {
	let strings = csv.split(',');
	for (const s of strings) {
		addIf_dep(s.trim(), arr);
	}
}
function addIf(arr, el) {
	if (!arr.includes(el)) arr.push(el);
}
function removeIf(arr, el) { removeInPlace(arr, el); }
function addIf_dep(el, arr) {
	if (!arr.includes(el)) arr.push(el);
}
function addIfDict(key, val, dict) {
	if (!(key in dict)) {
		dict[key] = [val];
	} else {
		addIf_dep(val, dict[key]);
	}
}
function arrCreate(n, func) {
	//creates an array and init
	let res = [];
	for (let i = 0; i < n; i++) {
		res.push(func(i));
	}
	return res;
}
function arrFromIndex(arr, i) {
	return arr.slice(i);
}
function arrMinus(a, b) {
	let res = a.filter(x => !b.includes(x));
	return res;
}
function arrMax(arr) {
	return arr.reduce((m, n) => Math.max(m, n));
}
function arrMin(arr) {
	return arr.reduce((m, n) => Math.min(m, n));
}
function arrReplace(arr, oldval, newval) {
	let i = arr.indexOf(oldval);
	if (i >= 0) arr[i] = newval;
	return oldval;
}
function any(arr, cond) {
	return !empty(arr.filter(cond));
}
function anyStartsWith(arr, prefix) {
	return any(arr, el => startsWith(el, prefix));
}
function carteset(l1, l2) {
	//l1,l2 are lists of list
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			//if (isll(el2)) el2=el2.flat();
			if (isList(el1)) res.push(el1.concat(el2));
			else res.push([el1].concat(el2));
		}
	}
	return res;
}
function cartesian(s1, s2, sep = '_') {
	let res = [];
	for (const el1 of s1) {
		for (const el2 of s2) {
			res.push(el1 + '_' + el2);
		}
	}
	return res;
}
function cartesianOf(ll) {
	// like a branchlist in MTree
	let cart = ll[0];
	for (let i = 1; i < ll.length; i++) {
		cart = cartesian(cart, ll[i]);
	}
	return cart;
}
function chooseRandom(arr) {
	return chooseRandomElement(arr);
}
function chooseRandomElement(arr, condFunc = null) {
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!empty(best)) return chooseRandomElement(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function chooseDeterministicOrRandom(n, arr, condFunc = null) {
	if (n < 0) return chooseRandomElement(arr, condFunc);

	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!empty(best)) return best[n % best.length];
	}
	return arr[n % arr.length];
}
function choose(arr, n) {
	//console.log(arr, n);
	var result = new Array(n);
	var len = arr.length;
	var taken = new Array(len);
	//console.log('len', len);
	if (n > len) n = len - 1; // throw new RangeError('getRandom: more elements taken than available');
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}
function contains(arr, el) {
	return arr.includes(el);
}
function containsAny(arr, lst) {
	//console.log('containsAny',arr,lst)
	for (const x of lst) {
		if (arr.includes(x)) {
			//console.log('containsAny YES!',x,arr);
			return true;
		}
	}
	return false;
}
function containsAll(arr, lst) {
	for (const el of lst) {
		if (!arr.includes(el)) return false;
	}
	return true;
}
function containsSet(arr, lst) {
	return containsAll(arr, lst);
}
function containedInAny(el, ll) {
	// any list in ll contains element el
	for (const lst of ll) {
		if (lst.includes(el)) return true;
	}
	return false;
}
function empty(arr) {
	//if (typeof(arr) == 'object') return arr.length == 0; //Object.entries(arr).length === 0;
	let result = arr === undefined || !arr || (isString(arr) && (arr == 'undefined' || arr == '')) || (Array.isArray(arr) && arr.length == 0) || emptyDict(arr);
	testHelpers(typeof arr, result ? 'EMPTY' : arr);
	return result;
}
function emptyDict(obj) {
	let test = Object.entries(obj).length === 0 && obj.constructor === Object;
	return test;
}
function first(arr) {
	return arr.length > 0 ? arr[0] : null;
}
function firstCond(arr, func) {
	//return first elem that fulfills condition
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;
	}
	return null;
}
function firstCond_super_inefficient(arr, func) {
	//return first elem that fulfills condition
	let res = arr.filter(x => func(x));
	return res.length > 0 ? res[0] : null;
}
function findFirst(arr, attr, val) {
	let matches = arr.filter(x => attr in x && x[attr] == val);
	return empty(matches) ? null : matches[0];
}
function findSameSet(llst, lst) {
	// returns element of llst that has same elements as lst, even if different order
	for (const l of llst) {
		if (sameList(l, lst)) return l;
	}
	return null;
}
function fj(x) {
	return formatjson(x);
}
function formatll(ll) {
	//return beautiful string for list of lists
	//ensure this is a list of lists
	if (!isll(ll)) return 'NOT list of lists!';
	let s = '[';
	for (const l of ll) {
		let content = isllPlus(l) ? formatll(l) : l.toString();
		s += '[' + content + ']';
	}
	s += ']';
	testHelpers(s);
}
function formatjson(j) {
	//return beautiful small json
	let s = JSON.stringify(j);
	s = s.replace(/\s/g, '');
	return s;
}
function indexOfMax(arr, prop) {
	let max = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		if (prop) {
			//console.log(i,v[prop])
			if (max == null || v[prop] > max) {
				//console.log(max,lookup(v, [prop]))
				max = v[prop];
				imax = i;
			} else {
				if (max == null || v > max) {
					max = v;
					imax = i;
				}
			}
		}
	}
	return { i: imax, val: max };
}
function indexOfMin(arr, prop) {
	let min = null;
	let imin = null;
	for (const [i, v] of arr.entries()) {
		if (prop) {
			if (min == null || lookup(v, [prop]) < min) {
				//console.log(min,lookup(v, [prop]))
				min = v[prop];
				imin = i;
			}
		} else {
			if (min == null || v < min) {
				min = v;
				imin = i;
			}
		}
	}
	return { i: imin, val: min };
}
function getMissingIndices(arr, len) {
	let i = 0;
	let a = arr[i];
	let j = 0;
	let res = [];
	while (j < len) {
		while (j < a) {
			testHelpers(j, a, 'adding j');
			res.push(j);
			j += 1;
		}
		i += 1;
		j = a + 1;
		a = i < arr.length ? arr[i] : len;
	}
	return res;
}
function getListsContainingAll(ll, l) {
	let res = [];
	for (const l1 of ll) {
		if (containsAll(l1, l)) res.push(l1);
	}
	return res;
}
function intersection(arr1, arr2) {
	//each el in result will be unique
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf_dep(a, res);
		}
	}
	return res;
}
function isEmpty(arr) {
	return empty(arr);
}
function isList(arr) {
	return Array.isArray(arr);
}
function isll(ll) {
	//true if arr is a list of lists of strings
	if (!isList(ll)) {
		testHelpers('NOT a list', ll);
		return false;
	}
	for (const l of ll) {
		if (!isList(l)) {
			testHelpers('element', l, 'NOT a list!');
			return false;
		}
		for (const el of l) {
			if (!isString(el) && !isNumeric(el)) return false;
		}
	}
	return true;
}
function isllPlus(ll) {
	//true if arr is a list of lists
	if (!isList(ll)) {
		testHelpers('NOT a list', ll);
		return false;
	}
	for (const l of ll) {
		if (!isList(l)) {
			testHelpers('element', l, 'NOT a list!');
			return false;
		}
	}
	return true;
}
function keepOnlyElements(func, lst) {
	return lst.filter(func);
}
function dropLast(s){return s.substring(0,s.length-1);}
function last(arr) {
	return arr.length > 0 ? arr[arr.length - 1] : null;
}
function lastCond(arr, func) {
	//return first elem that fulfills condition
	for (let i = arr.length - 1; i >= 0; i--) {
		if (func(arr[i])) return arr[i];
	}

	return null;
}
function firstCondDict(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(dict[k])) return k; }
	return null;
}
function lastCondDictPlusKey(dict, func) {
	//return first elem that fulfills condition
	let keys = Object.keys(dict);
	for (let i = keys.length - 1; i >= 0; i--) {
		let key = keys[i];
		if (func(dict[key])) return [key, dict[key]];
	}

	return null;
}
function orderFromTo(lst, fromOrder, toOrder) {
	let res = [];
	for (let i = 0; i < lst.length; i++) {
		res.push(lst[fromOrder.indexOf(toOrder[i])]);
	}
	testHelpers(res);
	return res;
}
function prjstart(j) {
	//console.log('______', formatjson(j));
}
function prj(j) {
	//console.log(formatjson(j));
}
function pr(x) {
	//console.log(prlist(x).replace(/,,/g, ','));
}
function prll(ll) {
	//ensure this is a list of lists
	if (!isList(ll)) {
		testHelpers('NOT a list', ll);
		return;
	}
	for (const l of ll) {
		if (!isList(ll)) {
			//console.log('element', l, 'NOT a list!');
			return;
		}
	}
	let s = '[';
	for (const l of ll) {
		s += '[' + l.toString() + ']';
	}
	s += ']';
	testHelpers(s);
}
function prlist(arr) {
	if (isList(arr)) {
		if (isEmpty(arr)) return '';
		else return '[' + prlist(arr[0]) + arr.slice(1).map(x => ',' + prlist(x)) + ']';
	} else return arr;
}
function removeByProp(arr, prop, val) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i][prop] === val) {
			arr.splice(i, 1);
			i--;
			return;
		}
	}
}
function removeInPlace(arr, el) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === el) {
			arr.splice(i, 1);
			i--;
			return;
		}
	}
}
function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
function someFunction() {
	testHelpers('hhhhhhhhhhhhhhhhhhhhhhhhhhh');
}
//shallow: only good for lists of simple elements!!!!!
function sameList(l1, l2) {
	// compares 2 lists of strings if have same strings in it
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function uniqueFirstLetters(arr) {
	let res = [];
	for (const s of arr) {
		if (s.length > 0) {
			addIf_dep(s[0], res);
		}
	}
	return res;
}
function without(arr, elementToRemove) {
	return arr.filter(function (el) {
		return el !== elementToRemove;
	});
}

//#endregion array helpers

//#region 2d array helpers
function arr2Set(arr2d, func) {
	//assumes all entries are objects or null
	//console.log(arr2d,func)
	for (let i = 0; i < arr2d.length; i++) {
		for (let j = 0; j < arr2d[i].length; j++) {
			let o = arr2d[i][j];
			if (typeof o == 'object') {
				func(o, i, j);
			}
		}
	}
}
//#endregion

//#region color helpers: NEW!
var colorDict = null; //for color names, initialized when calling anyColorToStandardStyle first time
var palDict = {};
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.substr(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	//console.log('alpha from', zero1, 'to', hex);
	return hex;
} //ok
function colorBlend(zero1, c0, c1, log = true) {
	c0 = anyColorToStandardString(c0);
	c1 = anyColorToStandardString(c1);
	return pSBC(zero1, c0, c1, log);
} //ok
function colorShade(plusMinus1, color, log = true) {
	c = anyColorToStandardString(color);
	return pSBC(plusMinus1, c, undefined, !log);
} //ok
function colorTrans(cAny, alpha = 0.5) {
	return anyColorToStandardString(cAny, alpha);
}
function colorMellow(c, zero1 = .3, factorLum = .5) {
	hsl = colorHSL(c, true);
	let res = colorFromHue(hsl.h, zero1, hsl.l * factorLum);
	return res;
}
function colorLighter(c, zero1 = .2, log = true) {
	c = anyColorToStandardString(c);
	return pSBC(zero1, c, undefined, !log);
} //ok
function colorDarker(c, zero1 = 2, log = true) {
	//1 is darkest,0 is orig color
	c = anyColorToStandardString(c);
	return pSBC(-zero1, c, undefined, !log);
} //ok
function colorHex(cAny) {
	//returns hex string w/ alpha channel or without
	let c = anyColorToStandardString(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		//it is now an rgba string and has alpha
		let res = pSBC(0, c, 'c');
		//console.log('in colorHex!!!!', c, res);
		return res;
	}
} //ok
//slightly less efficient than colorHex (which uses pBSC!)
function colorHex_RGBAToHex9(cAny) {
	//returns hex string w/ alpha channel or without
	let c = anyColorToStandardString(cAny);
	//console.log(c);
	if (c[0] == '#') {
		return c;
	} else if (c[3] == '(') {
		//c is simple rgb string
		return RGBToHex7(c);
	} else {
		//it is now an rgba string and has alpha
		//console.log('RGBAToHex9');
		let res = RGBAToHex9(c);
		//console.log('in colorHex_RGBAToHex9!!!!', c, res);
		return res;
	}
} //ok
function colorHSL(cAny, asObject = false) {
	//returns { h:[0,360], s:[0,1], l:[0,1]}
	let res = anyColorToStandardString(cAny, undefined, true);
	//console.log(res)
	let shsl = res;
	if (res[0] == '#') {
		//res is a hex string
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	//console.log(shsl);
	let n = allNumbers(shsl);
	//console.log(n);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
} //ok
function colorHue(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.h;
} //ok
function colorLum(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.l;
} //ok
function colorSat(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.s;
} //ok
function colorA(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.a;
} //ok
function colorR(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.r;
} //ok
function colorG(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.g;
} //ok
function colorB(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.b;
} //ok
function colorRGB(cAny, asObject = false) {
	//returns { r:[0,255], g:[0,255], b:[0,255]}
	let res = anyColorToStandardString(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	//console.log(shsl);
	let n = allNumbers(srgb);
	//console.log(n);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
} //ok
function colorNameToHex(cName) {
	let key = cName.toLowerCase();
	if (!colorDict) {
		colorDict = {};
		let names = getColorNames();
		let hexes = getColorHexes();
		for (let i = 0; i < names.length; i++) {
			colorDict[names[i].toLowerCase()] = '#' + hexes[i];
		}
	}
	return key in colorDict ? colorDict[key] : randomHexColor();
} //ok
function colorPalBlend(c1, c2) {
	//assumes pSBC compatible color format (hex,rgb strings)
	//if not want this assumption, use colorBlend / sSBC
	let res = [];
	for (let frac = 0.1; frac <= 0.9; frac += 0.1) {
		//console.log(frac)
		let c = pSBC(frac, c1, c2, true); //colorBlend(frac,c1,c2);
		res.push(c);
	}
	return res;
}
function colorPalette(ch1, { ch2, lum = 50, sat = 100, a } = {}) {
	//console.log('colorPalette');
	//ch1,ch2 cAny or [0,360], lum,sat in percent, a in [0,1]
	//if ch1 is undefined, select random hue!
	//palette sorted from dark to light,
	//hue wheel counter clockwise: 0=red,60=yellow,120=green,180=cyan,240=blue,300=magenta
	let hue1 = ch1 == undefined ? randomNumber(0, 360) : isNumber(ch1) ? (ch1 + 360) % 360 : null;
	if (hue1) {
		//build palette from hue1, using sat, possibly also hue2 und a
		if (a == undefined) {
			a = 1;
		}
		if (isNumber(ch2)) {
			let c1 = `hsla({${hue1},${sat}%,${lum}%,${a})`;
			let c2 = `hsla({${ch2},${sat}%,${lum}%,${a})`;
			return colorPalBlend(c1, c2);
		} else {
			return colorPalShade(hue1, sat, a);
		}
	} else {
		//assume cAny and build palette from color disregarding sat,hue2
		let c1 = anyColorToStandardString(ch1, a);
		if (ch2 !== undefined) {
			let c2 = anyColorToStandardString(ch2, a);
			return colorPalBlend(c1, c2);
		} else {
			return colorPalShade(c1);
		}
	}
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	//jetzt ist bg rgb object
	const nThreshold = 105; //40; //105;
	r = rgb.r;
	g = rgb.g;
	b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
	// return 'white';
}
function colorAreasRandomBlend(areaClass = 'area', root = 'root') {
	let c1 = randomColor();
	let c2 = randomColor();
	colorAreasBlend(c1, c2, areaClass, root);
}
function colorFromHue(h, s = 100, l = 50, asObject = false) {
	if (asObject) return { h: h, s: s, l: l }; else return `hsl(${h},${s},${l})`;
}
function colorAreasOppositesBlend(hue = 120, areaClass = 'area', root = 'root') {
	let hueOpp = (hue + 180) % 360;
	let c1 = colorFromHue(hue);
	let c2 = colorFromHue(hueOpp);
	//console.log(c1,c2)

	colorAreasBlend(c1, c2, areaClass, root);
}
function colorAreasBlend(c1, c2, areaClass = 'area', root = 'root') {
	//console.log('colorAreasBlend');
	//returns palettes[hue][darkness] (c1 first,darkest first)
	c1 = anyColorToStandardString(c1);
	c2 = anyColorToStandardString(c2);
	let pb = colorPalBlend(c1, c2);
	let pals = [];
	for (const c of pb) {
		let pal = colorPalShade(c);
		pals.push(pal);
	}
	//console.log(pals)

	let ihue = 0;
	let idarkness = 1; //darkest reserved for buttons and bg main

	setCSSButtonColors(pals, 0);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(root);
	grid.style.backgroundColor = pals[pals.length - 1][0];
	for (const a of areas) {
		let bg = (a.style.backgroundColor = pals[ihue][idarkness]);
		a.style.color = colorIdealText(bg);
		idarkness += 1;
		//do NOT use lightest colors (want white foreground!)
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 4) % pals.length;
		//console.log(ihue,idarkness)
		//if (idx % pals[0].length == 0) ihue = (ihue + 1) % pals[0].length;
	}
	return pals;
}
function colorAreas_dep(hue0 = 260, nHues = 25, areaClass = 'area', root = 'root') {
	//console.log('colorAreas');
	//returns palettes[hue][darkness] (c1 first,darkest first)

	//console.log('palette:', hue0, nHues);
	let hue1 = nHues;
	let hues = [hue0, hue1];

	//foreach huer make palette shade
	let pals = [];
	for (const hue of hues) {
		let c = anyColorToStandardString(colorFromHue(hue));
		let pal = colorPalShade(c);
		//console.log(pal)
		pals.push(pal);
	}
	//console.log(pals);

	let ihue = 0;
	let idarkness = 1; //darkest reserved for buttons and bg main

	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(root);
	//grid.style.backgroundColor = '#2196f3'; // pals[pals.length - 1][2];
	let areaColors = {};
	for (const a of areas) {
		let bg = (a.style.backgroundColor = pals[ihue][idarkness]);
		a.style.color = colorIdealText(bg);
		//unitTestPalette('colorAreas', a.id, bg, ihue, idarkness, a.style.color);
		areaColors[a.id] = { bg: bg, fg: a.style.color, ihue: ihue, idarkness: idarkness };
		idarkness += 1;
		//do NOT use lightest colors (want white foreground!)
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 1) % pals.length;
		//console.log(ihue,idarkness)
		//if (idx % pals[0].length == 0) ihue = (ihue + 1) % pals[0].length;
	}
	return { hue0: hue0, nHues: nHues, pals: pals, mode: 'shades', areaColors: areaColors };
}
function colorAreasN(hue0 = 120, nHues = 25, areaClass = 'area', root = 'root') {
	//console.log('colorAreas');
	//returns palettes[hue][darkness] (c1 first,darkest first)

	//console.log('palette:',hue0,nHues)

	let hues = [];
	let hueDiff = Math.round(360 / nHues);
	let h = hue0;
	for (let i = 0; i < nHues; i++) {
		hues.push(h);
		h += hueDiff;
	}

	//foreach huer make palette shade
	let pals = [];
	for (const hue of hues) {
		let c = anyColorToStandardString(colorFromHue(hue));
		let pal = colorPalShade(c);
		//console.log(pal)
		pals.push(pal);
	}
	//console.log(pals);

	let ihue = 0;
	let idarkness = 1; //darkest reserved for buttons and bg main

	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(root);
	//grid.style.backgroundColor = '#2196f3'; // pals[pals.length - 1][2];
	let areaColors = {};
	for (const a of areas) {
		let bg = (a.style.backgroundColor = pals[ihue][idarkness]);
		a.style.color = colorIdealText(bg);
		//unitTestPalette('colorAreas', a.id, bg, ihue, idarkness, a.style.color);
		areaColors[a.id] = { bg: bg, fg: a.style.color, ihue: ihue, idarkness: idarkness };
		idarkness += 1;
		//do NOT use lightest colors (want white foreground!)
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 1) % pals.length;
		//console.log(ihue,idarkness)
		//if (idx % pals[0].length == 0) ihue = (ihue + 1) % pals[0].length;
	}
	return { hue0: hue0, nHues: nHues, pals: pals, mode: 'shades', areaColors: areaColors };
}
function colorPalSet(chStart, nHues = 2, { ch2, lum = 50, sat = 100, lumSatMode = 1, blendMode = 1, a } = {}) {
	//console.log('colorPalSet');
	//base can be hue (0<=hue<=360) or color in any format
	//blendMode: 1: all hues blend with just 1 hue
	//returns a list of nHues palettes
	let h1 = chStart;
	let h2 = ch2;
	if (!isNumber(chStart)) {
		let hsl = colorHSL(chStart);
		h1 = hsl.h;
		lum = hsl.l;
		sat = hsl.s;
	}
	if (ch2 !== undefined && !isNumber(ch2)) {
		h2 = colorHue(ch2);
	}
	let palettes = [];
	let hueDiff = Math.floor(360 / nHues);
	let pal;
	for (let i = 0; i < nHues; i++) {
		if (h2 !== undefined) {
			pal = colorPalette(h1, { ch2: h2, lum: lum, sat: sat, a: a });
		} else {
			pal = colorPalette(h1, { ch2: undefined, lum: lum, sat: sat, a: a });
		}
		palettes.push(pal);
		h1 += hueDiff;
	}
	return palettes;
}
//ACHTUNG!!!! EXTREMELY SLOW!!!!
function colorToFillStyle(c) {
	//c can be any string understandable as css color
	//return value is hex7 if alpha == 1, and rgba string otherwise
	var ctx = document.createElement('canvas').getContext('2d');
	ctx.fillStyle = c;
	return ctx.fillStyle;
} //ok
function colorRGBArrToString(r, g, b) {
	return 'rgb(' + r + ',' + g + ',' + b + ')';
} //ok
function colorRGBArrToHSLObject(rgbArr) {
	var r1 = Number(rgbArr[0]) / 255,
		g1 = Number(rgbArr[1]) / 255,
		b1 = Number(rgbArr[2]) / 255;
	var maxColor = Math.max(r1, g1, b1),
		minColor = Math.min(r1, g1, b1);
	var L = (maxColor + minColor) / 2,
		s = 0,
		H = 0;
	if (maxColor != minColor) {
		if (L < 0.5) {
			s = (maxColor - minColor) / (maxColor + minColor);
		} else {
			s = (maxColor - minColor) / (2.0 - maxColor - minColor);
		}
		if (r1 == maxColor) {
			H = (g1 - b1) / (maxColor - minColor);
		} else if (g1 == maxColor) {
			H = 2.0 + (b1 - r1) / (maxColor - minColor);
		} else {
			H = 4.0 + (r1 - g1) / (maxColor - minColor);
		}
	}
	L = L * 100;
	s = s * 100;
	H = H * 60;
	if (H < 0) {
		H += 360;
	}
	return { h: H, s: s, l: L };
} //ok
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
} //ok
function getNColors(n) {
	return choose(getColorNames(), n);
} //ok
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
} //ok
//color converters good!
function hexToHSL(H) {
	let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		// convert hex to RGB first
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length == 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		// then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function hexAToHSLA(H) {
	let ex = /^#([\da-f]{4}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;
		// 4 digits
		if (H.length == 5) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
			a = '0x' + H[4] + H[4];
			// 8 digits
		} else if (H.length == 9) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
			a = '0x' + H[7] + H[8];
		}

		// normal conversion to HSLA
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		a = (a / 255).toFixed(3);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLToRGB(hsl, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;

		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		// keep hue fraction of 360 if ending up over
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}

		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBToHex7(c) {
	let n = allNumbers(c);
	if (c.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1);
} //ok
function RGBAToHex9(rgba) {
	let n = allNumbers(rgba); //allNumbers does not catch .5 as float!
	//console.log('all numbers:', n);
	if (n.length < 3) {
		//console.log('RGBAToHex ERROR!', rgba);
		return randomHexColor();
	}
	let a = n.length > 3 ? n[3] : 1;
	let sa = alphaToHex(a);
	//console.log('sa:', sa);
	if (rgba.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1) + sa;
} //ok
function RGBToHSL(rgb) {
	let ex = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
	if (ex.test(rgb)) {
		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
		rgb = rgb
			.substr(4)
			.split(')')[0]
			.split(sep);

		// convert %s to 0–255
		for (let R in rgb) {
			let r = rgb[R];
			if (r.indexOf('%') > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
		}

		// make r, g, and b fractions of 1
		let r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBAToHSLA(rgba) {
	let ex = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(rgba)) {
		let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
		rgba = rgba
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (rgba.indexOf('/') > -1) rgba.splice(3, 1);

		for (let R in rgba) {
			let r = rgba[R];
			if (r.indexOf('%') > -1) {
				let p = r.substr(0, r.length - 1) / 100;

				if (R < 3) {
					rgba[R] = Math.round(p * 255);
				}
			}
		}

		// make r, g, and b fractions of 1
		let r = rgba[0] / 255,
			g = rgba[1] / 255,
			b = rgba[2] / 255,
			a = rgba[3],
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok

function pSBC(p, c0, c1, l) {
	//usage:
	// (blacken) -1.0 <= p <= 1.0 (whiten), or (c0) 0 <= p <= 1.0 (c1) when blending (ie., c1 given)
	// c0: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... from color
	// c1: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... to color (blending)
	// 		or 'c' for conversion between hex string and rgb string
	// l true:log blending, [false:linear blending]=default!
	let r,
		g,
		b,
		P,
		f,
		t,
		h,
		i = parseInt,
		m = Math.round,
		a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr)
		this.pSBCr = d => {
			let n = d.length,
				x = {};
			if (n > 9) {
				([r, g, b, a] = d = d.split(',')), (n = d.length);
				if (n < 3 || n > 4) return null;
				(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
				else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
			}
			return x;
		};
	(h = c0.length > 9),
		(h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
		(f = pSBCr(c0)),
		(P = p < 0),
		(t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
		(p = P ? p * -1 : p),
		(P = 1 - p);
	if (!f || !t) return null;
	if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
	else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
	(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
} //ok SUPER COOL!!!!
function randomColor(s = 100, l = 70, a = 1) {
	//s,l in percent, a in [0,1], returns hsla string
	var hue = Math.random() * 360;
	return hslToHslaString(hue, s, l, a);
}
function hslToHslaString(h, s, l, a = 1) {
	// hsl is object
	return 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
}


function randomHexColor() {
	let s = '#';
	for (let i = 0; i < 6; i++) {
		s += chooseRandom(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
} //ok

//#endregion

//#region CSS helpers
function setCSSButtonColors(palset, ihue = 0) {
	// takes a palette pal (sorted from darkest to lightest),
	// sets css variables for button colors (used in layout.css):
	// --bbg button background set to dark, --bhbg hover to light color, --babg press bg to medium
	let root = document.documentElement;
	let pal = palset[ihue];
	let len = pal.length;
	//console.log(pal.length)
	//backgrounds:
	root.style.setProperty('--bbg', pal[2]);
	root.style.setProperty('--bhbg', pal[0]);
	root.style.setProperty('--babg', pal[5]);
	root.style.setProperty('--baltbg', pal[3]);

	// root.style.setProperty('--bxxd', pal[0]);
	// root.style.setProperty('--bxd', pal[1]);
	// root.style.setProperty('--bd', pal[2]);
	// root.style.setProperty('--bm', pal[3]);
	// root.style.setProperty('--bl', pal[4]);
	// root.style.setProperty('--bxl', pal[5]);
	// root.style.setProperty('--bxxl', pal[6]);
}

var sheet = (function () {
	// Create the <style> tag
	var style = document.createElement('style');

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute("media", "screen")
	// style.setAttribute("media", "only screen and (max-width : 1024px)")

	// WebKit hack :(
	style.appendChild(document.createTextNode(''));

	// Add the <style> element to the page
	document.head.appendChild(style);

	return style.sheet;
})();
function addCSSClass(className, text) {
	sheet.insertRule('.' + className + ' { ' + text + ' }', 0);
}
//#endregion

//#region dictionary helpers
function isDict(d) { return typeof (d) == 'object'; }
function getKeys(dict) { return Object.keys(dict); }
function strKeys(dict) { return getKeys(dict).toString(); }
function listKey(d, lastKey, val, uniqueValues = true) {
	if (nundef(d[lastKey])) d[lastKey] = [];
	if (uniqueValues) addIf(d[lastKey], val); else d[lastKey].push(val);
	return d[lastKey];
}
function listKeys(dict, keys, val, uniqueValues = true) {
	//same as setKeys with list values: val is added to list or a new list is started with val
	let d = dict;
	keysCopy = jsCopy(keys);
	let lastKey = keysCopy.pop();
	for (const k of keysCopy) {
		if (!(k in d)) {
			d[k] = {};
		}
		d = d[k];
	}
	return listKey(d, lastKey, val, uniqueValues);
	// if (nundef(d[lastKey])) d[lastKey]=[];
	// if (uniqueValues) addIf(d[lastKey],val); else d[lastKey].push(val);
	// return d[lastKey];
}
//makes no sense! function setKey(dict,key,val){}
function setKeys(dict, keys, val) {
	//sets dict.k1.k2... =val (overrides if entry exists, otherwise adds entry)
	let d = dict;
	keysCopy = jsCopy(keys);
	let lastKey = keysCopy.pop();
	for (const k of keysCopy) {
		if (!(k in d)) {
			d[k] = {};
		}
		d = d[k];
	}
	d[lastKey] = val;
	return d[lastKey];
}
function ADMinusKeys(ad1, ad2) {
	let arr1 = ad1;
	let arr2 = ad2;
	if (!Array.isArray(ad1)) {
		console.log('ad1 not an array:', typeof ad1, ad1);
		arr1 = getKeys(ad1);
	}
	if (!Array.isArray(ad2)) {
		console.log('ad2 not an array:', typeof ad2, ad2);
		arr1 = getKeys(ad2);
	}
	return arrMinus(arr1, arr2);
}
function addIfKeys(dict, keys, val) {
	//only adds val if any of keys not yet in dict!
	let d = dict;
	keysCopy = jsCopy(keys);
	let lastKey = keysCopy.pop();
	for (const k of keysCopy) {
		if (!(k in d)) {
			d[k] = {};
		}
		d = d[k];
	}
	if (!(lastKey in d)) d[lastKey] = val;
	return d[lastKey];
}
function dict2list(d, keyName = 'key') {
	//d assumed to be dictionary with values are objects!!!!
	let res = [];
	for (const key in d) {
		let o = jsCopy(d[key]);
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function getIfDict(o, key, defval) {
	//o MUST be existing dict!
	let entry = o[key];
	if (nundef(entry) && isdef(defval)) {
		o[key] = defval;
	}
	return o[key];
}
function isType(sType, val) {
	// uses existing (global) config data to infer type from val
	//testHelpers("isType called!",sType, val, regions, units);
	switch (sType) {
		case 'region':
			return val in regions;
		case 'power':
			return val in unitsPerPower;
		case 'unit':
			return val in units;
		case 'faction':
			return val in ['Axis', 'West', 'USSR'];
	}
	return false;
}
function inferType(val) {
	for (const t of ['region', 'power', 'unit', 'faction']) {
		if (isType(t, val)) {
			return t;
		}
	}
	return 'unknown';
}
function lookup(dict, keys) {
	//console.log('lookup', dict, keys);
	let d = dict;
	//let last = keys[keys.length - 1];
	//console.log('last', last);
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined) return null;
		//console.log(k, 'is in', d);
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAsIdList(dict, keys) {
	//console.log('lookup', dict, keys);
	let d = dict;
	let last = keys[keys.length - 1];
	//console.log('last', last);
	for (const k of keys) {
		if (k in d) {
			//console.log(k, 'is in', d);
			d = d[k];
			if (k == last) return dict2list(d, 'id');
		} else return null;
	}
}
function parseDictionaryName(s) {
	if (nundef(s)) return null;
	let o_keys = s.split('.');
	if (empty(o_keys)) return null;
	odict = window[o_keys[0]];
	if (!odict || typeof odict != 'object') return null;
	if (o_keys.length > 1) odict = lookup(odict, o_keys.slice(1));
	return odict;
}

function removeInPlaceKeys(dict, keys) {
	for (const k of keys) {
		delete dict[k];
	}
}
function sortBy(arr, key) {
	//console.log(jsCopy(arr))
	arr.sort((a, b) => (a[key] < b[key] ? -1 : 1));
}
function sortByDescending(arr, key) {
	//console.log(jsCopy(arr))
	arr.sort((a, b) => (a[key] > b[key] ? -1 : 1));
}
function sortByFunc(arr, func) {
	arr.sort((a, b) => (func(a) < func(b) ? -1 : 1));
}
function sortByFuncDescending(arr, func) {
	arr.sort((a, b) => (func(a) > func(b) ? -1 : 1));
}
function subDict(d, keys) {
	let dNew = {};
	for (const key of keys) {
		//['areaColors', 'pals', 'palDescription']) {
		if (key in d) {
			dNew[key] = d[key]; //newH.vars[key] = H.vars[key];
		}
	}
	return dNew;
}

//#endregion dictionary helpers

//#region DOM helpers:
const MARGIN_S = '3px 6px';
const MARGIN_M = '4px 10px';
const MARGIN_XS = '2px 4px';
function domId(id) { return document.getElementById(id) }

function addClass(clName, el) { if (!el) return; el.classList.add(clName); }
function getClassG(el) { return el.getAttribute('class'); }
function removeClass(clName, el) { if (!el) return; el.classList.remove(clName); }

function addPara(div, s, margin = '0px', fontSize = '10px', color = 'green') {
	//console.log('*** added para:', s,'to',div.id);
	let p = getPara(s);
	div.appendChild(p);
	return p;
}

function getPara(msg, float) {
	let pl = document.createElement('div');
	if (isdef(float)) pl.style.float = float;
	pl.innerHTML = msg;
	return pl;
}
function addBorder(elem, color, thickness) {
	elem.style.border = color + ' ' + thickness + 'px solid';
	elem.style.boxSizing = 'border-box';

}
function removeBorder(elem) {
	elem.style.border = null;
}
function addTitleLine(dParent, left, center, right) {
	let dt = document.createElement('div');
	dt.style.textAlign = 'center';
	dt.classList.add('ttdiv')
	let pl = getPara(left, 'left');
	let pr = getPara(right, 'right');
	let pCenter = getPara(center);
	dt.appendChild(pl);
	dt.appendChild(pr);
	dt.appendChild(pCenter);
	dParent.appendChild(dt);
	return [dt, dt.offsetWidth, dt.offsetHeight, dParent.offsetWidth, dParent.offsetHeight];
}
function divscrolldown(id) {
	id = '#' + id;
	setTimeout(function () {
		$(id).animate(
			{
				scrollTop: $(id).offset().top
			},
			500
		);
	}, 200);
}
function cloneSvg(svg, id) {
	var newPawn = svg.cloneNode(true);
	newPawn.id = id;
	return newPawn;
}
function gZone(d, gid, vAnchor, hAnchor, wPercent, hPercent, bg, fg) {
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	//calculate wDiv,hDiv
	let wd = d.style.width;
	let hd = d.style.height;
	//console.log(wd,hd);

	// svg1.setAttribute('width', w);
	// svg1.setAttribute('height', h);
	// let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;'; //
	// if (bg) style += 'background-color:' + bg;
	// svg1.setAttribute('style', style);
	// //dParent.style.position = 'absolute';//???????
	// //dParent.parentNode.style.position='absolute'; nein das geht nicht!!!
	// dParent.appendChild(svg1);

	// let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	// g1.id = gid;
	// svg1.appendChild(g1);
	// return g1;
}
function addDiv(dParent, { html, w = '100%', h = '100%', bg, fg, border, rounding, margin, padding, float, position, x, y, textAlign, fontSize }) {
	// bg, fg, border, rounding, margin, padding, float, textAlign}) {
	let d = document.createElement('div');
	// make big div
	if (html) d.innerHTML = html;
	if (bg) d.style.backgroundColor = bg;
	if (fg) {
		d.style.color = fg;
	}
	if (isNumber(w)) {
		w = w + 'px';
	}
	if (isNumber(h)) {
		h = h + 'px';
	}

	d.style.width = w;
	d.style.height = h;
	if (border) {
		d.style.border = border;
		d.style.borderRadius = rounding;
	}
	if (isNumber(margin)) d.style.margin = margin + 'px';
	if (isNumber(padding)) d.style.padding = padding + 'px';
	if (float) d.style.float = float;
	if (position) d.style.position = position;
	if (isNumber(x)) d.style.left = x + 'px';
	if (isNumber(y)) d.style.top = y + 'px';
	if (textAlign) d.style.textAlign = textAlign;
	if (fontSize) d.style.fontSize = fontSize;
	dParent.appendChild(d);
	return d;
}
function addGArea(gName, areaName = 'a_d_game', x = 0, y = 0, clearFirst = true) {
	let d = document.getElementById(areaName);
	if (clearFirst) {
		clearElement(d);
	}
	console.log(d, d.childNodes, d.firstChild);
	let container = d.firstChild ? d.firstChild : addDiv(d, { position: 'relative' });
	let w = container.offsetWidth;
	let h = container.offsetHeight;
	console.log('w', w, 'h', h);
	console.log(container);
	let dNew = addDiv(container, { position: 'absolute', x: x, y: y, w: w, h: h, bg: 'slategray', gap: 0 }); //, w:`calc(100%-${x}px)`, h: `calc(100%-${y}px)`, bg:'green'});
	let g = addSvgg(dNew, gName);
	g.classList.add('gCentered');
	return dNew;
}
function addDivFill(id, dParent) {
	let d = document.createElement('div');
	d.id = id;
	d.style.width = '100%';
	d.style.height = '100%';
	dParent.appendChild(d);
	return d;
}
//function addG(id,centered=true){}
function addGFill(id, dParent) {
	//console.log(id, dParent);
	let res = addSvgg(dParent, id, { originInCenter: true });
	//console.log(res)
	return res;
}
function addDivPos(dParent, x, y, w, h, { gap, bg, fg, border, rounding, textAlign, fontSize } = {}) {
	//w and h must be numbers!
	if (gap > 0) {
		//check if this div touches right border of parent
		let wCont = dParent.offsetWidth;
		let isRight = x + w >= wCont;
		let hCont = dParent.offsetHeight;
		let isBottom = y + h >= hCont;
		//console.log(wCont, 'isRight', isRight);
		//console.log(hCont, 'isBottom', isBottom);
		x += gap;
		y += gap;
		w -= (isRight ? 2 : 1) * gap;
		h -= (isBottom ? 2 : 1) * gap;
	}
	return addDiv(dParent, { position: 'absolute', x: x, y: y, w: w, h: h, bg, fg, border, rounding, textAlign, fontSize });
}

function addSvgg(dParent, gid, { w = '100%', h = '100%', bg, fg, originInCenter = false } = {}) {
	//each div gets an svg and inside a g
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;'; //
	if (bg) style += 'background-color:' + bg;
	svg1.setAttribute('style', style);
	//dParent.style.position = 'absolute';//???????
	//dParent.parentNode.style.position='absolute'; nein das geht nicht!!!
	dParent.appendChild(svg1);

	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g1.id = gid;
	svg1.appendChild(g1);

	if (originInCenter) {
		// let wDiv = dParent.offsetWidth;
		// let hDiv = dParent.offsetHeight;
		// g1.setAttribute('transform', `translate(${wDiv / 2},${hDiv / 2})`);
		g1.setAttribute('class', 'gCentered');
	}

	//console.log('g1 is:', g1)
	//console.log('HAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOO')
	return g1;
	//addUnit('u'+i, g1.id, 'Fortress', 'Italy', 4, 0,0);
}
function setOrigin(g, center = true) {
	if (center) g.setAttribute('class', 'gCentered');
	else g.setAttribute('class', null);
}
function evenFloor(x) { let n = Math.floor(x); return n % 2 ? n - 1 : n; }
function addPara_tnt(div, s, margin = '0px', fontSize = '10px', color = 'green') {
	//console.log('*** CREATED PARA:', s);
	let p = document.createElement('p');
	p.id = uidHelpers();
	div.appendChild(p);
	$(p.id).css('background-color', 'violet');
	p.textContent = s;
	//p.style.cssText = `margin:${margin};font-size:${fontSize};color:${color}`;
	return p;
}
function addStyledDiv(dParent, id, html, styleString) {
	let d = document.createElement('div');
	dParent.appendChild(d);
	d.id = id;
	d.style.cssText = styleString;
	if (html) d.innerHTML = html;
	return d;
}
function addDivFullClass(dParent, id, className) {
	let d = document.createElement('div');
	dParent.appendChild(d);
	d.id = id;
	d.style.width = '100%';
	d.style.height = '100%';
	d.classList.add(className);
	return d;
}
function addDivClass(dParent, id, className) {
	let d = document.createElement('div');
	dParent.appendChild(d);
	d.id = id;
	d.classList.add(className);
	return d;
}
function addSpanColor(dParent, id, bg, fg) {
	let d = document.createElement('span');
	dParent.appendChild(d);
	d.id = id;
	d.style.color = fg;
	d.style.backgroundColor = bg;
	return d;
}
function addFlexGridDiv(div) {
	let d = document.createElement('div');
	d.classList.add('flex-grid');
	div.appendChild(d);
	return d;
}
function arrChildren(elem) {
	testHelpers('arrChildren', getTypeOf(elem), elem.children, elem.childNodes);
	testHelpers('result:', [...elem.children]);
	testHelpers('res2:', Array.from(elem.children));
	return [...elem.children];
}
function getChildren(elem) { return [...elem.children]; }
function clearElement(elem) { //, eventHandlerDictByEvent = {}) {
	//console.log('clearing',elem)
	if (isString(elem)) elem = document.getElementById(elem);
	//$(elem).remove();
	while (elem.firstChild) {
		$(elem.firstChild).remove();
		// for (key in eventHandlerDictByEvent) {
		// 	elem.removeEventListener(key, eventHandlerDictByEvent[key]);
		// }
		// let el = elem.firstChild;
		// elem.removeChild(el);
		// testHelpers('removed', el);
	}
}
function clearElementFromChildIndex(elem, idx = 0) {
	let charr = arrChildren(elem).slice(idx);
	for (const ch of charr) {
		elem.removeChild(ch);
	}
}
function closestParent(elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
}
function detectType(id) {
	let el = document.getElementById(id);
	return getTypeOf(el);
}
function findDOMAncestorOfType(elem, t = 'div') {
	let anc = elem.parentNode;
	while (MSCATS[getTypeOf(anc)] != t) { anc = anc.parentNode; }
	this.ancestor = anc;
}
function findDescendantWithId(id, parent) {
	if (parent.id == id) return parent;
	let children = arrChildren(parent);
	if (empty(children)) return null;
	for (const ch of children) {
		let res = findDescendantWithId(id, ch);
		if (res) return res;
	}
	return null;
}
function findChildWithId(id, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.id == id) return ch;
	}
	return null;
}
function findChildWithClass(className, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		//console.log('....findChildWithClass', ch, ch.classList, className)
		if (ch.classList.includes(className)) return ch;
	}
	return null;
}
function findChildOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (getTypeOf(ch) == type) return ch;
	}
	return null;
}
function findChildrenOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	let res = [];
	for (const ch of children) {
		if (getTypeOf(ch) == type) res.push(ch);
	}
	return res;
}
function findParentWithId(elem) {
	//testHelpers(elem);
	while (elem && !elem.id) {
		elem = elem.parentNode;
	}
	//testHelpers("parent with id: ", elem);
	return elem;
}
function ellipsis(text, font, width, padding) {
	let textLength = getTextWidth(text, font);
	let ellipsisLength = 0;
	ellipsisLength = getTextWidth('...', font);
	let maxw = width - 2 * padding;
	while (textLength + ellipsisLength > maxw && text.length > 0) {
		//console.log(text, textLength + ellipsisLength, maxw)
		text = text.slice(0, -1).trim();
		textLength = getTextWidth(text, font); //self.node().getComputedTextLength();
	}
	return ellipsisLength > 0 ? text + '...' : text;
}
function ensureInView(container, element) {
	//Determine container top and bottom
	let cTop = container.scrollTop;
	let cBottom = cTop + container.clientHeight;

	//Determine element top and bottom
	let eTop = element.offsetTop;
	let eBottom = eTop + element.clientHeight;

	//Check if out of view
	if (eTop < cTop) {
		container.scrollTop -= cTop - eTop;
	} else if (eBottom > cBottom) {
		container.scrollTop += eBottom - cBottom;
	}
}
function evToId_g_(ev) {
	let elem = findParentWithId(ev.target);
	let s = elem.id;

	return s[0] == 'g' && s[1] == '_' ? stringAfter(s, '_') : s;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToIdTNT(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToIdParent(ev) {
	let elem = findParentWithId(ev.target);
	return elem;
}
function getParentOfScript() {
	// finds script in which this function is called
	var thisScript = document.scripts[document.scripts.length - 1];
	var parent = thisScript.parentElement;
	return parent;
}
function getTextWidth(text, font) {
	// re-use canvas object for better performance
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}
function hide(elem) {
	//console.log(elem)
	if (isSvg(elem)) {
		hideSvg(elem);
	} else {
		elem.classList.add('hidden');
	}
}
function hideSvg(elem) {
	elem.setAttribute('style', 'visibility:hidden;display:none');
}
function insertHere() {
	var thisScript = document.scripts[document.scripts.length - 1];
	var parent = thisScript.parentElement;
	for (let i = 0; i < arguments.length; i++) {
		const el = arguments[i];
		if (typeof el == 'string') {
			thisScript.nextSibling.insertAdjacentHTML('beforebegin', el);
		} else {
			parent.insertBefore(el, thisScript.nextSibling);
		}
	}
}
function isSvg(elem) {
	return startsWith(elem.constructor.name, 'SVG');
}
function isVisible(elem) {
	if (isSvg(elem)) {
		let style = elem.getAttribute('style');
		if (style) return !style.includes('hidden');
		else return true;
	} else {
		return !elem.classList.includes('hidden');
	}
}
function makeSvg(w, h) {
	const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	return svg1;
}

function show(elem) {
	if (isSvg(elem)) {
		showSvg(elem);
	} else {
		elem.classList.remove('hidden');
	}
}
function showSvg(elem) {
	elem.setAttribute('style', 'visibility:visible');
}
function toHTMLString(msg) {
	msg = JSON.stringify(msg);
	msg = msg.replace(/(?:\r\n|\r|\n)/g, '<br>');
	msg = msg.replace('\\n', '<br>');
	msg = msg.replace(/\\n/g, '<br>');
	msg = msg.replace(/"/g, '');
	return msg.trim();
}
//tableCreate();
function makeKeyValueTable(data) {
	let cols = 2;
	let rows = data.length;
	let res = `<table>`;
	for (const k in data) {
		res += `<tr><th>${k}</th><td>${data[k]}</td></tr>`;
	}
	res += `</table>`;
	let res1 = (elem = new DOMParser().parseFromString(res, 'text/html').body.firstChild);
	return res1;
}
function makeTable(tableName, rowHeaders, colHeaders) {
	let cols = colHeaders.length + 1;
	let rows = rowHeaders.length + 1;
	let sh = `<table id='${tableName}'><tr><th></th>`;
	for (const ch of colHeaders) {
		sh += `<th id='${ch}Header'>${ch}</th>`;
	}
	sh += `</tr>`;
	for (const rh of rowHeaders) {
		sh += `<tr id='${rh}${tableName}'><th>${rh}</th>`;
		for (const ch of colHeaders) {
			sh += `<td id='${rh}${ch}'>0</td>`;
		}
		sh += `</tr>`;
	}
	sh += `</table>`;
	let res = (elem = new DOMParser().parseFromString(sh, 'text/html').body.firstChild);
	return res;
}
function makeCadreTable(powers) {
	let cadreTypes = ['Infantry', 'Fortress', 'Tank', 'AirForce', 'Fleet', 'Carrier', 'Submarine'];
	//let powers = ['Germany','Italy','Britain','France','USA','USSR'];
	let table = makeTable('AvailableCadres', cadreTypes, powers);
	addTableTo(table);
}
function addTableTo(table) {
	let div = document.getElementById('slideInAvailableCadres');
	div.appendChild(table);
}

//#endregion

//#region flask server: uses jQuery ajax!
// function loadTest(){
//   $.ajax({
//     url: "/loadTest",
//     type: "GET",
//     success: function(response) {
//       testHelpers(response);
//     },
//     error: function(error) {
//       testHelpers(error);
//     }
//   });
// }
function saveJsonAtServer(jsonObject, filename) {
	event.preventDefault();
	var labels = ['hallo', 'das', 'ist']; //checkboxes.toArray().map(checkbox => checkbox.value);

	$.ajax({
		url: '/postTest',
		type: 'POST',
		data: JSON.stringify(jsonObject),
		processData: false,
		contentType: 'application/json; charset=UTF-8',
		success: function (response) {
			testHelpers(response);
		},
		error: function (error) {
			testHelpers(error);
		}
	});
}
//#endregion

//#region file and loading helpers
function loadJSON(path, callback) {
	//usage: https://stackoverflow.com/questions/48073151/read-local-json-file-into-variable
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType('application/json');
	xobj.open('GET', path, true); //path example: '../news_data.json'
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == '200') {
			callback(JSON.parse(xobj.responseText));
		}
	};
	xobj.send(null);
}
function loadText(path, callback) {
	$.ajax({
		url: path,
		type: 'GET',
		success: response => {
			//console.log(response);
			if (callback) {
				callback(response);
			}
		},
		error: err => {
			error(err);
		}
	});
	return 'ok';
}
function loadUrlToJSON(url, callback) { }
function loadYML(path, callback) {
	res = undefined;
	$.get(path) // eg. '/common/resources/LessonContentsLv01Ln01.yml'
		.done(function (data) {
			var yml = jsyaml.load(data);
			var jsonString = JSON.stringify(data);
			var json = $.parseJSON(jsonString);
			callback(yml);
		});
}
function download(jsonObject, fname) {
	json_str = JSON.stringify(jsonObject);
	saveFile(fname + '.json', 'data:application/json', new Blob([json_str], { type: '' }));
}
function saveFile(name, type, data) {
	// Function to download data to a file
	//usage:
	// json_str = JSON.stringify(G);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], {type: ""}));

	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);

	var a = $("<a style='display: none;'/>");
	var url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.attr('href', url);
	a.attr('download', name);
	$('body').append(a);
	a[0].click();
	setTimeout(function () {
		// fixes firefox html removal bug
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function loadScript(path, callback) {
	var script = document.createElement('script');
	script.onload = function () {
		if (callback) callback(path);
	};
	script.src = path;
	document.head.appendChild(script);
}
function loadStyle(href, callback) {
	let style = document.createElement('link');
	style.rel = href == 'favicon' ? 'shortcut icon' : 'stylesheet';
	style.onload = function () {
		if (callback) callback(href);
	};
	style.href = href;
	document.head.appendChild(style);
}
//#endregion file helpers

//#region function helpers
function getFuncName() {
	return getFuncName.caller.name;
}
function getFunctionsNameThatCalledThisFunction() {
	return getFunctionsNameThatCalledThisFunction.caller.caller.name;
}
function getCurrentFileName() {
	let currentFilePath = document.scripts[document.scripts.length - 1].src;
	let fileName = currentFilePath.split('/').pop(); // formatted to the OP's preference

	return fileName;
}
function getFunctionCallerName() {
	// gets the text between whitespace for second part of stacktrace
	return new Error().stack.match(/at (\S+)/g)[1].slice(3);
}
//usage of previous 2:
function TESTING_bar(fileName = getCurrentFileName(), myFunctionName = getFunctionsNameThatCalledThisFunction()) {
	//alert(fileName + ' : ' + myFunctionName);
}
// or even better: "myfile.js : foo"
function TESTING_foo() {
	TESTING_bar();
}
//#endregion

//#region geo helpers
function correctPolys(polys, approx = 10) {
	//console.log('citySize', citySize, 'approx', approx);
	let clusters = [];
	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					//console.log('diff', dx, dy);
					if (dx < approx && dy < approx) {
						//console.log('FOUND X!!!', dx,dy);
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				clusters.push([pt]);
			}
		}
	}

	//now all points of all polys are in clusters
	//go through clusters, computer mean for all points in a clusters
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}

	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				//console.log('diff', dx, dy);
				if (dx < approx && dy < approx) {
					//console.log('FOUND X!!!', dx, dy);
					if (dx != 0 || dy != 0) {
						//console.log('correct',pt.x,'to',v.x,'and',pt.y,'to',v.y);
						// if (dx > 1 || dy>1){
						// 	//console.log('DIFF > 1!!!!!')
						// }
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function dSquare(pos1, pos2) {
	let dx = pos1.x - pos2.x;
	dx *= dx;
	let dy = pos1.y - pos2.y;
	dy *= dy;
	return dx + dy;
}
function size2hex(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg
	//from center of poly and w (possibly h), calculate hex poly points and return as string!
	//TODO: add options to return as point list!
	//if h is omitted, a regular hex of width w is produced
	//starting from N:
	let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];

	if (h == 0) {
		h = (2 * w) / 1.73;
	}
	x -= w / 2;
	y -= h / 2;

	let pts = hexPoints.map(p => [p.X * w + x, p.Y * h + y]);
	let newpts = [];
	for (const p of pts) {
		newp = { X: p[0], Y: Math.round(p[1]) };
		newpts.push(newp);
	}
	pts = newpts;
	let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' '); //'0,0 100,0 50,80',
	testHexgrid(x, y, pts, sPoints);
	return sPoints;
}
function getPoly(offsets, x, y, w, h) {
	//, modulo) {
	let poly = [];
	for (let p of offsets) {
		let px = Math.round(x + p[0] * w); //  %modulo;
		//px -= px%modulo;
		//if (px % modulo != 0) px =px % modulo; //-= 1;
		let py = Math.round(y + p[1] * h); //%modulo;
		//py -= py%modulo;
		//if (py % modulo != 0) py -= 1;
		poly.push({ x: px, y: py });
	}
	return poly;
}
function getHexPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
	return getPoly(hex, x, y, w, h);
}
function getQuadPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
	return getPoly(q, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(triup, x, y, w, h);
}
function getTriangleDownPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(tridown, x, y, w, h);
}
//#endregion

//#region *** GSM helpers ***
function getVisibleList(o) {
	//use if KNOW this o has a visible._set (eg., visible)
	return o.visible._set;
}

//#region id helpers
var UIDCounter = 0;
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}


function comp_(...arr) {
	return arr.join('_');
}
function comp_1(id) {
	return stringBefore(id, '_');
}
function comp_2(id) {
	return stringBefore(stringAfter(id, '_'), '_');
}
function comp_last(id) {
	return stringAfterLast(id, '_');
}

function complus(...arr) {
	return arr.join('+');
}
function complus1(id) {
	return stringBefore(id, '+');
}
function complus2(id) {
	return stringBefore(stringAfter(id, '+'), '+');
}
function compluslast(id) {
	return stringAfterLast(id, '+');
}
//#endregion id helpers

//#region io helpers
function dump(...arr) {
	for (const a of arr) {
		//console.log(a);
	}
}
function error(msg) {
	let fname = getFunctionsNameThatCalledThisFunction();
	console.log(fname, 'ERROR!!!!! ', msg);
}
function notImplemented(msg = '!') {
	let fname = getFunctionsNameThatCalledThisFunction();
	console.log('NOT IMPLEMENTED:', fname, msg);
}

//#endregion io helpers

//#region layout helpers
function tableDimensions(w, h) {
	setCSSVariable('--wGame', '' + w + 'px');
	setCSSVariable('--hGame', '' + h + 'px');
	return { w: w, h: h };
}

function calculateDims(n, sz = 60, minRows = 1) {
	var rows = minRows;
	var cols = Math.ceil(n / rows);
	var gap = 10;
	var padding = 20;
	let w = 9999999;
	testHelpers('calculateDims with:', rows, cols);
	let rOld = 0;
	while (true) {
		rOld = rows;
		for (var i = Math.max(2, rows); i < n / 2; i++) {
			if (n % i == 0) {
				rows = i;
				cols = n / i;
				break;
			}
		}
		w = padding * 2 - gap + (sz + gap) * cols;
		if (w > window.innerWidth) {
			if (rows == rOld) {
				rows += 1;
				cols = Math.ceil(n / rows);
			} else if (gap > 1) gap -= 1;
			else if (padding > 1) padding -= 2;
			else {
				minRows += 1;
				gap = 6;
				padding = 10;
			}
		} else break;
		if (rows == rOld) break;
	}
	return { rows: rows, cols: cols, gap: gap, padding: padding, width: w };
}

function mup(o, p, d) {
	p = { x: p.x, y: p.y - d };
	if (o) o.setPos(p.x, p.y);
	return p;
}
function mri(o, p, d) {
	p = { x: p.x + d, y: p.y };
	if (o) o.setPos(p.x, p.y);
	return p;
}
function mdo(o, p, d) {
	p = { x: p.x, y: p.y + d };
	if (o) o.setPos(p.x, p.y);
	return p;
}
function mle(o, p, d) {
	p = { x: p.x - d, y: p.y };
	if (o) o.setPos(p.x, p.y);
	return p;
}
function snail(p, o, d) {
	if (o.length == 0) return;
	testHelpers(p, o);

	o[0].setPos(p.x, p.y);
	n = o.length;
	let step = 1;
	let k = 1;
	while (true) {
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mup(o[k], p, d);
				k += 1;
			} else return;
		}
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mri(o[k], p, d);
				k += 1;
			} else return;
		}
		step += 1;
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mdo(o[k], p, d);
				k += 1;
			} else return;
		}
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mle(o[k], p, d);
				k += 1;
			} else return;
		}
		step += 1;
	}
}
function calcSnailPositions(x, y, d, n) {
	let p = { x: x, y: y };
	let res = [p];
	let step = 1;
	let k = 1;
	while (true) {
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mup(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mri(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		step += 1;
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mdo(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mle(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		step += 1;
	}
}

//   let p=[[x,y],[x,y-sz],[x+sz,y-sz],[x+sz,y],[x+sz,y+sz],[x,y+sz],[x-sz,y+sz],[x-sz,y],[x-sz,y-sz]];
//   let s2=sz*2;
//   p=p.concat([[x-sz,y-s2],[x,y-s2],[x+sz,y-s2],[x+s2,y-s2],[x+s2,y-s2]]);
//   p=p.concat([[x+s2,y-s2],[x+s2,y-sz],[x+s2,y],[x+s2,y+sz],[x+s2,y+s2]]);
//   p=p.concat([[x+sz,y+s2],[x,y+s2],[x-sz+s2,y+s2],[x-s2,y+s2]]);

//   let i=0;
//   for (const o of objects) {
//     testHelpers('p[i]',p[i],'object',o)
//     o.setPos(p[i][0],p[i][1]); i+=1;
//   }
// }
//#endregion layout helpers

//#region list of countries
/*An array containing all the country names in the world:*/
var countries = [
	'Afghanistan',
	'Albania',
	'Algeria',
	'Andorra',
	'Angola',
	'Anguilla',
	'Antigua & Barbuda',
	'Argentina',
	'Armenia',
	'Aruba',
	'Australia',
	'Austria',
	'Azerbaijan',
	'Bahamas',
	'Bahrain',
	'Bangladesh',
	'Barbados',
	'Belarus',
	'Belgium',
	'Belize',
	'Benin',
	'Bermuda',
	'Bhutan',
	'Bolivia',
	'Bosnia & Herzegovina',
	'Botswana',
	'Brazil',
	'British Virgin Islands',
	'Brunei',
	'Bulgaria',
	'Burkina Faso',
	'Burundi',
	'Cambodia',
	'Cameroon',
	'Canada',
	'Cape Verde',
	'Cayman Islands',
	'Central Arfrican Republic',
	'Chad',
	'Chile',
	'China',
	'Colombia',
	'Congo',
	'Cook Islands',
	'Costa Rica',
	'Cote D Ivoire',
	'Croatia',
	'Cuba',
	'Curacao',
	'Cyprus',
	'Czech Republic',
	'Denmark',
	'Djibouti',
	'Dominica',
	'Dominican Republic',
	'Ecuador',
	'Egypt',
	'El Salvador',
	'Equatorial Guinea',
	'Eritrea',
	'Estonia',
	'Ethiopia',
	'Falkland Islands',
	'Faroe Islands',
	'Fiji',
	'Finland',
	'France',
	'French Polynesia',
	'French West Indies',
	'Gabon',
	'Gambia',
	'Georgia',
	'Germany',
	'Ghana',
	'Gibraltar',
	'Greece',
	'Greenland',
	'Grenada',
	'Guam',
	'Guatemala',
	'Guernsey',
	'Guinea',
	'Guinea Bissau',
	'Guyana',
	'Haiti',
	'Honduras',
	'Hong Kong',
	'Hungary',
	'Iceland',
	'India',
	'Indonesia',
	'Iran',
	'Iraq',
	'Ireland',
	'Isle of Man',
	'Israel',
	'Italy',
	'Jamaica',
	'Japan',
	'Jersey',
	'Jordan',
	'Kazakhstan',
	'Kenya',
	'Kiribati',
	'Kosovo',
	'Kuwait',
	'Kyrgyzstan',
	'Laos',
	'Latvia',
	'Lebanon',
	'Lesotho',
	'Liberia',
	'Libya',
	'Liechtenstein',
	'Lithuania',
	'Luxembourg',
	'Macau',
	'Macedonia',
	'Madagascar',
	'Malawi',
	'Malaysia',
	'Maldives',
	'Mali',
	'Malta',
	'Marshall Islands',
	'Mauritania',
	'Mauritius',
	'Mexico',
	'Micronesia',
	'Moldova',
	'Monaco',
	'Mongolia',
	'Montenegro',
	'Montserrat',
	'Morocco',
	'Mozambique',
	'Myanmar',
	'Namibia',
	'Nauro',
	'Nepal',
	'Netherlands',
	'Netherlands Antilles',
	'New Caledonia',
	'New Zealand',
	'Nicaragua',
	'Niger',
	'Nigeria',
	'North Korea',
	'Norway',
	'Oman',
	'Pakistan',
	'Palau',
	'Palestine',
	'Panama',
	'Papua New Guinea',
	'Paraguay',
	'Peru',
	'Philippines',
	'Poland',
	'Portugal',
	'Puerto Rico',
	'Qatar',
	'Reunion',
	'Romania',
	'Russia',
	'Rwanda',
	'Saint Pierre & Miquelon',
	'Samoa',
	'San Marino',
	'Sao Tome and Principe',
	'Saudi Arabia',
	'Senegal',
	'Serbia',
	'Seychelles',
	'Sierra Leone',
	'Singapore',
	'Slovakia',
	'Slovenia',
	'Solomon Islands',
	'Somalia',
	'South Africa',
	'South Korea',
	'South Sudan',
	'Spain',
	'Sri Lanka',
	'St Kitts & Nevis',
	'St Lucia',
	'St Vincent',
	'Sudan',
	'Suriname',
	'Swaziland',
	'Sweden',
	'Switzerland',
	'Syria',
	'Taiwan',
	'Tajikistan',
	'Tanzania',
	'Thailand',
	"Timor L'Este",
	'Togo',
	'Tonga',
	'Trinidad & Tobago',
	'Tunisia',
	'Turkey',
	'Turkmenistan',
	'Turks & Caicos',
	'Tuvalu',
	'Uganda',
	'Ukraine',
	'United Arab Emirates',
	'United Kingdom',
	'United States of America',
	'Uruguay',
	'Uzbekistan',
	'Vanuatu',
	'Vatican City',
	'Venezuela',
	'Vietnam',
	'Virgin Islands (US)',
	'Yemen',
	'Zambia',
	'Zimbabwe'
];
//#endregion

//#region ms helpers: should NOT USE anything in MS!!!

function addMSContainer(dParent, gid, { w = '100%', h = '100%', margin = 'auto' }) {
	//adds a div w/ svg w/ g (with id=gid) inside dParent
	//let wParent = dParent.offsetWidth;
	//let hParent = dParent.offsetHeight;

	//let marginLeft = (wParent-w)/2

	// let d1 = addDiv(dParent, {w: w, h: h, margin: '0px '+marginLeft+'px', bg:'green'});
	let d1 = addDiv(dParent, { w: w, h: h, margin: margin }); //, bg:'green'});
	d1.style.position = 'relative';

	let g1 = addSvgg(d1, gid); //,{bg:'red'});
	return { div: d1, g: g1 };
}

//#endregion ms helpers

//#region numbers
function roundEven(n) {
	let res = Math.round(n);
	return res % 2 != 0 ? res - 1 : res;
}
function intDiv(n, q) {
	return Math.floor(n / q);
}
function randomNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min; //min and max inclusive!
}
//#endregion

//#region object and dictionary helpers
function augment(obj, newobj) {
	return extend(true, obj, newobj);
}
var extend = function () {
	// Variables
	var extended = {};
	var deep = false;
	var i = 0;

	// Check if a deep merge
	if (typeof arguments[0] === 'boolean') {
		deep = arguments[0];
		i++;
	}

	// Merge the object into the extended object
	var merge = function (obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
					// If we're doing a deep merge and the property is an object
					extended[prop] = extend(true, extended[prop], obj[prop]);
				} else {
					// Otherwise, do a regular merge
					extended[prop] = obj[prop];
				}
			}
		}
	};

	// Loop through each object and conduct a merge
	for (; i < arguments.length; i++) {
		merge(arguments[i]);
	}

	return extended;
};
function jsCopy(o) {
	return JSON.parse(JSON.stringify(o)); //macht deep copy
}
//TNT - do NOT USE IN GSM!!!
function hasSameProps(o1, o2) {
	let diff = propDiff(o1, o2);
	return !diff.hasChanged;
}
function sameProps(o1, o2) {
	let diff = propDiffGSM(o1, o2);
	return !diff.hasChanged;
}
function fundef(x) {
	return x === undefined || !x;
}
function isdef(x) {
	return x !== null && x !== undefined;
}
function isSimple(x) {
	return isString(x) || isNumeric(x);
}
function nundef(x) {
	// if (x === null) {
	// 	//console.log('x === null');
	// } else if (x === undefined) {
	// 	//console.log('x === undefined');
	// }
	return x === null || x === undefined;
}
function sameStringify(o1, o2) {
	return JSON.stringify(o1) == JSON.stringify(o2);
}
function union(lst1, lst2) {
	return [...new Set([...lst1, ...lst2])];
}
function propDiffSimple(o_old, o_new, props = null) {
	//berechne diff in props
	//if props omitted will compare all properties! builds union so slightly less efficient that way!
	//if o_new or o_old are null, also returns correct result!
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	if (!o_old) {
		return { onlyOld: [], onlyNew: Object.keys(o_new), propChange: [], summary: Object.keys(o_new), hasChanged: true };
	} else if (!o_new) {
		return { onlyOld: Object.keys(o_old), onlyNew: [], propChange: [], summary: Object.keys(o_old), hasChanged: true };
	}

	if (nundef(props)) props = union(Object.keys(o_old), Object.keys(o_new));
	for (const prop of props) {
		let nval = o_new[prop];
		let oval = o_old[prop];
		if (isdef(nval) && isdef(oval)) {
			if (nval == oval) continue;
			else if (typeof nval == 'object' && sameStringify(nval, oval)) {
				continue;
			} else if (isList(nval) && sameList(nval, oval)) {
				continue;
			}
			addIf(propChange, { prop: prop, old: oval, new: nval });
			addIf(summary, prop);
			hasChanged = true;
		} else if (nundef(oval)) {
			addIf(onlyNew, prop);
			addIf(summary, prop);
			hasChanged = true;
		} else if (nundef(nval)) {
			addIf(onlyOld, prop);
			addIf(summary, prop);
			hasChanged = true;
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
function propDiffFast_dep(o_old, o_new, deepCheck = false, optInOut = {}) {
	//relies on prop order does NOT change! (was ja bei tdict so ist, aber nicht sicher ob auch bei umwandlung!)
	//berechne diff in props
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	for (const prop in o_new) {
		if (fundef(optInOut[prop])) continue;

		let nprop = o_new[prop];
		let oprop = o_old[prop];
		if (isdef(nprop)) {
			let nval = o_new[prop];
			if (nundef(oprop)) {
				addIf(onlyNew, prop);
				addIf(summary, prop);
				hasChanged = true;
			} else if (nval != o_old[prop]) {
				if (!isSimple(nval)) {
					if (!deepCheck) continue;
					if (JSON.stringify(nval) == JSON.stringify(o_old[prop])) {
						console.log(JSON.stringify(nval), JSON.stringify(o_old[prop]));
						continue;
					}
				}

				addIf(propChange, { prop: prop, old: o_old[prop], new: o_new[prop] });
				addIf(summary, prop);
				hasChanged = true;
			}
		}
	}
	for (const prop in o_old) {
		if (fundef(optInOut[prop])) continue;
		if (nundef(o_new[prop])) {
			addIf(onlyOld, prop);
			addIf(summary, prop);
			hasChanged = true;
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
function propDiffPlus_dep(o_old, o_new, deepCheck = false, optInOut = {}) {
	//berechne diff in props
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	for (const prop in o_new) {
		if (fundef(optInOut[prop])) continue;

		let nprop = o_new[prop];
		let oprop = o_old[prop];
		if (isdef(nprop)) {
			let nval = o_new[prop];
			if (nundef(oprop)) {
				addIf(onlyNew, prop);
				addIf(summary, prop);
				hasChanged = true;
			} else if (nval != o_old[prop]) {
				if (!deepCheck && !isSimple(nval)) continue;
				//TODO: deep check of lists, oder mit jsonify arbeiten (geht aber nicht wenn verschiedene order of props!
				if (typeof nval == 'object' && hasSameProps(nval, o_old[prop])) {
					continue;
				} else if (isList(nval) && sameList(nval, o_old[prop])) {
					continue;
				}

				addIf(propChange, { prop: prop, old: o_old[prop], new: o_new[prop] });
				addIf(summary, prop);
				hasChanged = true;
			}
		}
	}
	for (const prop in o_old) {
		if (fundef(optInOut[prop])) continue;
		if (nundef(o_new[prop])) {
			addIf(onlyOld, prop);
			addIf(summary, prop);
			hasChanged = true;
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
function propDiffGSM_dep(o_old, o_new, deepCheck = false, optInOut = {}) {
	//berechne diff in props
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	for (const prop in o_new) {
		if (fundef(optInOut[prop])) continue;

		let nprop = o_new[prop];
		let oprop = o_old[prop];
		if (isdef(nprop)) {
			let nval = o_new[prop];
			if (nundef(oprop)) {
				addIf(onlyNew, prop);
				addIf(summary, prop);
				hasChanged = true;
			} else if (nval != o_old[prop]) {
				if (!deepCheck && !isSimple(nval)) continue;
				//mal schauen: vielleicht reicht es alle als object zu treaten!!!
				if (prop == 'visible') {
					console.log('visibility', nval);
					let visOld = getVisibleList(o_old);
					let visNew = getVisibleList(o_new);
					if (sameList(visOld, visNew)) continue;
				} else if (typeof nval == 'object' && sameProps(nval, o_old[prop])) {
					continue;
				} else if (isList(nval) && sameList(nval, o_old[prop])) {
					continue;
				}

				addIf(propChange, { prop: prop, old: o_old[prop], new: o_new[prop] });
				addIf(summary, prop);
				hasChanged = true;
			}
		}
	}
	for (const prop in o_old) {
		if (fundef(optInOut[prop])) continue;
		if (nundef(o_new[prop])) {
			addIf(onlyOld, prop);
			addIf(summary, prop);
			hasChanged = true;
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
//TNT - do NOT USE IN GSM!!!
function propDiff(o_old, o_new) {
	//berechne diff in props
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	for (const prop in o_new) {
		if (o_new.hasOwnProperty(prop)) {
			if (!(prop in o_old)) {
				addIf_dep(prop, onlyNew);
				addIf_dep(prop, summary);
				hasChanged = true;
			} else if (o_new[prop] != o_old[prop]) {
				if (prop == 'visible') {
					let visOld = getVisibleSet(o_old);
					let visNew = getVisibleSet(o_new);
					if (sameList(visOld, visNew)) {
						continue;
					}
				} else if (typeof o_new[prop] == 'object') {
					if (hasSameProps(o_new[prop], o_old[prop])) {
						continue;
					}
				}

				addIf_dep({ prop: prop, old: o_old[prop], new: o_new[prop] }, propChange);
				addIf_dep(prop, summary);
				hasChanged = true;
			}
		}
	}
	for (const prop in o_old) {
		if (o_old.hasOwnProperty(prop)) {
			if (!(prop in o_new)) {
				addIf_dep(prop, onlyOld);
				addIf_dep(prop, summary);
				hasChanged = true;
			}
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
function _setToList(oval) {
	//console.log(oval);
	if (typeof oval == 'object' && '_set' in oval) return oval._set;
	return oval;
	// if (Array.isArray(oval)) return oval;
	// else if (typeof oval == 'object') {
	// 	if ('_set' in oval) return oval._set;
	// 	else if ('_tuple' in oval) return oval._tuple;
	// } else return oval;
}

function simpleRep(val) {
	// if (val == '') {
	// 	console.log('WOW!!!! val', val, "val==''", val == '', "val===''", val === ''); //0 true(!) false
	// }
	if (nundef(val) || val === '') {
		// console.log('val', val, 'nundef(val)', nundef(val), typeof val);
		return '_';
	} else if (isSimple(val)) return val;
	else if (isList(val)) {
		//console.log('val is list!!!!!!!!!!!!!!', val);
		return '[' + val.map(x => simpleRep(x)).join(', ') + ']';
	} else if (typeof val == 'object') {
		let s = [];
		for (const k in val) {
			//console.log(val,k,val[k])
			if (empty(val[k])) continue;
			let s1 = simpleRep(val[k]);
			//wenn das jetzt eine liste war dann ist jetzt s='[1,2,3]'
			if (k == '_set') s1 = '{' + s1.substring(1, s1.length - 1) + '}';
			s.push(s1);
		}
		return s.join(', ');
	}
}

//#endregion object helpers

//#region palette helpers

//old code still active! but depreceated as of Sept 16, 2019
var palette = null;
function bgFromPal(ipal_dep, pal) {
	return getpal(ipal_dep, 0, 'b', pal);
}
function paletteFromColor(c, a = 1) {
	//egal in welchem format c ist!!!
	if (Array.isArray(c)) return paletteFromRGBArray(c);

	let hsl = standardizeToHsl(c);
	//console.log(c)
	let pal = gen_palette(hsl.h, 1, hsl.s * 100, a);

	return pal;
}
function paletteFromRGBArray(arr) {
	let hsl = rgbToHsl(arr[0], arr[1], arr[2]);
	let hue1 = hsl[0] * 360;
	sat = Math.round(hsl[1] * 100);

	let hsv = rgbToHsv(arr[0], arr[1], arr[2]);
	let hue2 = hsv.h; //

	let hue = hue1;

	//console.log('***************************************')
	//console.log('********   paletteFromRGBArray   ********')
	//console.log('***************************************')
	//console.log('arr',arr,'hsl',hsl,'hue',hue1,'hsv',hsv,'hue',hue2);
	//console.log('hsl',hsl)
	//console.log('hsv',hsv)

	// //console.log('hsl',hsl,'arr',arr,'hue',hue)
	let result = gen_palette(hue, 1, sat);
	//console.log('result',result);
	return result;
}
function gen_palette(hue = 0, nHues = 2, sat = 100, a = 1) {
	//generates a palette = array of 7 arrays of nHues color pairs as {b:background,f:foreground}
	//each color is a hsla string
	//the 7 arrays are sorted from dark to light
	//starting from hue (0 is red), 360 degrees of rainbow hues are divided into nHues equal arcs
	//hue wheel in counter clockwise dir: 0=red,60=yellow,120=green,180=cyan,240=blue,300=magenta
	//eg. pal=[[{b:h1darkest,f:h1df},{b:h2b,f:h2f},...],...,[{b:h1lightest,f:h1lf},...]]
	// pal.length = 7, pal[0].length = nHues, pal[0][0] ... {b:c1,f:c2}
	let hues = [];
	let hueDiff = 360 / nHues;
	for (let i = 0; i < nHues; i++) {
		hues.push(hue);
		hue += hueDiff;
	}
	let pal = [];
	for (l of [15, 25, 35, 50, 65, 75, 85]) {
		let palHues = [];
		for (const h of hues) {
			cb = `hsla(${h},${sat}%,${l}%,${a})`; //hsla(120,100%,50%,0.3)
			hopp = (h + 180) % 360;
			cf = `hsla(${hopp},${sat}%,${l < 18 ? 100 : 0}%,${a})`; //hsla(120,100%,50%,0.3)
			let hex = standardize_color(cb);
			let f5 = idealTextColor(hex);
			palHues.push({ b: cb, f: f5 });
		}
		pal.push(palHues);
	}
	testHelpers('pal.length:', pal.length, ', pal[0].length:', pal[0].length, ', pal:', pal);
	return pal;
}
function getpal(ipal_dep = -1, ihue = 0, bOrf = 'b', pal) {
	//gets a b or f color from palette
	//a value of -1 in ihue or ipal_dep ... pick random
	//default: return random background shade of first hue
	//if no palette has ever been set, just return a random color
	//if pal parameter, take pal instead of global palette
	//console.log('***************************************')
	//console.log('********   getpal   ********')
	//console.log('***************************************')
	//console.log('getpal',ipal_dep,ihue,bOrf,pal)
	let p = empty(pal) || !pal || pal == undefined ? palette : pal;
	//console.log(p,typeof(p),p[0])
	if (!p) return randomColor();
	nHues = p[0].length;
	nShades = p.length;
	if (ipal_dep < -1) ipal_dep = randomNumber(0, nShades);
	else if (ipal_dep >= nShades) ipal_dep %= nShades;
	if (ihue < -1) ihue = randomNumber(0, nHues);
	else if (ihue >= nHues) ihue %= nHues;
	//console.log('result von getpal',p[ipal_dep][ihue][bOrf]);
	return p[ipal_dep][ihue][bOrf];
}
function set_palette(hue = 0, nHues = 2, sat = 100, a = 1) {
	palette = gen_palette(hue, nHues, sat, a);
	return palette;
}
function color_areas(nHues = 2, iButtonHue = 0, areaClass = 'area', gridDiv = 'root') {
	let hue1 = Math.floor(Math.random() * 360);
	let pal = gen_palette(hue1, nHues);
	palette = pal; //set global palette variable!
	setCSSButtonColors(pal, iButtonHue);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(gridDiv);
	grid.style.backgroundColor = pal[pal.length - 1][0].b;
	idx = 0;
	ihue = 0;
	for (const a of areas) {
		let cb = (a.style.backgroundColor = pal[idx][ihue].b);
		let cf = (a.style.color = pal[idx][ihue].f);
		testHelpers('back', standardize_color(cb));
		let hex = standardize_color(cb);

		let f = complementaryColor(hex);
		a.style.color = f; //nein

		let rgbString = hex2rgb(hex);
		let f2 = getTextColor(rgbString);
		a.style.color = f2; //noch schlechter!

		let f3 = niceColor(rgbString);
		a.style.color = f3;

		let f4 = blackOrWhite(cb);
		a.style.color = f4; //geht

		let f5 = idealTextColor(hex);
		a.style.color = f5; //geht

		idx += 1;
		if (idx >= pal.length - 2) idx = 0;
		ihue = (ihue + 1) % pal[0].length;
		if (idx % pal[0].length == 0) ihue = (ihue + 1) % pal[0].length;
	}
}
//endregion

//#region set and tuple helpers
function expandX(e) {
	console.log('e',e)
	let res = [];
	let e2 = expandX1(e);
	console.log('e2',e2)

	for (const el of e2) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function is_Set(x) {
	return '_set' in x;
}
function isNumeric(x) {
	return !isNaN(+x);
}
function isActionElement(x) {
	return typeof x == 'object' && 'type' in x;
}
function isLiteral(x) {
	return isString(x) || $.isNumeric(x);
}
function is_Tuple(x) {
	return isDict(x) && ('_tuple' in x);
}
function extractActions(lst) {
	//console.log(lst);
	let res = [];
	for (const l of lst) {
		if (isListOfActionElements(l)) res.push(l);
		else if (isActionElement(l)) res.push([l]);
		else {
			let r2 = extractStringLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
function cartesi(l1, l2) {
	//l1,l2 are lists of list
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			res.push(el1.concat(el2));
		}
	}
	return res;
}
var cnt=0;
function expandX1(x) {
	console.log('expand1',cnt, x);cnt+=1;
	if (is_Set(x) && x._set.length == 1) return x._set.map(el => expandX1(el));

	if (isDict(x) || isActionElement(x) || isLiteral(x)) return [x];

	if ( is_Tuple(x)) x=x._tuple;

	if (Array.isArray(x)) {
		if (isEmpty(x)) return [];
		let a = expandX1(firstElement(x));
		let b = x.slice(1);
		let c = expandX1(b);
		console.log(c);
		let d = extractActionLists(c);
		console.log('a=', fj(a));
		console.log('b=', fj(b));
		console.log('c=', fj(c));
		console.log('d=', fj(d));
		return flat(cartesi(a,d));
	}
}

function expand(e) {
	console.log('e',e)
	let res = [];
	let e2 = expand1(e);
	console.log('e2',e2)

	for (const el of e2) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function expand1(x) {
	//console.log('expand1', x);
	if (isEmpty(x)) return [];
	if (isLiteral(x)) return [x.toString()];
	if (isActionElement(x)) return [x];
	if (isSingleton(x)) return expand1(firstElement(x));
	if (is_Set(x)) return x._set.map(el => expand1(el));
	if (isSet(x)) return x.set.map(el => expand1(el));
	if (is_Tuple(x)) {
		//console.log('x', x);
		x = x._tuple;
		//console.log('x', x);
		let a = expand1(firstElement(x));
		let b = x.slice(1);
		let c = expand1(x.slice(1));
		let d = extractActionLists(c);
		//console.log('a=', fj(a), 'b=', fj(b), 'c=', fj(c));
		//console.log('d=', fj(d));
		return carteset(a, d);
	}
	if (isTuple(x)) {
		let a = expand1(firstElement(x));
		let b = x.slice(1);
		let c = expand1(x.slice(1));
		//console.log(c);
		let d = extractStringLists(c);
		testHelpers('a=', fj(a), 'b=', fj(b), 'c=', fj(c));
		testHelpers('d=', fj(d));
		return carteset(a, d);
	}
}
function extractUniqueStrings(tupleList) {
	let idlist = [];
	tupleList.map(x => x.map(y => addIf_dep(y, idlist)));
	return idlist;
}
function isSet(x) {
	if (isDict(x)) {
		for (const k in x) {
			if (k == 'set' || k == '_set') return true;
			break;
		}
	}
	return false;
}
function isTuple(x) {
	return Array.isArray(x);
}
function isSingleton(x) {
	return (isSet(x) && 
	 ('set' in x && x.set.length == 1 || '_set' in x && x._set.length == 1)) 
	 || 
	 (isTuple(x) && 
	 ('tuple' in x && x.tuple.length == 1 || '_tuple' in x && x._tuple.length == 1));
}
function firstElement(x) {
	if (isSet(x)) return x.set[0];
	else if (isTuple(x)) return x[0];
	else return null;
}
function isListOfLiterals(lst) {
	if (!isList(lst)) return false;
	for (const el of lst) {
		if (isList(el)) return false;
	}
	return true;
}
function isListOfActionElements(lst) {
	if (!isList(lst)) return false;
	for (const el of lst) {
		if (isList(el)) return false;
	}
	return true;
}
function extractActionLists(lst) {
	//console.log(lst);
	let res = [];
	for (const l of lst) {
		if (isListOfActionElements(l)) res.push(l);
		else if (isActionElement(l)) res.push([l]);
		else {
			let r2 = extractStringLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
function extractStringLists(lst) {
	console.log(lst);
	let res = [];
	for (const l of lst) {
		if (isListOfLiterals(l)) res.push(l);
		else if (isLiteral(l)) res.push([l]);
		else {
			let r2 = extractStringLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
function prex(x) {
	prll(expand(x));
}
//#endregion

//#region string helpers:
function allIntegers(s) {
	//returns array of all numbers within string s
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allNumbers_dep(s) {
	//returns array of all numbers within string s
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allNumbers(s) {
	//returns array of all numbers within string s
	return s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => Number(v));
	// {console.log(v,typeof v,v[0],v[0]=='-',v[0]=='-'?-(+v):+v,Number(v));return Number(v);});
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function eraseSpaces(s) {
	let i = 0;
	while (s.includes('  ')) {
		//testHelpers(i++ + ": ", s);
		s = s.replace('  ', ' ');
		s = s.replace(' {', '{');
		s = s.replace(' (', '(');
		s = s.replace('\n ', ' ');
		s = s.replace('\n{', '{');
		s = s.replace('\n}', '}');
	}
	return s;
}
function endsWith(s, sSub) {
	let i = s.indexOf(sSub);
	return i == s.length - sSub.length;
}
function getLines(s) {
	// returns array of lines in s
	var str = s;
	var res = str.split('\n');
	return res;
}

function firstNumber(s) {
	// returns first number in string s
	return s ? Number(s.match(/-?\d+/).shift()) : -1;
}

function firstPositiveNumber(s) {
	// returns first number in string s
	return s ? Number(s.match(/\d+/).shift()) : -1;
}
function makeString(obj, prop, maxlen = 50, isStart = true) {
	let s = prop + ':';
	if (prop in obj) {
		let s1 = JSON.stringify(obj[prop]);
		if (maxlen > 0) {
			s += isStart ? s1.substring(0, maxlen) : s1.substring(s.length - maxlen);
		} else {
			s += s1;
		}
	} else {
		s += ' not present';
	}
	return s;
}
function makeStrings(obj, props, maxlen = 50, isStart = true) {
	strs = props.map(x => makeString(obj, x)).join('\n');
	return strs;
}
function padSep(sep, n, args) {
	//sep..separator string, n..length of result, args are arbitrary numbers
	s = '';
	for (var i = 2; i < arguments.length; i++) {
		s += arguments[i].toString().padStart(n, '0') + sep;
	}
	return s.substring(0, s.length - 1);
}
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function sameCaseIn(s1, s2) {
	return s1.toLowerCase() == s2.toLowerCase();
}
function startsWith(s, sSub) {
	//testHelpers('startWith: s='+s+', sSub='+sSub,typeof(s),typeof(sSub));
	return s.substring(0, sSub.length) == sSub;
}
function startsWithCaseIn(s, ssub) {
	return startsWith(s.toLowerCase(), ssub.toLowerCase());
}
function stringAfter(sFull, sSub) {
	//testHelpers('s='+sFull,'sub='+sSub)
	let idx = sFull.indexOf(sSub);
	//testHelpers('idx='+idx)
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return last(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - last(parts).length - 1);
}
function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}

//#endregion

//#region test helpers
var activatedTests = [];
function activateTests(commaSepString) {
	addIfComma(commaSepString, activatedTests);
}
function testGSM() {
	if (activatedTests.includes('GSM')) {
		console.log(...arguments);
	}
}
function testHelpers() {
	if (activatedTests.includes('helpers')) {
		console.log(...arguments);
	}
}
function testHexgrid() {
	if (activatedTests.includes('hexgrid')) {
		console.log(...arguments);
	}
}
function testMS_fine() {
	if (activatedTests.includes('MS_fine')) {
		console.log(...arguments);
	}
}

//#endregion

//#region type and conversion helpers
function getTypeOf(param) {
	let type = typeof param;
	testHelpers('typeof says:' + type);
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		testHelpers(type, startsWith(type, 'SVG'));
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	testHelpers('this param is of type: ' + type);
	testHelpers(param);
	return type;
}
function isEvent(param) {
	return getTypeOf(param) == 'event';
}
function isString(param) {
	return typeof param == 'string';
}
function isMS(param) {
	return getTypeOf(param) == 'MS';
}
function isNumber(param) {
	return !isNaN(Number(param));
}
function convertToMS(p) {
	let res = undefined;
	if (isMS(p)) {
		//testHelpers("convertToMS: isMS ", p);
		res = p;
	} else if (isEvent(p)) {
		//testHelpers("convertToMS: isEvent ", p);
		p = p.target;
		res = findParentWithId(p);
		res = MS.byId[res.id];
	} else if (isString(p)) {
		//assume that this is the id
		//testHelpers("convertToMS: isString ", p);
		res = MS.byId[p];
	} else {
		//assume some ui element
		//testHelpers("convertToMS: else ", res);
	}
	//testHelpers("convertToMS: RESULT=", res);
	return res;
}

//#endregion

// #region zooming
function deltaTransformPoint(matrix, point) {
	var dx = point.x * matrix.a + point.y * matrix.c + 0;
	var dy = point.x * matrix.b + point.y * matrix.d + 0;
	return { x: dx, y: dy };
}
function decomposeMatrix(matrix) {
	// @see https://gist.github.com/2052247

	// calculate delta transform point
	var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
	var py = deltaTransformPoint(matrix, { x: 1, y: 0 });

	// calculate skew
	var skewX = (180 / Math.PI) * Math.atan2(px.y, px.x) - 90;
	var skewY = (180 / Math.PI) * Math.atan2(py.y, py.x);

	return {
		translateX: matrix.e,
		translateY: matrix.f,
		scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
		scale: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		skewX: skewX,
		skewY: skewY,
		rotation: skewX // rotation is the same as skew x
	};
}
function getTransformInfo(gElement) {
	testHelpers(gElement);
	var matrix = gElement.getCTM();
	let info = decomposeMatrix(matrix);
	return info;
}
function getZoomFactor(gElement) {
	//var m = gElement.getAttribute("transform");
	var matrix = gElement.getCTM();
	let info = decomposeMatrix(matrix);
	return info.scale;
	// testHelpers(x.scale);
}
//#endregion zooming
