class RSG {
	constructor() {
		this.children = [];
		this.parts = {};
		this.handlers = { click: {}, mouseenter: {}, mouseleave: {} }; this.isAttached = false;
		this.texts = []; //akku for text elems, each elem {w:textWidth,el:elem}
		this.refs = {}; //by key same as parts
		this.isa = {};
		this.bgs = {};
		this.fgs = {};
	}
	//#region text
	computeTextColors(fill, alpha = 1, textBg = null) {
		fill = fill ? fill : this.fg ? this.fg : textBg ? colorIdealText(textBg) : this.bg ? colorIdealText(this.bg) : null;
		if (!fill) {
			fill = 'white';
			textBg = 'gray';
		}
		fill = anyColorToStandardString(fill, alpha);
		return { fill: fill, bg: textBg ? textBg : this.bg };
	}
	setTextFill(r, fill, alpha = 1, textBg = null) {
		let textColors = this.computeTextColors(fill, alpha, textBg);
		//console.log('text color fill='+fill,'bg='+this.bg,'fg='+this.fg,'textBg='+textBg)
		r.setAttribute('fill', textColors.fill);
		r.setAttribute('stroke', 'none');
		r.setAttribute('stroke-width', 0);
		return textColors.bg;
	}
	setTextBorder(color, thickness = 0) {
		//to set stroke for line or text different from fill!
		let c = anyColorToStandardString(color);
		let children = arrChildren(this.elem);
		unitTestMS('setTextBorder', children);
		for (const ch of children) {
			//console.log(ch.getAttribute('stroke-width'));
			let t = getTypeOf(ch);
			if (t == 'text' || t == 'line') {
				ch.setAttribute('stroke-width', thickness);
				ch.setAttribute('stroke', c);
			}
		}
	}
	calcTextWidth(txt, fz, family, weight) {
		let sFont = weight + ' ' + fz + 'px ' + family; //"bold 12pt arial"
		sFont = sFont.trim();
		let wText = getTextWidth(txt, sFont);
		return wText;
	}

	addFrame(color) {
		if (this.type == 'DIV') {
			//console.log(this.body)
			this.body.style.boxSizing = 'border-box';
			//console.log('adding a frame')
			this.body.style.border = '5px solid ' + color;
		}
	}
	addFlexTitleBody() {
		let content = this.elem.innerHTML;
		clearElement(this.elem);
		let d = this.elem;
		d.style.display = 'flex';
		d.style.flexDirection = 'column';
		let dTitle = document.createElement('div');
		this.title = dTitle;
		this.title.style.padding = '6px';
		this.title.style.textAlign = 'center';
		let dBody = document.createElement('div');
		dBody.style.flexGrow = 1;
		dBody.style = "flex-grow:1;overflow:auto;padding:0px 6px"
		this.body = dBody;
		this.body.innerHTML = content;
		this.elem.appendChild(this.title);
		this.elem.appendChild(this.body);
	}

	setTitle({
		txt,
		className = null,
		isOverlay = false,
		isMultiText = false,
		replaceFirst = true,
		fill = null,
		textBg = null,
		alpha = 1,
		x = 0,
		y = 0,
		fz = 20,
		family = 'Arial, Helvetica, sans-serif',
		weight = ''
	} = {}) {


		if (this.type == 'DIV') {
			if (nundef(this.body) || nundef(this.title)) {
				this.addFlexTitleBody();
			}
			// if (nundef(this.title)) {
			// 	this.title = document.createElement('div');
			// 	this.title.style.textAlign = 'center';
			// 	if (nundef(this.body)) {
			// 		this.body = document.createElement('div');
			// 		this.body.style = "margin:0px;height:100%;overflow:auto;padding:"
			// 		let content = this.elem.innerHTML;
			// 		this.body.innerHTML = content;
			// 		clearElement(this.elem);
			// 		this.elem.appendChild(this.title);
			// 		this.elem.appendChild(this.body);
			// 	}else{
			// 		this.body.prepend(this.title);
			// 	}
			// 	// this.elem.prepend( this.title );
			// 	// //console.log(this.elem)
			// } else {
			clearElement(this.title);
			if (isdef(textBg)) this.title.style.backgroundColor = textBg;
			if (isdef(fill)) this.title.style.color = fill;
			this.title.innerHTML = txt;
			return this;
		}
		// ms.text({txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black'});
		//TODO: shrinkFont,wrap,ellipsis options implementieren
		//if replaceFirst true ... if this elem already contains a text, that text child is replaced by new text
		let isFirstChild = this.elem.childNodes.length == 0;

		//let r = getText({txt:txt,className:className,isOverlay:isOverlay,fill:fill,textBg:textBg,alpha:alpha,x:x,y:y,fz:fz,family:family,weight:weight});

		let r = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		if (isFirstChild) {
			this.ground = r;
		}
		r.setAttribute('font-family', family);
		r.setAttribute('font-weight', weight);

		// CSS classes
		if (isOverlay) {
			r.classList.add('overlay'); //className);
			this.overlay = r;
		}
		r.classList.add('msText');
		if (className) {
			r.classList.add(className);
		}
		//console.log('classes attached to new text element',r.getAttribute('class'),r.classList);

		textBg = this.setTextFill(r, fill, alpha, textBg);
		if (isFirstChild) { this.bgs.ground = textBg; this.fg.ground = fill; }
		//console.log('text: textBg='+textBg)
		let wText = this.calcTextWidth(txt, fz, family, weight);

		if (this.isLine && !isMultiText) {
			x += this.x;
			y += this.y;
			//console.log(x, y);
			if (this.textBackground) {
				this.elem.removeChild(this.textBackground);
			}

			this.textBackground = this.getRect({ w: wText + 10, h: fz * 1.5, fill: textBg });
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}
		r.setAttribute('font-size', '' + fz + 'px');
		r.setAttribute('x', x);
		r.setAttribute('y', y + fz / 2.8);
		r.setAttribute('text-anchor', 'middle');
		r.textContent = txt;
		r.setAttribute('pointer-events', 'none'); // geht!!!!!!

		if (replaceFirst && this.texts.length > 0) {
			let ch = this.texts[0].el; //findChildOfType('text', this.elem);

			//console.log('this.textx[0]',ch,this.texts,this)
			this.elem.insertBefore(r, ch);
			if (this.isLine) {
				this.elem.insertBefore(this.textBackground, r);
			}
			this.removeTexts();
		} else {
			if (this.isLine && !isMultiText) {
				this.elem.appendChild(this.textBackground);
			}
			this.elem.appendChild(r);
		}

		let res = { el: r, w: wText };
		this.texts.push(res);
		return res;
	}

