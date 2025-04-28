//********************************************/
//* main functions                           */
//********************************************/
function addVisuals(board, { f2nRatio = 4, opt = 'fitRatio', gap = 4, margin = 20, edgeColor, fieldColor, nodeColor, iPalette = 1, nodeShape = 'circle', factors, w, h } = {}) {
	//opt can be  fitRatio | fitStretch | none
	//coloring: if iPalette is set, board object will set this as its palette
	//if fieldColor is a number 0-8, it will be interpreted as ipal into board palette, and all fields will be given ipal and iPalette in addition to bg
	//if fieldColor is a color, field members will just be given that bg, and they wont have an ipal or iPalette
	//if fieldColor is undefined, in getMemberColors the default colors will be set which are from board palette (board will inherit palette if not set!)
	//same for nodeColor, edgeColor
	[w, h] = board.getSize();
	let isPalField, isPalCorner, isPalEdge;
	[iPalette, fieldColor, isPalField, nodeColor, isPalCorner, edgeColor, isPalEdge] = getBoardMemberColors(board, fieldColor, nodeColor, edgeColor, iPalette);
	let [fw, fh, nw, nh, ew] = getBoardScaleFactors(board, { factors: factors, opt: opt, f2nRatio: f2nRatio, w: w, h: h, margin: margin });

	////console.log('---------------',w,h,fieldColor,fw,fh)

	for (const id of board.strInfo.fields) {
		let o = getVisual(id);
		////console.log(o)
		makeVisual(o, o.memInfo.x * fw, o.memInfo.y * fh, board.strInfo.wdef * fw - gap, board.strInfo.hdef * fh - gap, fieldColor, o.memInfo.shape);
		o.memInfo.isPal = isPalField;
		o.attach();
	}
	if (isdef(board.strInfo.corners)) {
		for (const id of board.strInfo.corners) {
			let o = getVisual(id);
			o.memInfo.isPal = isPalCorner;
			makeVisual(o, o.memInfo.x * fw, o.memInfo.y * fh, Math.max(board.strInfo.wdef * nw, ew), Math.max(board.strInfo.hdef * nh, ew), nodeColor, nodeShape);
		}
	}
	if (isdef(board.strInfo.edges)) {
		for (const id of board.strInfo.edges) {
			let o = getVisual(id);
			o.memInfo.isPal = isPalEdge;
			makeVisual(o, o.memInfo.x * fw, o.memInfo.y * fh, o.memInfo.thickness * ew, 0, edgeColor, 'line', { x1: o.memInfo.x1 * fw, y1: o.memInfo.y1 * fh, x2: o.memInfo.x2 * fw, y2: o.memInfo.y2 * fh });
			o.attach();
		}
	}
	if (isdef(board.strInfo.corners)) {
		for (const id of board.strInfo.corners) getVisual(id).attach();
	}
}
/**
 * 
 * @param {id of parent object} areaName 
 * @param {id of board object to be created} idBoard 
 * @param {server object that has at least rows,cols,fields} sBoard 
 * @param {server object dict containing fields,corners,edges} sMemberPool 
 * @param {hex or quad} shape 
 */
function createGrid(areaName, idBoard, sBoard, sMemberPool, shape) {
	let board = makeBoard(idBoard, sBoard, areaName);
	board.strInfo = shape == 'hex' ? getHexGridInfo(sBoard.rows, sBoard.cols) : getQuadGridInfo(sBoard.rows, sBoard.cols);

	//ausser fuer board object, sind neighborhood infos (fields.corners,...) NUR im G.table object
	makeFields(sMemberPool, board, sBoard, shape);
	if (isdef(sBoard.corners)) makeCorners(sMemberPool, board, sBoard);
	if (isdef(sBoard.edges)) makeEdges(sMemberPool, board, sBoard);

	return board;
}

