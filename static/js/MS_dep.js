//domType:cat
const MSCATS = { rect: 'g', g: 'g', circle: 'g', text: 'g', polygon: 'g', line: 'g', body: 'd', svg: 'd', div: 'd', p: 'd', table: 'd', button: 'd', a: 'd', span: 'd', image: 'd', paragraph: 'd', anchor: 'd' };
//rsgTypes: a=area,b=boat,c=chrome,d=def,m=main,n=none,r=root,s=struct,t=test,x=aux
//IdOwnerTypes: a=actions,d=dom,p=players,s=spec,t=table

//id: rsgType_IdOwnerType_oidOrCounter
//ms parts cannot have id!!!! (they use name instead!names do not have to be unique)
//evToId always works!
//id[0] tells rsgType, id[2] tells IdOwnerType, id.substring(4) is oid or counter
//		oid for IdOwnerType table,players,spec 

//alles lazy
//id vergabe in MS
//relatives handling in MS
//am haeufigsten werden boats created,dann kommt m
function _setIsa(ms,o){
	listKey(ms,'isa',o.obj_type);
	for (const d in isa) {
		if (d == 'id') { continue; }
		ms[d] = isa[d];
	}
}
function _createDom(domType){

}
class MS {
	constructor({ parent, id, type = 'g', domel = null, isa = {} } = {}) {
		// this._setTypeAndId(id, type, domel);
		if (domel) {
			if (domel.id == 'R_d_root') {
				this.handlers = { click: {}, mouseenter: {}, mouseleave: {} }; this.parent = null; this.id = 'R_d_root'; this.type = 'div'; this.cat = 'd'; this.elem = domel; this.parts = { _: this.elem }; this.children = []; return;
			}
			// console.log('domel',domel);
			// console.log(domel.parentNode)
			// console.log(domel.parentNode.id)
			this.id = domel.id;
			this.type = getTypeOf(domel);
			this.parent = UIS[domel.parentNode.id];
			// console.log('testing create ms from domel:', this.id, this.type, this.parent.id);
		} else {
			this.id = nundef(id) ? getUID() : id;
			this.type = type;
			this.parent = parent;
		}
		UIS[this.id] = this;
		this.cat = MSCATS[this.type]; //'d' for dom els and 'g' for svg els
		//console.log(this.id)

		// this._setElem(domel);
		this.elem = domel ? domel
			: this.cat == 'g' || this.type == 'svg' ? document.createElementNS('http://www.w3.org/2000/svg', this.type)
				: document.createElement(this.type);
		this.elem.ms = this; //back link to MS : careful!!!! cyclic! never ever recurse on MS without guard!!!
		this.elem.id = this.id;
		//console.log(this.elem.id)
		//console.log(this.id)

		// this._setParentChildren(parent, domel);
		if (nundef(this.parent)) this.parent = ROOT; //parent is an MS element!!!!!!!
		this.children = [];
		this.posRef = this.parent; //ref is reference to parent sizing/pos info if needed!
		if (this.cat == 'd' && this.parent.cat == 'g') {
			//problem 1: d el cannot have g parent! >>> parent will be nearest ancestor div, posRef will be g
			let ancestor = closestParent(parent.elem, 'div');
			console.log('FOUND domParent:', ancestor);
			this.posRef = this.parent;
			this.parent = ancestor.ms;
		} else if (this.parent.cat == 'd' && this.parent.type != 'svg' && this.cat == 'g') {
			//problem 2: g el cannot have d parent ausser wenn parentTye svg ist!! >>> create in between noname svg
			//console.log('case 2: g on d', this.id, this.parent.id)
			let msSvg = new MMS({ parent: this.parent, type: 'svg' }).setDefaults().attach();
			this.parent = msSvg;
			this.posRef = msSvg; //CHECK: ob das correct!!!
		}
		if (domel) { addIf(this.parent.children, this); } //domel is already attached!

		//console.log('HAAAAAAAAAAAALLLLLLLLLLOOOOOOOOOOOOO',this.id)
		this.x = 0; this.y = 0; this.w = 0; this.h = 0;

		for (const d in isa) {
			if (d == 'id') { continue; }//console.log(d,isa[d]);continue;}
			this[d] = isa[d];			//console.log(d,this)
		}
		this.isa = Object.keys(isa); //rsg types, eg., boat

		//console.log(this.id)
		this.parts = { _: this.elem }; //named uis, eg.: 'table'
		this.uis = []; //if has other unrelated uis, dont know if need this?

		this.handlers = { click: {}, mouseenter: {}, mouseleave: {} };

		//console.log(this.id)
	}
	//#region events
	_handler(ev) {
		ev.stopPropagation();
		if (!this.isEnabled) return;
		let part = ev.currentTarget;
		let partName = isdef(part.name) ? part.name : '_';
		let eventName = ev.handleObj.origType;

		let handler = this.handlers[eventName][partName];
		if (isdef(handler)) { counters[eventName] += 1; counters.events += 1; handler(this, part); }
	}
	addHandler(evName, partName = '_', handler = null, autoEnable = true) {
		//console.log('ccccccc  addHandler!!!!',evName, this.parts, partName,this.parts[partName])
		let part = this.parts[partName];
		//console.log(part)
		if (nundef(part)) { part = this.elem; partName = '_'; } //return;
		//console.log(part,partName);
		if (isdef(handler)) { this.handlers[evName][partName] = handler; }
		$(part).off(evName).on(evName, this._handler.bind(this));
		if (autoEnable) this.enable();
	}
	addClickHandler(partName = '_', handler = null, autoEnable = true) { this.addHandler('click', partName, handler, autoEnable); }
	addMouseEnterHandler(partName = '_', handler = null, autoEnable = true) { this.addHandler('mouseenter', partName, handler, autoEnable); }
	addMouseLeaveHandler(partName = '_', handler = null, autoEnable = true) { this.addHandler('mouseleave', partName, handler, autoEnable); }
	removeEvents() {
		$(this.elem).off();
		if (S_showEvents) this.showEvents(this.elem);
		for (const partName in this.parts) {
			$(this.parts[partName]).off();
			if (S_showEvents) this.showEvents(this.parts[partName]);
		}
	}
	//#endregion

