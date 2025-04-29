var PLAYER_UPDATE_BEHAVIOR = [];
var PLAYER_UPDATE_VISUALIZATION = [];
var TABLE_UPDATE_BEHAVIOR = [];
var TABLE_UPDATE_VISUALIZATION = [];

var TABLE_UPDATE={};
var PLAYER_UPDATE={};

//UI generation simple
function runBEHAVIOR_new(oid,pool,behaviors) {
	let res={};
	for (const name in behaviors) {
		let o = pool[oid];
		//todo returns vis function and list of objects to update!
		//if no vis func is returned, use default on list of objects!
		//could also return relevant properties of o to present!
		let todo = behaviors[name](oid,o,G.serverData.phase);
		if (isdef(todo)) {
			let params=isdef(todo.vis)?todo.vis.map(x=>getVisual(x)):[];
			//console.log(name,o,oid,params)
			//console.log('todo',todo)
			for(const vis of params) clearElement(vis.elem);//clear all relevant visuals
			//console.log('behavior result:',todo.f.name,oid,params);

			let res = todo.f(oid,o,...params);
			//console.log('visualization result:',res);
		}
	}
	return res;
}

//UI table presentation simple
function runBEHAVIOR(oid,pool,behList,VisList) {
	let res={};
	for (const functionPair of behList) {
		let doFilterFunc = functionPair[0];
		let doFunc = functionPair[1];
		let o=pool[oid];
		if (nundef(o) || !doFilterFunc(oid,o)) {
			//console.log('no behavior:',oid)
			continue;
		}

		for (const functionPair of VisList) {
			let visFilterFunc = functionPair[0];
			let visFunc = functionPair[1];
			console.log(o);
			if (visFilterFunc(oid,o)) {
				let params = doFunc(oid,o);
				//console.log('exec',visFunc,'on',oid,o,params)
				visFunc(oid,o,...params);
				for(const par of params){
					if (isDict(par) && 'id' in par) res[par.id] = par;
				}
			}
		}
	}
	return res;
}
