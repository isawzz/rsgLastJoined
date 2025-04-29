function clearPageHeader(){
	UIS['a_d_divPlayerNames'].clear();
}
function _mClear() {
	clearPageHeader();
	timit.showTime(getFunctionCallerName());
	stopBlinking('a_d_status');
	if (S.settings.tooltips) toggleTooltips(document.getElementById('c_b_TTip'));
	restoreDom();
	restoreBehaviors();
}
function restoreDom() {
	openTabTesting('London');
	UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
	UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
	for(const id of ['a_d_log','a_d_objects','a_d_players','a_d_game']) clearElement(id);
}
function restoreBehaviors() {
	PLAYER_UPDATE = [];
	TABLE_UPDATE = [];
	PLAYER_CREATE = [];
	TABLE_CREATE = [];
}











