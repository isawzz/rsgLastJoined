//#region tooltips
var TT_JUST_UPDATED = -1;
//var ttcount=0
function activateTooltips_hallo() {
	//console.log('activating tooltips!')
	for (const oid in G.table) {
		//let ms = getVisual(oid);
		if (isdef(getVisual(oid))) createTooltip(oid);
	}
	for (const oid in G.players) {
		if (isdef(getVisual(oid))) createTooltip(oid);
	}
}
function createTooltip_hallo(oid) {
	//console.log('cond mouseover mouseout',oid);
	let id =getMainId(oid);
	let ms=getVisual(oid);
	
	if (!ms) return;
	let ground=ms.ground;
	if (!ground) return;
	let domel=ground;
	
	//getVisual(oid).elem; if (!domel){console.log('no tt for',oid);return;}//UIS[id].elem;
	console.log('creating tt',domel)
	//console.log('create tt for',oid,id,UIS[id].elem,domel,domel.id);
	$(domel).off('mouseover mouseout');
	$(domel).mouseover(function (e) {
		//e.stopPropagation();
		console.log('mouseover',e,evToId(e));
		return;
		let mainId = evToId(e);
		console.log(ev,'should show tt for',mainId)
		//ttcount += 1;
		//console.log(ttcount,oid)
		if (TT_JUST_UPDATED != oid) {
			TT_JUST_UPDATED = oid;
			updateTooltipContent(mainId);
			//console.log(e.clientX, e.clientY, e)
			$('div#tooltip').css({
				display: 'inline-block',
				top: e.pageY, //clientY,
				left: e.pageX, //clientX,
			});
		}
	});
	$(domel).mouseout(function (e) {
		if (TT_JUST_UPDATED == oid) TT_JUST_UPDATED = -1;
		e.stopPropagation();
		$('div#tooltip').css({
			top: 0,
			left: 0,
			display: 'none'
		});
	});
}
function deactivateTooltips_hallo() {
	for (const oid in G.table) {
		//console.log('unbinding mouseover mouseout',oid);
		$('#' + oid).unbind('mouseover mouseout');
	}
	for (const oid in G.players) {
		$('#' + oid).unbind('mouseover mouseout');
	}
}


function ttTitle(oid,o){
	$('div#ttipTitle').html(('obj_type' in  o? o.obj_type:'_') + ('name' in o ? ':' + o.name : 'id' in o ? ':' + o.id : ' ' + oid));
}
function ttBody2(oid,o){
	let s=treee(o);
	//console.log('HALLLLLLLLOOOOOOOOOOOO',s);
	clearElement('ttipRight');
	$('div#ttipLeft').html(s);
	//$('div#ttipRight').html(sVals);
}

function ttBody(oid,o){
	let sProps = '';
	let sVals = '';
	for (const p in o) {
		if (p == 'obj_type' || p == 'name' || p == 'id') continue;
		let val = o[p];
		sProps += p + '<br>';
		sVals += simpleRep(val) + '<br>';
	}
	$('div#ttipLeft').html(sProps);
	$('div#ttipRight').html(sVals);
}
function updateTooltipContent_hallo(id) {
	let oid = getOidForMainId(id);
	let pool = findPool(id);
	//console.log('from', getFunctionsNameThatCalledThisFunction(), 'UPDATING TOOLTIP FOR', oid,pool)
	let o = pool[id];
	console.log('tt',id,oid,o)
	return;
	ttTitle(id,o);
	ttBody(id,o);
}
