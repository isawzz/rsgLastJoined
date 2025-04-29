function atleastOneElementOfXIsDictWithKey(lst,k) {
	for (const x of lst) { if (!x) continue; if (isDict(x) && k in x) return true; }
	return false;
}
function isListOf(x,key='_obj') {
	return isList(x) && !empty(x) && atleastOneElementOfXIsDictWithKey(x,key); //isDict(x[0]) && '_obj' in x[0];
}
function tableElemY(o, keys) {
	let t = document.createElement('table');
	t.classList.add('tttable');
	let refs = [];//collect references to objects and players inside of table {oids:[oids],clid:clid,type:'p'|'t'} => parts
	let s = '';
	for (const k in o) {
		if (isdef(keys) && !keys.includes(k)) continue;
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];
		let sval = null;
		if (isListOf(val,'_obj')) {
			//if (is_Set(val)) val=val._set;
			//console.log(val)
			let cl = 't_r_' + getUID(); let ref = { oids: val.filter(x => isdef(x)).map(x => x._obj), id: cl }; refs.push(ref);
			sval = `<div id=${cl} class='up10 hallo'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		} else if (val && isDict(val) && '_obj' in val) {
			let cl = 't_r_' + getUID(); let ref = { oids: [val._obj], id: cl }; refs.push(ref);
			sval = `<div id=${cl} class='up10 hallo'>${val._obj.toString()}</div>`;
		} else if (val && isDict(val) && '_ndarray' in val) {
			let rows = val._ndarray;
			sval = `<div>`;
			let rowClass='up2 hallo';
			for (const row of rows) {
				let cl = 't_r_' + getUID(); let ref = { oids: row.filter(x => isdef(x)).map(x => x._obj), id: cl }; refs.push(ref);
				sval += `<div id=${cl} class='${rowClass}'>${row.map(x => !x ? '_' : x._obj).toString()}</div><br>`;
				rowClass='hallo';
			}
			sval += '</div>';
		} else if (val && isDict(val) && '_player' in val) {
			let cl = 'p_r_' + getUID(); let ref = { oids: [val._player], id: cl }; refs.push(ref);
			sval = `<div id=${cl} class='up10 hallo'>${val._player.toString()}</div>`;
		} 
		if (!sval) {
			//console.log(val);
			sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? tableHTMLY(val, refs) : simpleRep(val);
		}
		//if (!sval) sval = isDict(val) ? tableHTMLY(val, refs) : simpleRep(val);
		s += sval + '</td>';
	}
	t.innerHTML = s;
	return { table: t, refs: refs };
}
function tableHTMLY(o, refs) {
	let s = '<table class="tttable up10">';
	for (const k in o) {
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];

		let sval = null;
		if (isListOf_Obj(val)) {
			let cl = 't_r_' + getUID(); let ref = { oids: val.filter(x => isdef(x)).map(x => x._obj), id: cl }; refs.push(ref);
			sval = `<div class='up10 hallo'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		} else if (val && isDict(val) && '_obj' in val) {
			let cl = 't_r_' + getUID(); let ref = { oids: [val._obj], id: cl }; refs.push(ref);
			sval = `<div class='up10 hallo'>${val._obj.toString()}</div>`;
		}

		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? tableHTMLY(val, refs) : simpleRep(val);
		s += sval + '</td>';
	}
	s += '</table>';
	return s;
}