	//#region done
	clear(startProps = {}) {
		let ids = this.children.map(x => x.id);
		for (const id of ids) UIS[id].destroy();
		//clearElement(this.elem);
		for (const k in startProps) {
			this.elem[k] = startProps[k];
		}
		console.log('children after clear', this.children);
	}
	destroy() {
		$(this.elem).remove(); // removes element and all its handlers from UI
		this.elem = null;
		removeInPlace(this.parent.children, this);
		delete UIS[this.id];
	}
	//#endregion

	//#region work

	title(s, key = 'title') {
		if (this.parts[key]) {
			//console.log('HALLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', this.parts[key], this.elem); 
			this.parts[key].style.backgroundColor = randomColor();
			return;
		}
		let t = document.createElement('div');
		t.style.backgroundColor = 'dimgray';
		this.titleColor = t.style.backgroundColor;
		t.classList.add('tttitle');
		t.innerHTML = s;
		this.elem.appendChild(t);
		this.parts[key] = t;
		t.name = key;
		this.attach();
		//console.log(this.parts)
		return this;
	}
	table(o, keys, key = 'table') {
		if (this.parts[key]) {
			let oldTable = this.parts[key];
			let t = tableElem(o, keys);
			let t2 = t.innerHTML;
			oldTable.innerHTML = t2;
		} else {
			let t = tableElem(o, keys);
			this.elem.appendChild(t);
			this.attach();
			this.parts[key] = t;
			t.name = key;
		}

		return this;
	}

	//#endregion

	//#region TODO

	//check ob children ueberhaupt verwendet wird und wie, und ob ich es lieber mit id verwenden soll
	attach() { if (!this.isAttached) { addIf(this.parent.children, this); this.parent.elem.appendChild(this.elem); } return this; } //need to attach() elems that didnt exist OR are NOT g on div!!! in order fr them to appear on screen!
	detach() { if (this.isAttached) { removeIf(this.parent.children, this); this.parent.elem.removeChild(this.elem); } return this; }