	text({
		txt,
		className = null,
		isOverlay = false,
		isMultiText = false,
		replaceFirst = true,
		fill = null,
		textBg = null,
		alpha = 1,
		x = 0,
		y = 0,
		fz = 20,
		family = 'Arial, Helvetica, sans-serif',
		weight = ''
	} = {}) {

		if (this.type == 'DIV') {
			this.elem.style.textAlign = 'center';
			this.elem.style.color = fill ? fill : 'white';
			this.elem.style.padding = '20px';
			this.elem.innerHTML = txt;
			return this;
		}
		// ms.text({txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black'});
		//TODO: shrinkFont,wrap,ellipsis options implementieren
		//if replaceFirst true ... if this elem already contains a text, that text child is replaced by new text
		let isFirstChild = this.elem.childNodes.length == 0;

		//let r = getText({txt:txt,className:className,isOverlay:isOverlay,fill:fill,textBg:textBg,alpha:alpha,x:x,y:y,fz:fz,family:family,weight:weight});

		let r = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		if (isFirstChild) {
			this.ground = r;
		}
		r.setAttribute('font-family', family);
		r.setAttribute('font-weight', weight);

		// CSS classes
		if (isOverlay) {
			r.classList.add('overlay'); //className);
			this.overlay = r;
		}
		r.classList.add('msText');
		if (className) {
			r.classList.add(className);
		}
		//console.log('classes attached to new text element',r.getAttribute('class'),r.classList);

		textBg = this.setTextFill(r, fill, alpha, textBg);
		if (isFirstChild) { this.bgs.ground = textBg; this.fg.ground = fill; }
		//console.log('text: textBg='+textBg)
		let wText = this.calcTextWidth(txt, fz, family, weight);

		if (this.isLine && !isMultiText) {
			x += this.x;
			y += this.y;
			//console.log(x, y);
			if (this.textBackground) {
				this.elem.removeChild(this.textBackground);
			}

			this.textBackground = this.getRect({ w: wText + 10, h: fz * 1.5, fill: textBg });
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}
		r.setAttribute('font-size', '' + fz + 'px');
		r.setAttribute('x', x);
		r.setAttribute('y', y + fz / 2.8);
		r.setAttribute('text-anchor', 'middle');
		r.textContent = txt;
		r.setAttribute('pointer-events', 'none'); // geht!!!!!!

		if (replaceFirst && this.texts.length > 0) {
			let ch = this.texts[0].el; //findChildOfType('text', this.elem);

			//console.log('this.textx[0]',ch,this.texts,this)
			this.elem.insertBefore(r, ch);
			if (this.isLine) {
				this.elem.insertBefore(this.textBackground, r);
			}
			this.removeTexts();
		} else {
			if (this.isLine && !isMultiText) {
				this.elem.appendChild(this.textBackground);
			}
			this.elem.appendChild(r);
		}

		let res = { el: r, w: wText };
		this.texts.push(res);
		return res;
	}
	reduceFontSize(el, n) {
		//console.log('reduceFontSize');
		let fz = el.getAttribute('font-size');
		fz = firstNumber(fz);
		if (fz > n) fz -= n;
		//this.elem.removeChild(el);
		el.setAttribute('font-size', '' + fz + 'px');
	}
	removeTexts() {
		for (const t of this.texts) {
			this.elem.removeChild(t.el);
		}
		this.texts = [];
	}
	multitext({
		replacePrevious = true,
		className = '',
		maxWidth = 1000,
		txt = ['one', 'two', 'three'],
		fz = 20,
		fill = null,
		textBg = null,
		padding = 1,
		alpha = 1,
		x = 0,
		y = 0,
		family = 'Arial, Helvetica, sans-serif',
		weight = 'lighter'
	}) {
		let nChar = 0;
		for (const s of txt) { nChar = Math.max(nChar, s.length); }
		let maxFH = Math.round(this.h / txt.length);
		let maxFW = Math.round((this.w / nChar) * 2);

		let fzFit = Math.min(maxFH, maxFW) - 2 * padding;
		if (fzFit < fz) fz = fzFit;
		if (fzFit > 5 * fz) fz *= 5;//fzFit;
		// let stdFonts=[6,14,28,54,100];
		// let fz1=stdFonts[0];
		// for(let i=0;i<stdFonts.length;i++){if (stdFonts[i]>fzFit) break; else fz1=stdFonts[i];}
		// console.log('fzOrig',fz,'fzFit',fz1);
		// fz=fz1;

		if (replacePrevious) this.removeTexts();

		let h = txt.length * (fz + padding);

		let textColors = this.computeTextColors(fill, alpha, textBg);
		if (this.isLine) {
			x += this.x;
			y += this.y;

			let tbg = this.textBackground ? this.textBackground : this.getRect();

			tbg.setAttribute('height', h);
			tbg.setAttribute('fill', textColors.bg);
			if (!this.textBackground) {
				this.textBackground = tbg;
				this.elem.appendChild(this.textBackground);
			}
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}

		let yStart = y - h / 2 + fz / 2;
		let maxW = 0;
		let akku = [];
		for (const t of txt) {
			let tel = this.text({
				isMultiText: true,
				replaceFirst: false,
				className: className,
				maxWidth: maxWidth,
				txt: t,
				fz: fz,
				fill: fill,
				padding: padding,
				alpha: alpha,
				x: x,
				y: yStart,
				family: family,
				weight: weight
			});
			maxW = Math.max(maxW, tel.w);
			akku.push(tel);
			yStart += fz + padding;
		}
		let isFirstChild = this.elem.childNodes.length == 0;
		if (isFirstChild || this.isLine) {
			this.ground = this.textBackground;
			this.w = maxW + 2 * padding;
			this.h = h;
		}
		if (this.isLine) {
			this.textBackground.setAttribute('width', this.w);
			this.textBackground.setAttribute('x', x - this.w / 2);
			this.textBackground.setAttribute('y', y - this.h / 2);
		}
		if (isFirstChild) { this.bgs.ground = textColors.bg; this.fg.ground = fill; }

		return this;

	}
	//#endregion

