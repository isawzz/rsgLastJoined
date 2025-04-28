function _mtest() {
	MSInit();

}



//#region tests
function testSuperGenialDivAndGBehavingTheSame(){
	//test div and g behaving exactly the same!
	//test div rect on area
	let msD=new MMS({parent:UIS.a_d_game,type:'div'}).rect({x:20,y:100,w:50,h:50,bg:'blue'}).attach(); //ok
	let msG=new MMS({parent:UIS.a_d_game,type:'g'}).rect({x:20,y:100,w:25,h:25,bg:'red'}).attach(); //ok
	console.log(msD.elem, msG.elem)
}
function gRectPartOnArea(){
	//test put g rect on a_d_game
	let g = new MMS({parent:UIS.a_d_game}).setDefaults({bg:'powderBlue'}).attach(); //YES!
	let ms=new MMS({parent:g}).rect({w:50,h:50,bg:'blue'}).attach(); //ok
	console.log(ms.elem)
}
function testJustARect(){
	//test put full size svg on div
	let svg = new MMS({parent:UIS.a_d_game,type:'svg'}).setDefaults({bg:'green'}).attach(); //YES!
	let rect =new MMS({parent:svg,type:'rect'}).setDefaults({w:50,h:50,bg:'red'}).attach();//YES! 
}
function testSvgGRectTakesBg(){
	//test: put svg, then g, and then rect
	let svg = new MMS({parent:UIS.a_d_game,type:'svg'}).setDefaults().attach(); //YES!
	let g = new MMS({parent:svg,type:'g'}).setDefaults({bg:'red'}).attach(); //YES!
	let rect =new MMS({parent:g,type:'rect'}).setDefaults({w:50,h:50,bg:'yellow'}).attach();//YES! 
	g.centerOrigin();
}
function testManualCircleOnG(){
	//test: put svg, then g
	let svg = new MMS({ parent: UIS.a_d_game, type: 'svg'}).setDefaults({bg: 'green' }).attach(); //YES!
	let g = new MMS({ parent: svg, type: 'g'}).setDefaults({bg: 'blue' }).attach(); //YES!

	let circle = new MMS({ parent: g, type: 'ellipse'}).attach();//YES! 
	let r = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
	r.setAttribute('rx', 35);
	r.setAttribute('ry', 45);
	r.setAttribute('cx', 0); //kann ruhig in unit % sein!!!
	r.setAttribute('cy', 0);
	r.setAttribute('fill', 'yellow');
	g.elem.appendChild(r);


}
function testSetBgOnSvgInsteadOfG(){
	//test ob er setDefault svg fullSize macht!!!!
	//BUG!!! hier sollte das svg den bg yellow bekommen!!! weil keine pos angabe fuer g
	let g = new MMS({ parent: UIS.a_d_game, type: 'g'}).setDefaults({bg: 'yellow' }).attach(); //YES!

}
function test01(){
	//test directly put g on d
	UIS.a_d_game.elem.style.textAlign='center'; //geht!

	//per default setzt er svg als full size aber nicht g under svg! GEHT NICHT!!!
	let svg = new MMS({ parent: UIS.a_d_game, type: 'svg'}).setDefaults().attach(); //YES!
	let g = new MMS({ parent: svg, type: 'g'}).attach(); //YES!
	addManualCircle(g);
	//g.centerOrigin(); //aendert nichts weil g hat w=h=0!!! (weil nicht bei g setDefaults gemacht habe!)


}
function addManualCircle(g){
	let circle = new MMS({ parent: g, type: 'ellipse'}).attach();//YES! 
	let r = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
	r.setAttribute('rx', 35);
	r.setAttribute('ry', 45);
	r.setAttribute('cx', 0); //kann ruhig in unit % sein!!!
	r.setAttribute('cy', 0);
	r.setAttribute('fill', 'yellow');
	g.elem.appendChild(r);
	return r;
}

//#endregion