	_onMouseEnter(ev) {
		//console.log('mouseEnter', this.id, this.isEnabled, this.mouseEnterHandler);
		if (!this.isEnabled) return;

		let partName = evToId(ev);
		if (S_showEvents) {
			counters.events += 1;
			//console.log('' + counters.events, 'enter', this.id, 'part=' + partName, this.isEnabled, this.mouseEnterHandler ? this.mouseEnterHandler.name : 'no handler');
		}

		if (typeof this.mouseEnterHandler == 'function') {
			if (S_showEvents) //console.log('calling mouseEnterHandler');
				this.mouseEnterHandler(ev);
		}
	}
	_onMouseLeave(ev) {
		//testGSM('mouseLeave', this.id, this.isEnabled, this.mouseLeaveHandler);
		if (!this.isEnabled) return;

		let partName = evToId(ev);
		if (S_showEvents) {
			counters.events += 1;
			//console.log('' + counters.events, 'leave', this.id, partName, this.isEnabled, this.mouseLeaveHandler ? this.mouseLeaveHandler.name : 'no handler');
		}

		if (typeof this.mouseLeaveHandler == 'function') {
			if (S_showEvents) //console.log('calling mouseLeaveHandler');
				this.mouseLeaveHandler(ev);
		}
	}
	_getRect(x = 0, y = 0, w = 50, h = 25, bg, fg) {
		//creates a rect as part of elem
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', x);
		r.setAttribute('y', y);
		if (isdef(bg)) r.setAttribute('fill', bg);
		if (isdef(fg)) r.setAttribute('stroke', bg);
		return r;
	}
	_getDiv(x, y, w, h, bg, fg) {
		let r = document.createElement('div');
		//problem: if part does NOT fit into ms (only the case with divs!), expand ms!
		if (this.w < w || this.h < h) { this.setSize(w, h); }
		if (isdef(x)) {
			//console.log('YES x defined!!!!!!!!', x)
			r.style.position = 'absolute';
			r.style.left = x + 'px';
			r.style.top = y + 'px';
		}
		//need to define overflow property!!!
		if (isdef(w)) {
			r.style.width = w + 'px';
			r.style.height = h + 'px';
			//r.innerHTML='hallohallo hallo hallo hallo ssssssssssss';
		}
		if (isdef(bg)) r.style.backgroundColor = bg;
		if (isdef(fg)) r.style.color = fg;
		return r;
	}
	addInteractivity(partName, hover = true, click = true) {
		let part = this.parts[partName];
		if (nundef(part)) { part = this.elem; } //console.log('!!!!!!!!!!!!no such part', partName); return; }

		//interactivity: muss jetzt auch fuer divs gehen und muss fuer parts of ms gehen!
		//console.log(this, partName, this.part, getFunctionCallerName());
		if (this.part.isInteractive) return;
		this.part.isInteractive = true;
		if (click) this.part.clickHandler = null;
		if (hover) { this.part.mouseEnterHandler = null; this.part.mouseLeaveHandler = null; }
		this.isEnabled = false;
		this.enable = () => this.isEnabled = true;
		this.disable = () => this.isEnabled = false;
		this.elem.addEventListener('click', this._onClick.bind(this));
		this.elem.addEventListener('mouseenter', this._onMouseEnter.bind(this));
		this.elem.addEventListener('mouseleave', this._onMouseLeave.bind(this));
		return this;
	}
	enable() {
		this.isEnabled = true;
	}
	disable() {
		this.isEnabled = false;
	}
	high() {
		if (isdef(this.parts) && isdef(this.parts.title)) this.parts['title'].style.backgroundColor = '#ccff00';
		else {
			this.elem.classList.add('selected');
			this.elem.backgroundColor = '#ccff00';
		}
	} //console.log('highlight', this.id); 

	unhigh() {
		if (isdef(this.parts) && isdef(this.parts.title)) this.parts['title'].style.backgroundColor = this.titleColor;
		else {
			this.elem.classList.remove('selected');
			this.elem.backgroundColor = this.titleColor;
		}
		// this.parts['title'].style.backgroundColor = this.titleColor; 
	}
	sel() { }
	unsel() { }
	frame() { }
	unframe() { }