	_setFill(el, fill, alpha) {
		if (fill != null && fill !== undefined) {
			fill = anyColorToStandardString(fill, alpha);
			el.setAttribute('fill', fill);
			return fill;
		}
		return null;
	}

	//#region geo
	ellipse({ idx, border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0 } = {}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

		if (this.isLine) {
			x += this.x;
			y += this.y;
		}

		let bg = this._setFill(r, fill, alpha);

		r.setAttribute('stroke-width', thickness);
		if (thickness > 0) {
			border = anyColorToStandardString(border, alpha);
			r.setAttribute('stroke', border);
		}

		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');
			this.w = w;
			this.h = h;
		}

		r.setAttribute('rx', w / 2);
		r.setAttribute('ry', h / 2);
		r.setAttribute('cx', x); //kann ruhig in unit % sein!!!
		r.setAttribute('cy', y);
		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		if (isdef(idx) && this.elem.childNodes.length > idx) {
			this.elem.insertBefore(r, this.elem.childNodes[idx]);
		} else {
			this.elem.appendChild(r);
		}
		return this;
	}
	getRect({ border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0, rounding } = {}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		if (this.isLine) {
			x += this.x;
			y += this.y;
		}

		//console.log(this)
		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', -w / 2 + x);
		r.setAttribute('y', -h / 2 + y);

		let bg = this._setFill(r, fill, alpha);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');
			this.w = w;
			this.h = h;
		}


		r.setAttribute('stroke-width', thickness);
		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
		}

		//testGSM('rect nachher', fill);

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		return r;
	}
	circle({ idx, border, thickness = 0, className = '', sz = 25, fill, alpha = 1, x = 0, y = 0 } = {}) {
		return this.ellipse({
			idx: idx,
			className: className,
			w: sz,
			h: sz,
			fill: fill,
			border: border,
			thickness: thickness,
			alpha: alpha,
			x: x,
			y: y
		});
	}
	hex({ idx, className = '', x = 0, y = 0, w, h = 0, fill, alpha = 1, border = 'white', thickness = 0, flat = false }) {
		//flat=true means  TODO: implement!
		//if h<=0, heightis calculated from width!
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

		if (h <= 0) {
			h = (2 * w) / 1.73;
		}
		let pts = size2hex(w, h, x, y);
		r.setAttribute('points', pts);

		let bg = this._setFill(r, fill, alpha);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');
			this.w = w;
			this.h = h;
		}


		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
			r.setAttribute('stroke-width', thickness);
		}

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		this.elem.appendChild(r);
		return this;
	}
	image({ idx, className = '', path = '', w = 50, h = 50, x = 0, y = 0 } = {}) {
		//<image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		r.setAttribute('href', path);

		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', -w / 2 + x);
		r.setAttribute('y', -h / 2 + y);
		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		if (this.elem.childNodes.length == 0) {
			this.w = w;
			this.h = h;
		}
		this.elem.appendChild(r);
		return this;
	}
	line({ idx, className = '', x1 = 0, y1 = 0, x2 = 100, y2 = 100, fill, alpha = 1, thickness = 2 }) {
		// <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		r.setAttribute('x1', x1);
		r.setAttribute('y1', y1);
		r.setAttribute('x2', x2);
		r.setAttribute('y2', y2);

		this.thickness = thickness;
		this.w = this.h = thickness
		// Math.max(thickness,Math.abs(x1-x2)/2); 
		// this.h=Math.max(thickness,Math.abs(y1-y2)/2);

		let isFirstChild = this.elem.childNodes.length == 0;

		let stroke = anyColorToStandardString(fill, alpha);
		if (thickness > 0) {
			r.setAttribute('stroke', stroke);
			r.setAttribute('stroke-width', thickness);
		}
		if (className !== '') {
			r.setAttribute('class', className);
		}
		if (className.includes('overlay')) {
			r.setAttribute('class', 'overlay_line');
			this.overlay = r; //set the interactive element!
		}
		if (isFirstChild || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = stroke; this.fgs.ground = stroke;
			this.isLine = true;
			this.x = Math.round((x1 + x2) / 2);
			this.y = Math.round((y1 + y2) / 2);
		}

		this.elem.appendChild(r);
		return this;
	}
	poly({ idx, className = '', pts = '0,0 100,0 50,80', fill, alpha = 1, border = 'white', thickness = 0 }) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		r.setAttribute('points', pts);

		let isFirstChild = this.elem.childNodes.length == 0;

		let bg = this._setFill(r, fill, alpha);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');

			//TODO!!!!!!
			// this.w = w;
			// this.h = h;
		}

		if (thickness > 0) {
			border = anyColorToStandardString(border, alpha);
			r.setAttribute('stroke', border);
			r.setAttribute('stroke-width', thickness);
		}



		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		this.elem.appendChild(r);
		return this;
	}
	rect({ idx, border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0, rounding } = {}) {
		let r = this.getRect({ border: border, thickness: thickness, className: className, w: w, h: h, fill: fill, alpha: alpha, x: x, y: y, rounding: rounding });

		if (isdef(idx) && this.elem.childNodes.length > idx) {
			this.elem.insertBefore(r, this.elem.childNodes[idx]);
		} else {
			this.elem.appendChild(r);
		}
		return this;
	}
	roundedRect({ idx, border, thickness = 0, className = '', w = 150, h = 125, fill = 'darkviolet', rounding = 10, alpha = 1, x = 0, y = 0 } = {}) {
		return this.rect({ idx: idx, border: border, thickness: thickness, className: className, w: w, h: h, fill: fill, alpha: alpha, x: x, y: y, rounding: rounding })
	}
	square({ idx, className = '', sz = 50, fill = 'yellow', alpha = 1, x = 0, y = 0, border, thickness = 0, rounding } = {}) {
		return this.rect({
			idx: idx,
			className: className,
			w: sz,
			h: sz,
			fill: fill,
			alpha: alpha,
			x: x,
			y: y,
			border: border,
			thickness: thickness,
			rounding: rounding
		});
	}
	//#endregion

	//#region css classes
	addClass(clName) {
		let el = this.overlay;
		if (!el) return;

		el.classList.add(clName);
	}
	getClass() {
		if (this.overlay) {
			return this.overlay.getAttribute('class');
		}
		return null;
	}
	removeClass(clName) {
		let el = this.overlay;
		if (!el) return;
		el.classList.remove(clName);
	}
	//#endregion

	//#region tooltips
	calcCenterPos(ev) {
		//console.log('size', this.w, this.h)
		let x, y;
		if (isdef(this.w)) {
			let rect = ev.target.getBoundingClientRect();
			let dx = ev.clientX - rect.left; //x position within the element.
			let dy = ev.clientY - rect.top;
			x = ev.clientX - dx + this.w / 2;
			y = ev.clientY - dy + this.h / 2;
		} else {
			x = ev.pageX;
			y = ev.pageY;

		}
		return { x: x, y: y };
	}
	showTT(ev) {
		let d = document.getElementById('tooltip');
		clearElement(d);
		//console.log(this.o)
		let oid = getOidForMainId(this.id);
		let oUpdated = oid in G.table?G.table[oid]:G.playersAugmented[oid];
		let titleDomel = document.createElement('div');
		titleDomel.style.width = '100%';
		titleDomel.style.textAlign = 'center';
		titleDomel.innerHTML = ('obj_type' in oUpdated ? oUpdated.obj_type : 'player') + ('name' in oUpdated ? ':' + oUpdated.name : 'id' in oUpdated ? ':' + oUpdated.id : ' ' + oid);
		d.appendChild(titleDomel);
		let t = tableElem(oUpdated);
		d.appendChild(t);
		let pos = this.calcCenterPos(ev);
		$('div#tooltip').css({
			display: 'inline-block',
			left: pos.x,//ev.pageX, //clientX-dx+ms.w, //e.pageX, //clientX,
			top: pos.y,//ev.pageY, //clientY-dy+ms.h,//e.pageY, //clientY,
			//width: '300px',
			//height: '300px'
		});

	}
	ttHandling(ev, eventName) {
		if (!this.o) return;
		let oid = getOidForMainId(this.id);
		if (!oid) return;
		if (eventName == 'mouseenter') {
			//console.log('tt', this.id);
			this.TTTT = setTimeout(() => this.showTT(ev), 500);
		}
		else if (eventName == 'mouseleave') {
			clearTimeout(this.TTTT); hideTooltip();
		}

	}
	//#endregion

	//#region events
	_handler(ev) {
		ev.stopPropagation();
		let eventName = ev.handleObj.origType;

		if (S.settings.tooltips) this.ttHandling(ev, eventName);

		if (!this.isEnabled) return;
		let part = $(ev.currentTarget);
		let partName;
		if (part.id == this.elem.id) partName = 'elem';
		else { let props = $(part).attrs(); let name = props.name; if (nundef(name)) name = 'elem'; partName = name; }
		let handler = this.handlers[eventName][partName];
		if (isdef(handler)) { counters[eventName] += 1; counters.events += 1; handler(this, partName); }
	}
	addHandler(evName, partName = 'elem', handler = null, autoEnable = true) {
		//console.log('ccccccc  addHandler!!!!','autoEnable',autoEnable,evName, this.parts, partName,this.parts[partName])
		let part = this.parts[partName];
		//console.log(part)
		if (nundef(part)) { part = this.elem; partName = 'elem'; } //return;
		//console.log(part,partName);
		if (isdef(handler)) { this.handlers[evName][partName] = handler; }
		$(part).off(evName).on(evName, this._handler.bind(this));
		if (autoEnable) this.enable();
	}
	addClickHandler(partName = 'elem', handler = null, autoEnable = true) { this.addHandler('click', partName, handler, autoEnable); }
	addMouseEnterHandler(partName = 'elem', handler = null, autoEnable = true) { this.addHandler('mouseenter', partName, handler, autoEnable); }
	addMouseLeaveHandler(partName = 'elem', handler = null, autoEnable = true) { this.addHandler('mouseleave', partName, handler, autoEnable); }
	removeClickHandler() { for (const partName in this.parts) { $(this.parts[partName]).off('click'); } this.handlers.click = {} }
	removeHoverHandlers() { for (const partName in this.parts) { $(this.parts[partName]).off('mouseenter mouseleave'); } this.handlers.mouseenter = {}; this.handlers.mouseleave = {} }
	removeHandlers() { this.removeEvents(); }
	removeEvents() {
		for (const partName in this.parts) { $(this.parts[partName]).off(); }// { let el = this.parts[partName]; $(el).off('mouseenter');$(el).off('mouseleave');$(el).off('click');} //$(this.parts[partName]).off('mouseenter mouseleave click'); }
		this.handlers = { click: {}, mouseenter: {}, mouseleave: {} };
	}
	enable() { this.isEnabled = true; }
	disable() { this.isEnabled = false; }
	//#endregion

	//#region high
	_getPart(partName, elemIfMissing = true) {
		let part = this.parts[partName];
		return nundef(part) ? elemIfMissing ? this.elem : null : part;
	}
	highC(c, pname = 'elem', elIfMiss = true) {
		//console.log('highC',this.id)
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.cat == 'g') {
			this.ground.setAttribute('fill', c);
			this.ground.setAttribute('stroke', c);
		} else { part.style.backgroundColor = c; part.style.color = colorIdealText(c); }
	}
	unhighC(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.cat == 'g') {
			if (nundef(this.ground)) return;
			this.ground.setAttribute('fill', this.bgs.ground);
			if (this.fgs.ground) this.ground.setAttribute('stroke', this.fgs.ground);
		}
		else { let bg = part.bg; if (nundef(bg)) bg = null; part.style.backgroundColor = bg; if (isdef(bg)) part.style.color = colorIdealText(bg); }
	}
	high(pname = 'elem', elIfMiss = true) {
		//console.log('high',this.id)
		let part = this._getPart(pname, elIfMiss);
		if (!part) return; //{console.log('no part',pname); return;}
		if (this.cat == 'g') addClass('high', this.ground);
		else part.style.backgroundColor = '#ccff00';
	}
	unhigh(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.cat == 'g') removeClass('high', this.ground);
		else { let bg = part.bg; if (nundef(bg)) bg = null; part.style.backgroundColor = bg; }
	}
	highFrame(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.isLine) this.addClass('lineHighFrame', this.overlay);
		else addClass('highFrame', this.cat == 'g' ? this.overlay : this.parts['title'])
		// if (this.cat == 'g') addClass('highFrame',this.overlay);
		// else part.style.backgroundColor = colorTrans('#ccff00');
	}
	unhighFrame(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.isLine) this.removeClass('lineHighFrame', this.overlay);
		else removeClass('highFrame', this.cat == 'g' ? this.overlay : this.parts['title'])
		// removeClass('highFrame',this.cat=='g'?this.overlay:this.parts['title'])
		// if (this.cat == 'g') removeClass('highFrame',this.overlay);
		// else { let bg = part.bg; if (nundef(bg)) bg = null; part.style.backgroundColor = bg; }
	}
	unhighAll() { for (const k in this.parts) { this.unhigh(k); this.unhighFrame(k); this.unhighC(k); } }
	sel() { }
	unsel() { }
	frame() { }
	unframe() { }
	hide(pname = 'elem', elIfMiss = false) { let part = this._getPart(pname, elIfMiss); if (part) hide(part); }
	show(pname = 'elem', elIfMiss = false) { let part = this._getPart(pname, elIfMiss); if (part) show(part); }
	minimize() {
		//if this elem has a title, hide all other parts
		if ('title' in this.parts) {
			for (const k in this.parts) {
				if (k == 'elem' || k == 'title') continue;
				this.hide(k)
			}
			this.isMinimized = true;
		}
	}
	maximize() {
		if (this.isMinimized) {
			for (const k in this.parts) {
				if (k == 'elem' || k == 'title') continue;
				this.show(k)
			}
		}
		//show all parts
	}
	//#endregion

	//#region basic properties x,y,w,h,bg,fg
	setBg(c, { updateFg = false, partName = 'elem' } = {}) {

		let part = this.parts[partName];
		if (partName == 'elem') { this.bg = c; }
		part.bg = c;
		if (this.cat == 'g') {
			if (this.type == 'text') {
				if (!this.textBackground) {
					//get w,h
					//make rect under ground child
				}
				// give it color
			} else {
				this.elem.setAttribute('fill', c);
				if (this.isLine) { this.ground.setAttribute('stroke', c) }
			}
		} else {
			part.style.backgroundColor = c;
		}
		if (updateFg) {
			this.setFg(colorIdealText(c), true);
		}
		return this;
	}
	setFg(c, { updateBg = false, partName = 'elem' } = {}) {
		let part = this.parts[partName];
		if (partName == 'elem') { this.fg = c; }
		part.fg = c;
		if (this.cat == 'g') {
			if (this.type == 'text') {
				this.elem.setAttribute('fill', c);
			} else {
				this.elem.setAttribute('stroke', c);
			}
		} else {
			part.style.color = c;
		}
		return this;
	}
	setFullSize() {
		//sets size to fill parent completely
		let parent = UIS[this.idParent]; if (nundef(parent)) return;
		this.setSize(parent.w, parent.h);
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
	//#endregion

	//#region parts
	title(s, key = 'title') {
		if (this.parts[key]) {
			//console.log('HALLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', this.parts[key], this.elem); 
			this.parts[key].style.backgroundColor = randomColor();
			return;
		}
		let t = document.createElement('div');
		t.style.borderRadius = '8px';
		t.style.padding = '4px 8px';
		let bg = 'dimgray';
		//t.style.backgroundColor = bg;
		t.classList.add('tttitle');
		t.innerHTML = s;
		this.elem.appendChild(t);
		this.parts[key] = t;
		//add these props to part:
		$(t).attrs({ name: key });//, bg: bg });
		this.setBg(bg, { partName: key });
		// t.name = key;
		// t.bg = t.style.backgroundColor;
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
	tableX(o, keys, key = 'table') {
		let replace = isdef(this.parts[key]);

		let res = tableElemX(o, keys);
		//console.log(res)
		let tNew = res.table;
		let rNew = res.refs.map(x => x.id);
		tNew.name = key;

		if (replace) {
			let oldTable = this.parts[key];
			let oldRefs = this.refs[key];
			//console.log(oldRefs);
			if (isdef(oldRefs)) { oldRefs.map(x => deleteRSG(x)); delete this.refs[key]; }
			oldTable.innerHTML = tNew.innerHTML;
		} else {
			this.elem.appendChild(tNew);
			this.attach();
			this.parts[key] = tNew;
		}

		if (!empty(res)) {
			makeRefs(this.id, res.refs);
			this.refs[key] = rNew; //keep list of refs for key
		}
		return this;
	}
	tableY(o, keys, key = 'table') {
		let replace = isdef(this.parts[key]);

		let res = tableElemY(o, keys);
		//console.log(res)
		let tNew = res.table;
		let rNew = res.refs.map(x => x.id);
		tNew.name = key;

		if (replace) {
			let oldTable = this.parts[key];
			let oldRefs = this.refs[key];
			//console.log(oldRefs);
			if (isdef(oldRefs)) { oldRefs.map(x => deleteRSG(x)); delete this.refs[key]; }
			oldTable.innerHTML = tNew.innerHTML;
		} else {
			this.elem.appendChild(tNew);
			this.attach();
			this.parts[key] = tNew;
		}

		if (!empty(res)) {
			makeRefs(this.id, res.refs);
			this.refs[key] = rNew; //keep list of refs for key
		}
		return this;
	}
	//#endregion

	//#region admin/general

	//attach/detach does NOT remove or add to MS parent, just its domel! (for former, use: switchParent NOT_IMPL)
	attach() { if (!this.isAttached) { this.isAttached = true; UIS[this.idParent].elem.appendChild(this.elem); } return this; } //need to attach() elems that didnt exist OR are NOT g on div!!! in order fr them to appear on screen!
	detach() { if (this.isAttached) { this.isAttached = false; UIS[this.idParent].elem.removeChild(this.elem); } return this; }
	clear(startProps = {}) {
		//all children are destroyed: only destroys UI and removes from parent.children,
		//does NOT destroy RSG objects of children or remove them from any lists/dictionaries such as UIS,IdOwner,id2uids....
		this.children.map(x => deleteRSG(x));
		//clearElement(this.elem);
		for (const k in startProps) {
			this.elem[k] = startProps[k];
		}
		//console.log('children after clear', this.children);
	}
	destroy() {
		this.clear(); //first properly delete all children!
		$(this.elem).remove(); // removes element and all its handlers from UI
		this.elem = null;
		this.isAttached = false;
		let parent = UIS[this.idParent];
		removeInPlace(parent.children, this.id);
	}

	toString() { return 'id: ' + this.id + ', ' + this.domType + ', ' + this.x + ', ' + this.y + ', ' + this.w + ', ' + this.h + ', ' + this.bg + ', ' + this.fg + ', ' + this.children; }
}
//Brahma
function getColorHint(o) {
	if ('color' in o) return o.color;
	for (const k in o) {
		if (k == 'Color') return o[k];
		if (isDict(o[k]) && isdef(o[k]._player)) return getPlayerColor(o[k]._player);
	}
	return null;
}
function getRandomShape() { return chooseRandom('ellipse', 'roundedRect', 'rect', 'hex'); }

function makeBoardElement(oid, o, idBoard, elType) {
	let id = 'm_t_' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = idBoard;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.o = o;
	ms.isa[elType] = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	//ms.attach();
	return ms;

}
function makeBoard(idBoard, o, areaName) {
	let id = 'm_s_' + idBoard;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = addSvgg(UIS[areaName].elem, id, { originInCenter: true });
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = areaName;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.o = o;
	ms.isa.board = true;

	linkObjects(id, idBoard);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.isAttached = true;
	return ms;

}
function makeRefs(idParent, refs) {
	for (const ref of refs) {
		let id = ref.id;
		let oids = ref.oids;
		if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
		let ms = new RSG();
		ms.id = id;
		let domel = document.getElementById(id);
		//console.log('ref elem:',domel)
		ms.elem = domel;
		ms.parts.elem = ms.elem;
		ms.domType = getTypeOf(domel);
		ms.cat = DOMCATS[ms.domType];
		ms.idParent = idParent;
		let parent = UIS[idParent];
		parent.children.push(id);
		ms.isAttached = true;

		ms.isa.ref = true;
		ms.o = ref.oids;

		for (const oid of ref.oids) linkObjects(id, oid);
		listKey(IdOwner, id[2], id);
		UIS[id] = ms;
	}
}
function makeRoot() {
	let ms = new RSG();
	let id = 'R_d_root';
	ms.id = id;
	ms.elem = domId(id);
	ms.domType = getTypeOf(ms.elem);
	ms.IdParent = null;
	ms.isAttached = true;
	UIS[id] = ms;
	return ms;
}
function makeDomArea(domel) {
	if (nundef(domel.id)) return;
	let ms = new RSG();
	let id = domel.id;
	ms.id = id;
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = domel.parentNode.id;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);
	ms.isAttached = true;
	UIS[id] = ms;
	listKey(IdOwner, id[2], id);
	return ms;
}
function makeAux(s, oid, areaName, directParent) {
	let id = 'x_l_' + getUID() + '@' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElement('div');
	domel.classList.add('hallo');
	domel.innerHTML = s;
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.isa.aux = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	//ms.attach();
	if (isdef(directParent)) { ms.isAttached = true; directParent.appendChild(ms.elem) } else ms.attach();
	return ms;

}
function makeDefaultObject(oid, o, areaName) { return _makeDefault(oid, o, areaName, 't', oid + ': ' + o.obj_type); }
function makeDefaultPlayer(oid, o, areaName) { return _makeDefault(oid, o, areaName, 'p', 'player: ' + oid + '(' + getPlayerColorString(oid) + ', ' + getUser(oid) + ')'); }
function _makeDefault(oid, o, areaName, idOwner, title) {
	let id = 'd_' + idOwner + '_' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElement('div');
	domel.style.cursor = 'default';
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	let sTitle = title;
	ms.title(sTitle);

	ms.o = o;
	ms.isa[o.obj_type] = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.attach();
	return ms;

}
function makeDefaultAction(boat, areaName) {
	let ms = new RSG();
	let id = 'd_a_' + boat.iTuple;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return null; }
	ms.id = id;
	let domel = document.createElement('div');
	domel.textContent = boat.text;
	domel.style.cursor = 'pointer';
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.o = boat;
	ms.isa.boat = true;

	for (const tupleEl of boat.tuple) {
		if (tupleEl.type == 'obj' && isdef(tupleEl.ID)) {
			let oid = tupleEl.ID;
			boat.oids.push(oid);
			linkObjects(id, oid);
		}
	}

	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.attach();
	return ms;

}
//Shiva
function _deleteFromOwnerList(id) { let owner = IdOwner[id[2]]; if (isdef(owner)) removeInPlace(owner, id); }
function deleteRSG(id) {
	let ms = UIS[id];
	if (nundef(ms)) {
		error('object that should be deleted does NOT exist!!!! ' + id);
		console.log(DELETED_IDS);
		console.log(DELETED_THIS_ROUND);
	}
	unlink(id);
	_deleteFromOwnerList(id);
	ms.destroy();
	DELETED_IDS.push(id);
	DELETED_THIS_ROUND.push(id);
	delete UIS[id];
}
function deleteAll(rsgType, idoType) {
	let ids = IdOwner[idoType];
	//console.log(ids);
	ids = isdef(IdOwner[idoType]) ? IdOwner[idoType].filter(x => x[0] == rsgType) : []; for (const id of ids) deleteRSG(id);
}
function deleteDefaultObjects() { deleteAll('d', 't'); }
function deleteDefaultPlayers() { deleteAll('d', 'p'); }
function deleteActions() { deleteAll('d', 'a'); }