//********************************************/
//* user API                                 */
//********************************************/
function areaRows(soDict, loc) {
	//for each object in soDict makes a row div
	let area = getVisual(loc);
	let [w, areaH] = area.getSize();
	let keys = getKeys(soDict);
	let n = keys.length;
	let h = Math.floor(areaH / n);
	let extra = areaH - n * h;
	let x = 0;
	let y = 0;
	let [iPalette, ipal] = area.getColorInfo();
	let pal = S.pals[iPalette];
	ipal = n <= pal.length - ipal ? ipal : n <= pal.length ? pal.length - n : ipal;
	let i = 0;
	for (const k in soDict) {
		////console.log(loc,x,y,w,h,iPalette,ipal)
		let id = k;
		i += 1;
		let o = createMainDiv(id, loc);
		let h1 = i == n - 1 ? h + extra : h;
		o.setBounds(x, y, w, h1);
		//console.log('h',h1, areaH)
		o.setPalette(iPalette, ipal);
		y += h1;
		ipal = (ipal + 1) % pal.length;
	}
}
function hexGrid(soDict, loc, condList) {
	timit.showTime(getFunctionCallerName());
	let [idBoard, sBoard] = findMatch(soDict, condList);
	return _hexGrid(loc, idBoard, sBoard, soDict);
}
function detectBoard(soDict, loc) {
	let idBoard = firstCondDict(soDict, x => isdef(x.map) && isdef(x.fields));
	if (isdef(idBoard)) {
		let sBoard = soDict[idBoard];
		//detect shape of board fields
		//look at first field
		//guess hex if field has 6 neighbors...
		let idField0 = sBoard.fields._set[0]._obj;
		let f0 = soDict[idField0];
		let numNei = f0.neighbors.length;
		if (numNei == 6) return _hexGrid(loc, idBoard, sBoard, soDict); else return _quadGrid(loc, idBoard, sBoard, soDict);
	}
	return null;

}
function quadGrid(soDict, loc, condList) {
	timit.showTime(getFunctionCallerName());
	let [idBoard, sBoard] = findMatch(soDict, condList);
	return _quadGrid(loc, idBoard, sBoard, soDict);
}