	setDefaults({ x, y, w, h, bg, fg } = {}) {
		//problem 3: wenn das ein g ist kann ich keinen bg setzen: >>>ist es ein fullSize g on div dann sollte bg auf svg setzen!!!!
		//console.log(this,x,y,w,h,bg,fg)
		if (this.parent.type == 'svg' && isdef(bg) && nundef(w) && nundef(h) && this.domType == 'g') {
			//console.log('case 3: g on d no positioning: svg should get bg!!!')
			this.parent.setBg(bg);
		} else {
			if (isdef(bg) || this.cat == 'd') {
				bg = nundef(bg) ? 'transparent' : bg;
				this.setBg(bg);
				fg = nundef(fg) ? bg == 'transparent' ? this.parent.fg : colorIdealText(bg) : fg;
				this.setFg(fg);
			}
		}

		//if it is a div, there are no default size and pos!
		//console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&setDefaults vorher',this.id)
		if (this.cat == 'd' && (nundef(this.x) || nundef(this.w))) return this;
		//console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&setDefaults nachher',this.id)

		//if it is a div, shall I set boxSizing=border-box?!?!?!
		//default or given x,y,w,h,bg,fg
		w = nundef(w) ? this.posRef.w : w;
		h = nundef(h) ? this.posRef.h : h;
		this.setSize(w, h);

		x = nundef(x) ? 0 : this.posRef.x + x;
		y = nundef(y) ? 0 : this.posRef.y + y;
		if (this.parent.cat == 'd') { this.parent.elem.style.position = 'absolute'; }
		this.setPos(x, y);

		//showSize(this);
		return this;

	}

	setBg(c, updateFg = false) {
		this.bg = c;
		if (this.cat == 'g') {
			if (this.domType == 'text') {
				if (!this.textBackground) {
					//get w,h
					//make rect under ground child
				}
				// give it color
			} else {
				this.elem.setAttribute('fill', c);
			}
		} else {
			this.elem.style.backgroundColor = c;
		}
		if (updateFg) {
			this.setFg(colorIdealText(c), true);
		}
		return this;
	}
	setFg(c) {
		this.fg = c;
		if (this.cat == 'g') {
			if (this.domType == 'text') {
				this.elem.setAttribute('fill', c);
			} else {
				this.elem.setAttribute('stroke', c);
			}
		} else {
			this.elem.style.color = c;
		}
		return this;
	}
	setFullSize() {
		//sets size to fill parent completely
		this.setSize(this.posRef.w, this.posRef.h);
		this.setPos(0, 0);
	}
	setSize(w, h) {
		//console.log('setSize',this.id,w,h)
		this.w = w; this.h = h;
		if (this.cat == 'g') {
			if (this.ground) {
				this.ground.setAttribute('width', w);
				this.ground.setAttribute('height', h);
			} else {
				this.elem.setAttribute('width', w);
				this.elem.setAttribute('height', h);
			}
			if (this.overlay) {
				this.overlay.setAttribute('width', w);
				this.overlay.setAttribute('height', h);
			}
		} else {
			this.elem.style.position = 'absolute';
			this.elem.style.width = w + 'px';
			this.elem.style.height = h + 'px';
		}
		return this;
	}
	setPos(x, y) {
		this.x = x; //centered for cat g, LT for html elements!
		this.y = y;
		if (this.cat == 'g') {
			this.elem.setAttribute('transform', `translate(${x},${y})`);
		} else {
			this.elem.style.position = 'absolute'
			this.elem.style.left = x + 'px';
			this.elem.style.top = y + 'px';
		}
		return this;
	}
	center() {
		//pos now is pos of center of element! eg. board elements
		this.setPos(-this.w / 2, -this.h / 2)
	}
	centerOrigin() {
		//pos of children of this element will be based on 0,0 being this elem's center: eg., board
		this.setPos(this.w / 2, this.h / 2);
	}

	rect({ x = 0, y = 0, w = 50, h = 25, bg, fg } = {}) {
		//per default will create svg rect if this.domType=='g' and div if this.domType == 'div'
		let pa = this.domType == 'g' ? this._getRect(x, y, w, h, bg, fg) : this._getDiv(x, y, w, h, bg, fg);
		this.elem.appendChild(pa);
		this.attach();
		return this;
	}


	addBorder(c) {
		if (this.cat == 'd') {
			this.elem.style.border = '1px solid ' + c;
		}
	}
	removeBorder() {
		if (this.cat == 'd') {
			this.elem.style.border = null;
		}
	}
	selBlack() {
		if (this.isSelBlack) return;
		this.elem.classList.add('selBlack');
		this.isSelBlack = true;
	}
	unselBlack() {
		if (!this.isSelBlack) return;
		this.elem.classList.remove('selBlack');
		this.isSelBlack = false;
	}
	selRed() { }
	unselAll() { this.removeBorder(); }
	//#endregion
}