function tableElemX(o, keys) {
	let t = document.createElement('table');
	t.classList.add('tttable');
	let refs = [];//collect references to objects and players inside of table {oids:[oids],clid:clid,type:'p'|'t'} => parts
	let s = '';
	for (const k in o) {
		if (isdef(keys) && !keys.includes(k)) continue;
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];
		let sval = null;
		if (isListOf_Obj(val)) {
			//if (is_Set(val)) val=val._set;
			//console.log(val)
			let cl = 't_r_' + getUID(); let ref = { oids: val.filter(x => isdef(x)).map(x => x._obj), id: cl }; refs.push(ref);
			sval = `<div id=${cl} class='up10 hallo'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		} else if (val && isDict(val) && '_obj' in val) {
			let cl = 't_r_' + getUID(); let ref = { oids: [val._obj], id: cl }; refs.push(ref);
			sval = `<div id=${cl} class='up10 hallo'>${val._obj.toString()}</div>`;
		} else if (val && isDict(val) && '_ndarray' in val) {
			let rows = val._ndarray;
			sval = `<div>`;
			let rowClass='up2 hallo';
			for (const row of rows) {
				let cl = 't_r_' + getUID(); let ref = { oids: row.filter(x => isdef(x)).map(x => x._obj), id: cl }; refs.push(ref);
				sval += `<div id=${cl} class='${rowClass}'>${row.map(x => !x ? '_' : x._obj).toString()}</div><br>`;
				rowClass='hallo';
			}
			sval += '</div>';
		} else if (val && isDict(val) && '_player' in val) {
			let cl = 'p_r_' + getUID(); let ref = { oids: [val._player], id: cl }; refs.push(ref);
			sval = `<div id=${cl} class='up10 hallo'>${val._player.toString()}</div>`;
		} 
		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? tableHTMLX(val, refs) : simpleRep(val);
		s += sval + '</td>';
	}
	t.innerHTML = s;
	return { table: t, refs: refs };
}
function tableHTMLX(o, refs) {
	let s = '<table class="tttable up10">';
	for (const k in o) {
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];

		let sval = null;
		if (isListOf_Obj(val)) {
			let cl = 't_r_' + getUID(); let ref = { oids: val.filter(x => isdef(x)).map(x => x._obj), id: cl }; refs.push(ref);
			sval = `<div class='up10 hallo'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		} else if (val && isDict(val) && '_obj' in val) {
			let cl = 't_r_' + getUID(); let ref = { oids: [val._obj], id: cl }; refs.push(ref);
			sval = `<div class='up10 hallo'>${val._obj.toString()}</div>`;
		}

		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? tableHTMLX(val, refs) : simpleRep(val);
		s += sval + '</td>';
	}
	s += '</table>';
	return s;
}