//#region helpers                                  
function _quadGrid(loc, idBoard, sBoard, soDict) {
	let board = createGrid(loc, idBoard, sBoard, soDict, 'quad');
	addVisuals(board);
	return board;
}
function _hexGrid(loc, idBoard, sBoard, soDict) {
	let board = createGrid(loc, idBoard, sBoard, soDict, 'hex');
	addVisuals(board);
	return board;
}
function findMatch(odict, condList) {
	if (isListOfLiterals(condList)) condList = [condList];
	////console.log('odict',odict);//console.log('condList',condList)

	let Board = lastCondDictPlusKey(odict, x => {
		for (const tuple of condList) {
			if (x[tuple[0]] != tuple[1]) return false;
		}
		return true;
	});
	////console.log('findMatchDict',Board);
	return Board;
}
function getQuadGridInfo(rows, cols) {
	[wdef, hdef] = [4, 4];
	let info = {
		structType: 'grid',
		rows: rows,
		cols: cols,
		wdef: 4,
		hdef: 4,
		dx: wdef,
		dy: hdef,
		w: wdef * cols,
		h: hdef * rows,
		minRow: 1,
		minCol: 1,
	};
	return info;
}
function getHexGridInfo(rows, cols) {
	[wdef, hdef] = [4, 4];
	[dx, dy] = [wdef / 2, (hdef * 3) / 4];
	let info = {
		structType: 'hexGrid',
		rows: rows,
		cols: cols,
		wdef: 4,
		hdef: 4,
		dx: dx,
		dy: dy,
		w: wdef + (cols - 1) * dx,
		h: hdef + (rows - 1) * dy,
		minRow: 0,
		minCol: 0,
	};
	return info;
}
function getQuadFieldInfo(boardInfo, row, col) {
	//is exactly same as for hex field except for shape! >so unify after testing!
	let info = {
		shape: 'rect',
		memType: 'field',
		row: row,
		col: col,
		x: -boardInfo.w / 2 + (col - boardInfo.minCol) * boardInfo.dx + boardInfo.wdef / 2,
		y: -boardInfo.h / 2 + (row - boardInfo.minRow) * boardInfo.dy + boardInfo.hdef / 2,
		w: boardInfo.wdef,
		h: boardInfo.hdef,
	};
	////console.log('col',col,'minCol',boardInfo.minCol,boardInfo.w,boardInfo.dx,boardInfo.wdef,'==>',info.x)
	info.poly = getQuadPoly(info.x, info.y, info.w, info.h);
	return info;
}
function getHexFieldInfo(boardInfo, row, col) {
	let info = {
		shape: 'hex',
		memType: 'field',
		row: row,
		col: col,
		x: -boardInfo.w / 2 + (col - boardInfo.minCol) * boardInfo.dx + boardInfo.wdef / 2,
		y: -boardInfo.h / 2 + boardInfo.hdef / 2 + (row - boardInfo.minRow) * boardInfo.dy,
		w: boardInfo.wdef,
		h: boardInfo.hdef,
	};
	info.poly = getHexPoly(info.x, info.y, info.w, info.h);
	return info;
}
function getBoardMemberColors(board, fieldColor, nodeColor, edgeColor, iPalette, ipals = [3, 4, 5]) {
	let isPalField = nundef(fieldColor) || isNumber(fieldColor) && fieldColor >= 0 && fieldColor <= 8;
	let isPalCorner = isdef(board.strInfo.corners) && (nundef(nodeColor) || isNumber(nodeColor) && nodeColor >= 0 && nodeColor <= 8);
	let isPalEdge = isdef(board.strInfo.edges) && (nundef(edgeColor) || isNumber(edgeColor) && edgeColor >= 0 && edgeColor <= 8);
	if (!iPalette && (isPalField || isPalCorner || isPalEdge)) iPalette = board.getIPalette();
	if (iPalette) {
		board.iPalette = iPalette;
		board.ipal = 2;
		board.strInfo.ipals = ipals;
		let pal = S.pals[iPalette];
		if (isPalField) fieldColor = pal[ipals[0]];
		if (isPalCorner) nodeColor = pal[ipals[1]];
		if (isPalEdge) edgeColor = pal[ipals[2]];
		//when palette changes, this board needs to be updated!!!
		_register(board, 'paletteUpdates', updateColors);
	}

	return [iPalette, fieldColor, isPalField, nodeColor, isPalCorner, edgeColor, isPalEdge];
}
function getBoardScaleFactors(board, { factors, opt, f2nRatio, w, h, margin } = {}) {
	let [fw, fh, nw, nh, ew] = isdef(factors) ? factors : [43, 50, 12, 12, 10];
	if (startsWith(opt, 'fit')) {
		if (w == 0) {
			let g = document.getElementById(board.id);
			let transinfo = getTransformInfo(g);
			w = transinfo.translateX * 2;
			h = transinfo.translateY * 2;
		}
		let divBy = 2 * (f2nRatio - 2);
		fw = Math.floor((w - margin) / (board.strInfo.w + board.strInfo.wdef / divBy));
		fh = Math.floor((h - margin) / (board.strInfo.h + board.strInfo.hdef / divBy));

		let maintainRatio = (opt[3] == 'R');
		if (maintainRatio) {
			let ff = Math.min(fw, fh);
			fw = ff;
			fh = ff;
		}
		nw = Math.floor(fw / f2nRatio);
		nh = Math.floor(fh / f2nRatio);
	}
	return [fw, fh, nw, nh, ew];
}
function makeFields(pool, board, serverBoard, shape) {
	////console.log(board, serverBoard)
	let serverFieldIds = _setToList(serverBoard.fields).map(x => x._obj);
	board.strInfo.fields = serverFieldIds;
	for (const fid of serverFieldIds) {
		let sField = pool[fid];
		let r = sField.row;
		let c = sField.col;
		let field = createMainG(fid, board.id);
		field.memInfo = shape == 'hex' ? getHexFieldInfo(board.strInfo, r, c) : getQuadFieldInfo(board.strInfo, r, c);
	}
	board.strInfo.vertices = correctPolys(board.strInfo.fields.map(x => getVisual(x).memInfo.poly), 1);
}
function makeCorners(pool, board, serverBoard) {
	let serverFieldIds = _setToList(serverBoard.fields).map(x => x._obj);
	board.strInfo.corners = _setToList(serverBoard.corners).map(x => x._obj);
	let dhelp = {}; //remember nodes that have already been created!!!
	for (const fid of serverFieldIds) {
		let sfield = pool[fid];
		let ffield = getVisual(fid);
		if (nundef(sfield.corners)) continue;
		let iPoly = 0;
		let cornerIds = sfield.corners.map(x => x._obj);
		for (const cid of cornerIds) {
			if (!cid) {
				iPoly += 1;
				continue;
			} else if (isdef(dhelp[cid])) {
				iPoly += 1;
				continue;
			} else {
				//create a new corner object
				let corner = createMainG(cid, board.id);
				let poly = ffield.memInfo.poly[iPoly];
				corner.memInfo = { shape: 'circle', memType: 'corner', x: poly.x, y: poly.y, w: 1, h: 1 };
				dhelp[cid] = corner;
				iPoly += 1;
			}
		}
	}
}
function makeEdges(pool, board, serverBoard) {
	let serverFieldIds = _setToList(serverBoard.fields).map(x => x._obj);
	board.strInfo.edges = _setToList(serverBoard.edges).map(x => x._obj);
	dhelp = {}; //remember nodes that have already been created!!!
	for (const fid of serverFieldIds) {
		let sfield = pool[fid];
		if (nundef(sfield.edges)) continue;
		let edgeIds = sfield.edges.map(x => x._obj);
		for (const eid of edgeIds) {
			if (!eid) {
				continue;
			} else if (isdef(dhelp[eid])) {
				continue;
			} else {
				//create an edge object
				let edge = createMainG(eid, board.id);

				//find end corners (server objects):
				let el = G.table[eid];
				let n1 = getVisual(el.corners[0]._obj);
				let n2 = getVisual(el.corners[1]._obj);
				////console.log(el, n1, n2)

				edge.memInfo = {
					shape: 'line',
					memType: 'edge',
					x1: n1.memInfo.x,
					y1: n1.memInfo.y,
					x2: n2.memInfo.x,
					y2: n2.memInfo.y,
					x: (n1.x + n2.x) / 2,
					y: (n1.y + n2.y) / 2,
					thickness: 1,
					w: 1,
					h: 1,
				};
				dhelp[eid] = edge;
			}
		}
	}
}
function makeVisual(o, x, y, w, h, color, shape, { x1, y1, x2, y2 } = {}) {
	////console.log('makeVisual', x, y, w, h, color, shape, x1, y1, x2, y2);
	if (shape == 'circle') {
		o.ellipse({ w: w, h: h }).ellipse({ className: 'overlay', w: w, h: h });
		o.setPos(x, y);
	} else if (shape == 'hex') {
		o.hex({ w: w, h: h }).hex({ className: 'overlay', w: w, h: h });
		o.setPos(x, y);
	} else if (shape == 'quad' || shape == 'rect') {
		o.rect({ w: w, h: h }).rect({ className: 'overlay', w: w, h: h });
		o.setPos(x, y);
	} else if (shape == 'triangle') {
		//TODO!!!!
		o.rect({ w: w, h: h }).hex({ className: 'overlay', w: w, h: h });
		o.setPos(x, y);
	} else if (shape == 'line') {
		let thickness = w;
		let fill = color;
		o.line({ className: 'ground', x1: x1, y1: y1, x2: x2, y2: y2, fill: fill, thickness: thickness }).line({
			className: 'overlay',
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2,
			thickness: thickness,
		});
	}
	o.setBg(color, shape != 'line');
	return o;
}
//#endregion