class MS_dep {
	constructor({rsgType, parent, id, oid, o, domType = 'g', domel = null } = {}) {
		this.rsgType = rsgType;
		if (rsgType == 'b') {
			this.oid = oid;
			_setIsa(this,o);
			this.id='b@'+o.iTuple;
			if (isdef(domel)) {this.parent=UIS[domel.id];this.domType=getTypeOf(domel);this.cat=MSCAT(this.domType);this.elem=domel;this.elem.id=this.id;}
			else{this.parent=parent;this.domType=domType;this.cat=MSCAT(this.domType);this.elem=_createDom(this.cat,domType);this.elem.id=this.id;}
		}
		// this._setTypeAndId(id, type, domel);
		if (domel) {
			if (domel.id == 'R_d_root') {
				this.handlers = { click: {}, mouseenter: {}, mouseleave: {} }; this.parent = null; this.id = 'R_d_root'; this.domType = 'div'; this.cat = 'd'; this.elem = domel; this.parts = { _: this.elem }; this.children = []; return;
			}
			// //console.log('domel',domel);
			// //console.log(domel.parentNode)
			// //console.log(domel.parentNode.id)
			this.id = domel.id;
			this.domType = getTypeOf(domel);
			this.parent = UIS[domel.parentNode.id];
			// //console.log('testing create ms from domel:', this.id, this.domType, this.parent.id);
		} else {
			this.id = nundef(id) ? getUID() : id;
			this.domType = domType;
			this.parent = parent;
		}
		UIS[this.id] = this;
		this.cat = MSCATS[this.domType]; //'d' for dom els and 'g' for svg els
		//console.log(this.id)

		// this._setElem(domel);
		this.elem = domel ? domel
			: this.cat == 'g' || this.domType == 'svg' ? document.createElementNS('http://www.w3.org/2000/svg', this.domType)
				: document.createElement(this.domType);
		this.elem.ms = this; //back link to MS : careful!!!! cyclic! never ever recurse on MS without guard!!!
		this.elem.id = this.id;
		//console.log(this.elem.id)
		//console.log(this.id)

		// this._setParentChildren(parent, domel);
		if (nundef(this.parent)) this.parent = ROOT; //parent is an MS element!!!!!!!
		this.children = [];
		this.posRef = this.parent; //ref is reference to parent sizing/pos info if needed!
		if (this.cat == 'd' && this.parent.cat == 'g') {
			//problem 1: d el cannot have g parent! >>> parent will be nearest ancestor div, posRef will be g
			let ancestor = closestParent(parent.elem, 'div');
			//console.log('FOUND domParent:', ancestor);
			this.posRef = this.parent;
			this.parent = ancestor.ms;
		} else if (this.parent.cat == 'd' && this.parent.type != 'svg' && this.cat == 'g') {
			//problem 2: g el cannot have d parent ausser wenn parentTye svg ist!! >>> create in between noname svg
			//console.log('case 2: g on d', this.id, this.parent.id)
			let msSvg = new MMS({ parent: this.parent, type: 'svg' }).setDefaults().attach();
			this.parent = msSvg;
			this.posRef = msSvg; //CHECK: ob das correct!!!
		}
		if (domel) { addIf(this.parent.children, this); this.isAttached=true; } //domel is already attached!

		//console.log('HAAAAAAAAAAAALLLLLLLLLLOOOOOOOOOOOOO',this.id)
		this.x = 0; this.y = 0; this.w = 0; this.h = 0;


		//console.log(this.id)
		this.parts = { _: this.elem }; //named uis, eg.: 'table'
		this.uis = []; //if has other unrelated uis, dont know if need this?

		this.handlers = { click: {}, mouseenter: {}, mouseleave: {} };

		//console.log(this.id)
	}
	//#region events
	_handler(ev) {
		ev.stopPropagation();
		if (!this.isEnabled) return;
		let part = ev.currentTarget;
		let partName = isdef(part.name) ? part.name : '_';
		let eventName = ev.handleObj.origType;

		let handler = this.handlers[eventName][partName];
		if (isdef(handler)) { counters[eventName] += 1; counters.events += 1; handler(this, part); }
	}
	addHandler(evName, partName = '_', handler = null, autoEnable = true) {
		//console.log('ccccccc  addHandler!!!!',evName, this.parts, partName,this.parts[partName])
		let part = this.parts[partName];
		//console.log(part)
		if (nundef(part)) { part = this.elem; partName = '_'; } //return;
		//console.log(part,partName);
		if (isdef(handler)) { this.handlers[evName][partName] = handler; }
		$(part).off(evName).on(evName, this._handler.bind(this));
		if (autoEnable) this.enable();
	}
	addClickHandler(partName = '_', handler = null, autoEnable = true) { this.addHandler('click', partName, handler, autoEnable); }
	addMouseEnterHandler(partName = '_', handler = null, autoEnable = true) { this.addHandler('mouseenter', partName, handler, autoEnable); }
	addMouseLeaveHandler(partName = '_', handler = null, autoEnable = true) { this.addHandler('mouseleave', partName, handler, autoEnable); }
	removeEvents() {
		$(this.elem).off();
		if (S_showEvents) this.showEvents(this.elem);
		for (const partName in this.parts) {
			$(this.parts[partName]).off();
			if (S_showEvents) this.showEvents(this.parts[partName]);
		}
	}
	//#endregion

