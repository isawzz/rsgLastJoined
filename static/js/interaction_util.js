function hideTooltip(){
	//console.log('cleaning tooltip')
	$('div#tooltip').css({ display: 'none' });
}










//#region all unused!
function mapSafe(func,listFunc,oid){
	let uis=listFunc(oid);
	if (!isdef(uis))return;
	if (!isList(uis)) uis=[uis];
	uis.map(x=>x[func]());
}

//shortcuts: what should happen?
function highAux(oid){mapSafe('high',getAuxVisuals,oid);}
function highMain(oid){mapSafe('high',getVisual,oid);}
function highAll(oid){mapSafe('high',getVisuals,oid);}
function unhighAux(oid){mapSafe('unhigh',getAuxVisuals,oid);}
function unhighMain(oid){mapSafe('unhigh',getVisual,oid);}
function unhighAll(oid){mapSafe('unhigh',getVisuals,oid);}

//shortcuts: when should it happen? >>handlers will be attached to all uis passing filterFunc!
//function onMouseEnter(filterFunc,)


//high or unhigh multiple groups:
// function unhighAux(oid){getAuxVisuals(oid).map(x=>x.unhigh())}
// function unhighMain(oid){let v=getVisual(oid);if(v)v.unhigh();}
// function highAssoc(oid,assocList=[highAux,higMain]){_modAssoc(oid,assocList);}
// function unhighAssoc(oid,assocList=[unhighAux,unhigMain]){_modAssoc(oid,assocList);}
// function _modAssoc(oid,funcList){for(const f of funcList)f(oid);}

//#endregion