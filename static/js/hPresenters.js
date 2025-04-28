//#region v1
function highlight(x){
	let msList = getVisuals(x);
	//console.log('msList',msList.map(x=>x.id))
	for(const ms of msList){
		ms.high();
	}
}
function createHandler( param , func) {
  return function(ev) {
		let id = evToId(ev);//ev.fromElement.id;
		console.log( param ,'and',id);
		param.push(getOid(id));
		for(const oid of param){
			getDefVisual(oid)[func]();
		}
  }
}
function linkElement(s){//,oids=[]){
	//console.log('linking',s)
	let el=document.createElement('div');
	el.style.backgroundColor='dimgray';
	el.innerHTML = s;
	el.onmouseenter = ()=>highlightContentIds(el);// createHandler( oids,'high' );
	el.onmouseleave = ()=>unhighlightContentIds(el);//createHandler( oids,'unhigh' );
	return el;
}
function specialTableElem(o, keys) {
	let t = document.createElement('table');
	t.classList.add('tttable');
	let s = '';
	for (const k in o) {
		if (isdef(keys) && !keys.includes(k)) continue;
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];
		let sval = null;
		if (isListOf_Obj(val)) {
			//sval = `<button class='obj' onclick='onClickListOfObj(this);'>${val.map(x => !x ? '_' : x._obj).toString()}</button>`;
			sval = `<div class='obj' onmouseenter='highlightContentIds(this);' onmouseleave='unhighlightContentIds(this);'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		} else if (val && isDict(val) && '_obj' in val) {
			sval = `<button onclick='onClickListOfObj(this);'>${val._obj.toString()}</button>`;
		}
		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? specialTreee2(val, 4) : simpleRep(val);
		s += sval + '</td>';
	}
	t.innerHTML = s;
	return t;
}
function specialTreee2(o) {
	let s = '<table class="tttable up10">';
	for (const k in o) {
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];

		let sval = null;
		if (isListOf_Obj(val)) sval = `<button onclick='onClickListOfObj(this);'>${val.map(x => !x ? '_' : x._obj).toString()}</button>`;
		else if (val && isDict(val) && '_obj' in val) sval = `<button onclick='onClickListOfObj(this);'>${val._obj.toString()}</button>`;

		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? specialTreee2(val) : simpleRep(val);
		s += sval + '</td>';
	}
	s += '</table>';
	return s;
}
function isListOf_Obj(x) {
	return isList(x) && !empty(x) && atleastOneElementOfXIsDictWithKey_obj(x); //isDict(x[0]) && '_obj' in x[0];
}
function atleastOneElementOfXIsDictWithKey_obj(lst) {
	for (const x of lst) { if (!x) continue; if (isDict(x) && '_obj' in x) return true; }
	return false;
}
function highlightContentIds(b){

	let s=b.innerHTML;
	let ids = s.split(/[ ,:;]+/);// s.split(/[,;:]/);
	for(const id of ids){
		//console.log('id:',id)
		if (id=='_') continue;
		let msList=getVisuals(id);
		for(const ms of msList)ms.high();
	}
//	console.log('highlight',ids.toString());
}
function unhighlightContentIds(b){
	let s=b.innerHTML;
	let ids = s.split(/[ ,:;]+/);// s.split(/[,;:]/);
	for(const id of ids){
		//console.log(id)
		if (id=='_') continue;
		let msList=getVisuals(id);
		if (!msList) continue;
		//console.log(msList)
		for(const ms of msList)ms.unhigh();
	}
//	console.log('highlight',ids.toString());
}

function onClickListOfObj(b) {
	console.log('clicked', b.textContent);
}

//#region rest
function maxFit(olist, prop, min, max) {
	//return max of prop vals of olist within range of min,max
	let res = 0;
	for (const d of olist) {
		////console.log(d.offsetWidth,d.offsetHeight,d[prop])
		res = Math.max(res, d[prop]);
	}
	if (res < min) res = min; else if (res > max) res = max;
	return res;
}
function sumProp(olist, prop) {
	let res = 0;
	for (const d of olist) {
		////console.log(d.offsetWidth,d.offsetHeight,d[prop])
		res += d[prop];
	}
	return res;
}
function makeColumns(dParent, divList, wFit, hFit, yStart) {
	// let pl = document.createElement('div');
	// pl.style='display:flex;flex-direction:row;';

	let h = maxFit(divList, 'offsetHeight', 0, hFit);
	let wmax = maxFit(divList, 'offsetWidth', 0, wFit);
	let w = sumProp(divList, 'offsetWidth');
	if (w > wFit) {
		h = Math.min(h + 20, hFit);
		dParent.style.overflow = 'auto';
	}

	//berechne hor leftover space if any
	let hPlus = hFit - h;

	//check if actually can make all of the divs same size!
	let margin = '5';
	let wIdeal = (wFit / divList.length) - (divList.length + 1) * margin;
	if (wIdeal >= wmax) wmax = wIdeal;
	//if (wmax <= wIdeal) 

	let wPlus = wFit - (wmax * divList.length);
	let dy = hPlus / 3;
	let dx = wPlus / (divList.length + 1);
	//console.log('h',h,'w',w,'wFit',wFit,'hFit',hFit,'dx',dx,'dy',dy)

	let x = dx;
	let y = dy + yStart;

	for (const div of divList) {
		div.style = `height:${h}px;width:${wmax}px;background-color:dimgrey;position:absolute;left:${x}px;top:${y}px`;
		x += dx + wmax;
		// pl.appendChild(div);
	}
	// //compute max height of them
}
function title_tableDiv_bounds(dParent, title, o) {
	let [d, t, w, h] = o_tableDiv_bounds(dParent, o);
	////console.log(d, t, w, h);

	let ti = document.createElement('p');
	ti.innerHTML = title;
	t.prepend(ti);

	return [d, d.offsetWidth, d.offsetHeight];
}
function o_tableDiv_bounds(divParent, o) {
	let html = treee(o);
	let dNew = document.createElement('div');
	dNew.style.float = 'left';
	dNew.innerHTML = html;
	let table = dNew.firstChild;
	divParent.appendChild(dNew); //innerHTML = table;
	////console.log('spaaaaaaaaaaaaaaace', dNew.offsetHeight)
	////console.log('spaaaaaaaaaaaaaaace', dNew.offsetWidth)
	return [dNew, table, dNew.offsetWidth, dNew.offsetHeight];
}
function getFloatLeftDiv() {
	let d = document.createElement('div');
	d.style.float = 'left';
	return d;
}
function addColumn(dParent, o, keys) {
	console.log('addColumn', dParent)
	let d = getFloatLeftDiv();
	console.log('d', d)
	let t = tableElem(o, keys);
	//t.style.float = 'left';
	d.appendChild(t);
	dParent.appendChild(d);
	//let m=addMargin(dpa,dch);
	dParent.style.backgroundColor = 'dimgray';
	//console.log(vis.elem)
	return [d, t];
}
function tableElem(o, keys) {
	let t = document.createElement('table');
	t.classList.add('tttable');
	let s = '';
	for (const k in o) {
		if (o.symbol) console.log('--------------------------------k',k)
		if (isdef(keys) && !keys.includes(k)) continue;
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];
		if (o.symbol) console.log('val',val)
		let sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? treee(val) : simpleRep(val);
		s += sval + '</td>';
	}
	if (o.symbol) console.log(s)
	t.innerHTML = s;
	return t;
}
function treee(o) {
	let s = '<table class="tttable">';
	for (const k in o) {
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];
		let sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? treee(val) : simpleRep(val);
		s += sval + '</td>';
	}
	s += '</table>';
	return s;
}
function presentNicely(oid, pool, ms) {
	let o_new = pool[oid];
	let akku = [];
	for (const prop in o_new) {
		let nval = o_new[prop];
		let sval = simpleRep(nval);
		akku.push(prop + ':' + sval);
	}
	ms.multitext({ txt: akku, fz: 12, fill: 'black' });
}
function presentAllProps(oid, pool, ms) {
	let o_new = pool[oid];
	let akku = [];
	for (const prop in o_new) {
		let nval = o_new[prop];
		let sval = simpleRep(nval);
		akku.push(prop + ':' + sval);
	}
	ms.multitext({ txt: akku, fz: 12, fill: 'black' });
}
function dots(ms, n, { UL = false, UR = true, sz = 10, pos, dir, colors } = {}) {
	//ms.removeFromChildIndex(5);
	let dim = ms.bounds;
	let x, y, dx, dy;
	if (UR) {
		if (nundef(sz)) sz = dim.h / (2 * n);
		x = dim.w / 2 + -2 * sz;
		y = -dim.h / 2 + 2 * sz;
		dx = 0;
		dy = 2 * sz;
	} else if (UL) {
		return;
	}
	////console.log(dim, x, y, dx, dy);
	for (let i = 0; i < n; i++) {
		let color = isdef(colors) ? colors[i] : ms.fg;
		ms.circle({ sz: sz, x: x, y: y, fill: color });
		x += dx;
		y += dy;
	}
}
function presentVisible(id, ms, o_new, o_old, options) {
	let visPlayers = getVisibleList(o_new);
	let visColors = visPlayers.map(x => G.players[x].color);
	dots(ms, visColors.length, { UL: false, UR: true, colors: visColors });
}
function presentPlayer(id, ms, o_new, o_old, options) {
	let res = {};
	if (isdef(G.player)) res.color = G.players[G.player].color;
	return res;
}
//#endregion