	//#region done
	clear(startProps = {}) {
		let ids = this.children.map(x => x.id);
		for (const id of ids) UIS[id].destroy();
		//clearElement(this.elem);
		for (const k in startProps) {
			this.elem[k] = startProps[k];
		}
		console.log('children after clear', this.children);
	}
	destroy() {
		$(this.elem).remove(); // removes element and all its handlers from UI
		this.elem = null;
		removeInPlace(this.parent.children, this);
		delete UIS[this.id];
	}
	//#endregion

	//#region work

	title(s, key = 'title') {
		if (this.parts[key]) {
			//console.log('HALLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', this.parts[key], this.elem); 
			this.parts[key].style.backgroundColor = randomColor();
			return;
		}
		let t = document.createElement('div');
		t.style.backgroundColor = 'dimgray';
		this.titleColor = t.style.backgroundColor;
		t.classList.add('tttitle');
		t.innerHTML = s;
		this.elem.appendChild(t);
		this.parts[key] = t;
		t.name = key;
		this.attach();
		//console.log(this.parts)
		return this;
	}
	table(o, keys, key = 'table') {
		if (this.parts[key]) {
			let oldTable = this.parts[key];
			let t = tableElem(o, keys);
			let t2 = t.innerHTML;
			oldTable.innerHTML = t2;
		} else {
			let t = tableElem(o, keys);
			this.elem.appendChild(t);
			this.attach();
			this.parts[key] = t;
			t.name = key;
		}

		return this;
	}

	//#endregion

	//#region TODO

	//check ob children ueberhaupt verwendet wird und wie, und ob ich es lieber mit id verwenden soll
	attach() { if (!this.isAttached) { addIf(this.parent.children, this); this.parent.elem.appendChild(this.elem); } return this; } //need to attach() elems that didnt exist OR are NOT g on div!!! in order fr them to appear on screen!
	detach() { if (this.isAttached) { removeIf(this.parent.children, this); this.parent.elem.removeChild(this.elem); } return this; }