//#region helpers
function addRelatives(id, oid) {
	// if (isdef(oid2ids[oid])) oid2ids[oid].map(x => listKey(id2uids, id, x)); //all other already existing uis are linked to newly created element!
	if (isdef(oid2ids[oid])) {
		for (const idOther of oid2ids[oid]) {
			if (idOther == id) {
				//console.log('object',id,'already exists in oid2ids[',oid,']'); 
				continue;
			}
			listKey(id2uids, id, idOther);
			listKey(id2uids, idOther, id);
		}
	}
}
function unlink(id) {
	let oids = id2oids[id];
	let uids = id2uids[id];
	if (isdef(uids)) for (const uid of uids) removeInPlace(id2uids[uid], id);
	if (isdef(oids)) for (const oid of oids) removeInPlace(oid2ids[oid], id);
	delete id2uids[id];
	delete id2oids[id];
}
function linkObjects(id, oid) {
	if (isdef(UIS[id])) {
		console.log('linkObjects: ui', id, 'exists and CANNOT be overriden!!!!!');
	}
	//console.log('*** created ***',id)
	addRelatives(id, oid);
	listKey(id2oids, id, oid);
	listKey(oid2ids, oid, id);
}
function showUIS() { for (const id in UIS) { console.log(UIS[id].toString()) } }