function tableElem(o, keys) {
	let t = document.createElement('table');
	t.classList.add('tttable');
	let s = '';
	for (const k in o) {
		if (isdef(keys) && !keys.includes(k)) continue;
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];
		let sval = null;
		if (isListOf_Obj(val)) {
			sval = `<div class='up10 hallo'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		} else if (val && isDict(val) && '_obj' in val) {
			sval = `<div class='up10 hallo'>${val._obj.toString()}</div>`;
		}
		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? tableHTML(val, 4) : simpleRep(val);
		s += sval + '</td>';
	}
	t.innerHTML = s;
	return t;
}
function tableHTML(o) {
	let s = '<table class="tttable up10">';
	for (const k in o) {
		s += '<tr><th>' + k + '</th><td>';
		let val = o[k];

		let sval = null;
		if (isListOf_Obj(val)) sval = `<div class='up10 hallo'>${val.map(x => !x ? '_' : x._obj).toString()}</div>`;
		else if (val && isDict(val) && '_obj' in val) sval = `<div class='up10 hallo'>${val._obj.toString()}</div>`;

		if (!sval) sval = isSet(val) ? empty(val._set) ? '{ }' : simpleRep(val) : isDict(val) ? tableHTML(val) : simpleRep(val);
		s += sval + '</td>';
	}
	s += '</table>';
	return s;
}

function makeMainVisual(oid, o) {
	//examples are: building(road,settlement), robber
	//main objects are only made if loc on board element!
	//console.log(oid, o);
	//depending on size, will be labeled w/ any simple field val, or oid if none
	if (!('loc' in o) || !isBoardElement(o.loc._obj)) return null;

	let id = 'm_t_' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let locElem = getVisual(o.loc._obj);
	let parent = UIS[locElem.idParent]; //board should be parent, not board element!!!
	//console.log('parent', parent);
	//console.log('locElem', locElem);

	let idParent = parent.id;
	ms.idParent = idParent;
	parent.children.push(id);

	ms.o = o;
	ms.isa.movable = 'loc'; //pieces have location! if location changes a piece must change its parent!!! 

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;

	let color = getColorHint(o);
	//console.log('isEdge',locElem.isa.edge)
	//if (locElem.isa.edge) console.log(locElem.w,locElem.h,locElem)
	let [w, h] = locElem.isa.corner ? [locElem.w/2, locElem.h/2]
		: locElem.isa.field ? [locElem.w / 4, locElem.h / 4] : [locElem.thickness+2, locElem.thickness+2];
	let [x, y] = [locElem.x, locElem.y];
	ms.ellipse({ w: w, h: h, fill: color }); ms.setPos(x, y); ms.attach();//.text('hallo').attach();

	return ms;

}
function decorateVisual(ms, { draw = true, rings = 3, bg = 'darkslategray', fg = 'lime', label, shape = 'circle', palette, ipal, fill, x = 0, y = 0, w = 25, h = 25, sPoints, border = 'green', thickness = 1, rounding, path, txt, fz = 12, sz, overlay = true } = {}) {
	console.log('decorate', ms)
	let options = {};
	let labelOptions = {};
	if (palette && ipal) fill = palette[ipal];
	else if (ipal) fill = S.pal[ipal];
	if (bg) ms.setBg(bg);
	if (fg) { ms.setFg(fg); }
	if (fill) options.fill = fill;
	if (x) options.x = x;
	if (y) options.y = y;
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
	if (txt) { options.txt = txt; labelOptions.txt = txt; }
	if (label) { labelOptions.txt = label; }
	if (fz) { options.fz = fz; labelOptions.fz = fz; }
	if (sPoints) options.sPoints = sPoints;
	if (border) options.border = border;
	if (thickness) options.thickness = thickness;
	if (rounding) options.rounding = rounding;
	if (path) options.path = './assets/images/transpng/' + path + '.png';
	if (rings) {
		//console.log('rings',rings);
	} else rings = 1;
	dSize = Math.max(w / 6, 5);
	for (let i = 0; i < rings; i++) {
		switch (shape) {
			case 'circle':
				ms.circle(options);
				break;
			case 'hex':
				ms.hex(options);
				break;
			case 'rect':
				ms.rect(options);
				break;
			case 'poly':
				ms.poly(options);
				break;
			case 'image':
				ms.image(options);
				break;
			case 'text':
				ms.text(options);
				break;
			default:
				return null;
		}
		options.w -= dSize;
		options.sz -= dSize;
		options.h -= dSize;
		//console.log(options);
		//options.fill=colorLighter(options.fill);
	}
	if (label) {
		ms.text(labelOptions);
	}
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
	if (overlay) {
		overlayOptions = jsCopy(options);
		overlayOptions.className = 'overlay';
		delete overlayOptions.fill;
		delete overlayOptions.path;
		switch (shape) {
			case 'circle':
				ms.circle(overlayOptions);
				break;
			case 'hex':
				ms.hex(overlayOptions);
				break;
			case 'rect':
				ms.rect(overlayOptions);
				break;
			case 'poly':
				ms.poly(overlayOptions);
				break;
			case 'image':
				ms.rect(overlayOptions);
				break;
			case 'text':
				ms.text(overlayOptions);
				break;
			default:
				return null;
		}
	}
	if (draw) ms.attach();
	return ms;
}
// function getPos(el) {
// 	var rect=el.getBoundingClientRect();
// 	return {x:rect.left,y:rect.top};
// }
// var TTTT=null;var TTMS=null;
// function delayShowTT(ms){
// 	console.log('delayShowTT');
// 	TTTT=setTimeout(()=>attachMouseoverHandler(ms,showTT),400);
// }
// function attachMouseoverHandler(ms,handler){
// 	if(ms.isa.board)return;
// 	console.log('attachMouseoverHandler',ms.id)
// 	TTMS=ms;
// 	$(ms.elem).mouseover(handler);
// }
function showTT(ev){
	if (TTMS){

		$(TTMS.elem).off('mouseover');
		console.log('hallo')
		let d=document.getElementById('tooltip');
		clearElement(d);
		let t=tableElem(TTMS.o);
		d.appendChild(t);
		$('div#tooltip').css({
			display: 'inline-block',
			top: ev.pageY, //clientY-dy+ms.h,//e.pageY, //clientY,
			left: ev.pageX, //clientX-dx+ms.w, //e.pageX, //clientX,
			//width: '300px',
			//height: '300px'
		});
		TTMS=null;
	}
}
function hideTT(){ clearTimeout(TTTT);$('div#tooltip').css({	display: 'none'});}