	_onMouseEnter(ev) {
		//console.log('mouseEnter', this.id, this.isEnabled, this.mouseEnterHandler);
		if (!this.isEnabled) return;

		let partName = evToId(ev);
		if (S_showEvents) {
			counters.events += 1;
			//console.log('' + counters.events, 'enter', this.id, 'part=' + partName, this.isEnabled, this.mouseEnterHandler ? this.mouseEnterHandler.name : 'no handler');
		}

		if (typeof this.mouseEnterHandler == 'function') {
			if (S_showEvents) //console.log('calling mouseEnterHandler');
				this.mouseEnterHandler(ev);
		}
	}
	_onMouseLeave(ev) {
		//testGSM('mouseLeave', this.id, this.isEnabled, this.mouseLeaveHandler);
		if (!this.isEnabled) return;

		let partName = evToId(ev);
		if (S_showEvents) {
			counters.events += 1;
			//console.log('' + counters.events, 'leave', this.id, partName, this.isEnabled, this.mouseLeaveHandler ? this.mouseLeaveHandler.name : 'no handler');
		}

		if (typeof this.mouseLeaveHandler == 'function') {
			if (S_showEvents) //console.log('calling mouseLeaveHandler');
				this.mouseLeaveHandler(ev);
		}
	}
	_getRect(x = 0, y = 0, w = 50, h = 25, bg, fg) {
		//creates a rect as part of elem
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', x);
		r.setAttribute('y', y);
		if (isdef(bg)) r.setAttribute('fill', bg);
		if (isdef(fg)) r.setAttribute('stroke', bg);
		return r;
	}
	_getDiv(x, y, w, h, bg, fg) {
		let r = document.createElement('div');
		//problem: if part does NOT fit into ms (only the case with divs!), expand ms!
		if (this.w < w || this.h < h) { this.setSize(w, h); }
		if (isdef(x)) {
			//console.log('YES x defined!!!!!!!!', x)
			r.style.position = 'absolute';
			r.style.left = x + 'px';
			r.style.top = y + 'px';
		}
		//need to define overflow property!!!
		if (isdef(w)) {
			r.style.width = w + 'px';
			r.style.height = h + 'px';
			//r.innerHTML='hallohallo hallo hallo hallo ssssssssssss';
		}
		if (isdef(bg)) r.style.backgroundColor = bg;
		if (isdef(fg)) r.style.color = fg;
		return r;
	}
	addInteractivity(partName, hover = true, click = true) {
		let part = this.parts[partName];
		if (nundef(part)) { part = this.elem; } //console.log('!!!!!!!!!!!!no such part', partName); return; }

		//interactivity: muss jetzt auch fuer divs gehen und muss fuer parts of ms gehen!
		//console.log(this, partName, this.part, getFunctionCallerName());
		if (this.part.isInteractive) return;
		this.part.isInteractive = true;
		if (click) this.part.clickHandler = null;
		if (hover) { this.part.mouseEnterHandler = null; this.part.mouseLeaveHandler = null; }
		this.isEnabled = false;
		this.enable = () => this.isEnabled = true;
		this.disable = () => this.isEnabled = false;
		this.elem.addEventListener('click', this._onClick.bind(this));
		this.elem.addEventListener('mouseenter', this._onMouseEnter.bind(this));
		this.elem.addEventListener('mouseleave', this._onMouseLeave.bind(this));
		return this;
	}
	enable() {
		this.isEnabled = true;
	}
	disable() {
		this.isEnabled = false;
	}
	high() {
		if (isdef(this.parts) && isdef(this.parts.title)) this.parts['title'].style.backgroundColor = '#ccff00';
		else {
			this.elem.classList.add('selected');
			this.elem.backgroundColor = '#ccff00';
		}
	} //console.log('highlight', this.id); 

	unhigh() {
		if (isdef(this.parts) && isdef(this.parts.title)) this.parts['title'].style.backgroundColor = this.titleColor;
		else {
			this.elem.classList.remove('selected');
			this.elem.backgroundColor = this.titleColor;
		}
		// this.parts['title'].style.backgroundColor = this.titleColor; 
	}
	sel() { }
	unsel() { }
	frame() { }
	unframe() { }

	setDefaults({ x, y, w, h, bg, fg } = {}) {
		//problem 3: wenn das ein g ist kann ich keinen bg setzen: >>>ist es ein fullSize g on div dann sollte bg auf svg setzen!!!!
		//console.log(this,x,y,w,h,bg,fg)
		if (this.parent.type == 'svg' && isdef(bg) && nundef(w) && nundef(h) && this.domType == 'g') {
			//console.log('case 3: g on d no positioning: svg should get bg!!!')
			this.parent.setBg(bg);
		} else {
			if (isdef(bg) || this.cat == 'd') {
				bg = nundef(bg) ? 'transparent' : bg;
				this.setBg(bg);
				fg = nundef(fg) ? bg == 'transparent' ? this.parent.fg : colorIdealText(bg) : fg;
				this.setFg(fg);
			}
		}

		//if it is a div, there are no default size and pos!
		//console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&setDefaults vorher',this.id)
		if (this.cat == 'd' && (nundef(this.x) || nundef(this.w))) return this;
		//console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&setDefaults nachher',this.id)

		//if it is a div, shall I set boxSizing=border-box?!?!?!
		//default or given x,y,w,h,bg,fg
		w = nundef(w) ? this.posRef.w : w;
		h = nundef(h) ? this.posRef.h : h;
		this.setSize(w, h);

		x = nundef(x) ? 0 : this.posRef.x + x;
		y = nundef(y) ? 0 : this.posRef.y + y;
		if (this.parent.cat == 'd') { this.parent.elem.style.position = 'absolute'; }
		this.setPos(x, y);

		//showSize(this);
		return this;

	}