(function ($) {
	// Attrs
	//usage:
	// Setter
	// $('#element').attrs({
	// 	'name' : 'newName',
	// 	'id' : 'newId',
	// 	'readonly': true
	// });

	// // Getter
	// var attrs = $('#element').attrs();
	$.fn.attrs = function (attrs) {
		var t = $(this);
		if (attrs) {
			// Set attributes
			t.each(function (i, e) {
				var j = $(e);
				for (var attr in attrs) {
					j.attr(attr, attrs[attr]);
				}
			});
			return t;
		} else {
			// Get attributes
			var a = {},
				r = t.get(0);
			if (r) {
				r = r.attributes;
				for (var i in r) {
					var p = r[i];
					if (typeof p.nodeValue !== 'undefined') a[p.nodeName] = p.nodeValue;
				}
			}
			return a;
		}
	};
})(jQuery);

//domType:cat
const DOMCATS = { rect: 'g', g: 'g', circle: 'g', text: 'g', polygon: 'g', line: 'g', body: 'd', svg: 'h', div: 'd', p: 'd', table: 'd', button: 'd', a: 'd', span: 'd', image: 'd', paragraph: 'd', anchor: 'd' };
//rsg types = { a: 'area', b: 'boat', c: 'chrome', d: 'def', m: 'main', n: 'none', r: 'ref',R:'root', s: 'struct', t: 'test', x: 'aux' };
//owner types = { a: 'actions',  b: 'button', c: 'chrome', d: 'dom', g: 'g_area', l: 'log', m: 'messages', p: 'players', s: 'struct', t: 'table', u:'user_area' };
//id: rsgType_IdOwnerType_oidOrCounterOrName
// >>>> UIS IdOwner id2oids oid2ids id2uids
