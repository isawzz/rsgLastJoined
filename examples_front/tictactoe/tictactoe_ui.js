TABLE_UPDATE = {
	resources_numbers: (id, o) => {
		if (o.obj_type == 'Tick') { return { f: field_update, vis:['P'] }; }
	},
}

function field_update(id, o) {
	if (nundef(o.player)) return;
	vis = getVisual(id);
	let pl = getPlayer(o.player._player); //player who just placed!
	let color = pl.color;
	let fz = vis.h / 2;
	vis.text({ txt: o.symbol, fill: color, fz: fz, family: 'arial black' });
	let P = getVisual('P');
	P.text({txt:pl.id+' placed in '+o.row+','+o.col,fill:'white'});
	return [id,'P'];
}