	setBg(c, updateFg = false) {
		this.bg = c;
		if (this.cat == 'g') {
			if (this.domType == 'text') {
				if (!this.textBackground) {
					//get w,h
					//make rect under ground child
				}
				// give it color
			} else {
				this.elem.setAttribute('fill', c);
			}
		} else {
			this.elem.style.backgroundColor = c;
		}
		if (updateFg) {
			this.setFg(colorIdealText(c), true);
		}
		return this;
	}
	setFg(c) {
		this.fg = c;
		if (this.cat == 'g') {
			if (this.domType == 'text') {
				this.elem.setAttribute('fill', c);
			} else {
				this.elem.setAttribute('stroke', c);
			}
		} else {
			this.elem.style.color = c;
		}
		return this;
	}
	setFullSize() {
		//sets size to fill parent completely
		this.setSize(this.posRef.w, this.posRef.h);
		this.setPos(0, 0);
	}
	setSize(w, h) {
		//console.log('setSize',this.id,w,h)
		this.w = w; this.h = h;
		if (this.cat == 'g') {
			if (this.ground) {
				this.ground.setAttribute('width', w);
				this.ground.setAttribute('height', h);
			} else {
				this.elem.setAttribute('width', w);
				this.elem.setAttribute('height', h);
			}
			if (this.overlay) {
				this.overlay.setAttribute('width', w);
				this.overlay.setAttribute('height', h);
			}
		} else {
			this.elem.style.position = 'absolute';
			this.elem.style.width = w + 'px';
			this.elem.style.height = h + 'px';
		}
		return this;
	}
	setPos(x, y) {
		this.x = x; //centered for cat g, LT for html elements!
		this.y = y;
		if (this.cat == 'g') {
			this.elem.setAttribute('transform', `translate(${x},${y})`);
		} else {
			this.elem.style.position = 'absolute'
			this.elem.style.left = x + 'px';
			this.elem.style.top = y + 'px';
		}
		return this;
	}
	center() {
		//pos now is pos of center of element! eg. board elements
		this.setPos(-this.w / 2, -this.h / 2)
	}
	centerOrigin() {
		//pos of children of this element will be based on 0,0 being this elem's center: eg., board
		this.setPos(this.w / 2, this.h / 2);
	}

	rect({ x = 0, y = 0, w = 50, h = 25, bg, fg } = {}) {
		//per default will create svg rect if this.domType=='g' and div if this.domType == 'div'
		let pa = this.domType == 'g' ? this._getRect(x, y, w, h, bg, fg) : this._getDiv(x, y, w, h, bg, fg);
		this.elem.appendChild(pa);
		this.attach();
		return this;
	}


	addBorder(c) {
		if (this.cat == 'd') {
			this.elem.style.border = '1px solid ' + c;
		}
	}
	removeBorder() {
		if (this.cat == 'd') {
			this.elem.style.border = null;
		}
	}
	selBlack() {
		if (this.isSelBlack) return;
		this.elem.classList.add('selBlack');
		this.isSelBlack = true;
	}
	unselBlack() {
		if (!this.isSelBlack) return;
		this.elem.classList.remove('selBlack');
		this.isSelBlack = false;
	}
	selRed() { }
	unselAll() { this.removeBorder(); }
	//#endregion
}


//#region MS utilities
function showSize(ms) { console.log(ms.id + ': x', ms.x, 'y', ms.y, 'w', ms.w, 'h', ms.h); }
function showElemSize(e) { console.log(e.id + ': x', e.offsetLeft, 'y', e.offsetTop, 'w', e.offsetWidth, 'h', e.offsetHeight); }
function showProps(ms) { console.log(ms.id + '(' + getTypeOf(ms) + ')' + ': x', ms.x, 'y', ms.y, 'w', ms.w, 'h', ms.h, 'bg', ms.bg, 'fg', ms.fg); }
function showElemProps(e) { console.log(e.id + '(' + getTypeOf(e) + ')' + ': x', e.offsetLeft, 'y', e.offsetTop, 'w', e.offsetWidth, 'h', e.offsetHeight, 'bg', e.style.backgroundColor, 'fg', e.style.color); }
function showEvents(el) { console.log('jquery events for', el, $._data(el, 'events')); }



