const IS_MIRROR = false;
const FLASK = true;
const NGROK = null;//'http://f3629de0.ngrok.io/'; //null; //'http://b29082d5.ngrok.io/' //null; //'http://2d97cdbd.ngrok.io/';// MUSS / am ende!!! 
const SERVER_URL = IS_MIRROR ? 'http://localhost:5555/' : FLASK ? (NGROK ? NGROK : 'http://localhost:5000/') : 'http://localhost:5005/';

//user/game settings:
var S_startGame = 'ttt'; // ttt | tictactoe | catan
var S_playMode = 'hotseat';
var S_tooltips = 'ON';

//testing settings:
var S_openTab = 'a_d_London';
var S_useSpec = false;
var S_useBehaviors = true;
var S_boardDetection = true; //false 
var S_defaultObjectArea = 'a_d_objects';
var S_defaultPlayerArea = 'a_d_players';
var S_autoplay = false;
var S_autoplayFunction = (_g) => counters.msg < 25; //counters.msg < 13; // false; //G.player!='White' && G.player != 'Player1';
var S_showEvents = false; //unused
var S_AIThinkingTime = 30;

function setDefaultSettings() {
	//#region settings fuer entry points: called in _mStart after G,S,M initialized
	document.getElementById('c_b_TTip').textContent = 'tooltips: ' + S_tooltips;
	document.getElementById('c_b_settings_solo').checked = S_playMode == 'solo';
	document.getElementById('c_b_settings_hotseat').checked = S_playMode == 'hotseat';
	document.getElementById('c_b_settings_dev').checked = S_playMode == 'dev';
	// document.getElementById('c_b_ShowEvents').textContent = S_showEvents ? '- events' : '+ events';////console.log(S_showEvents)
	let opt = { present: { object: {}, player: {} }, game: {} };
	opt.present.object.createDefault = true; // miss | true | false
	opt.present.player.createDefault = true; // miss | true | false
	opt.present.object.defaultArea = S_defaultObjectArea;
	opt.present.player.defaultArea = S_defaultPlayerArea;
	opt.present.object.optin = null;
	opt.present.object.optout = ['obj_type', 'id'];
	opt.present.player.optin = null;
	opt.present.player.optout = ['id','color'];

	opt.colors = ['#6B7A8F'];//,'powderblue','#07061c', '#6a1c81', '#f4695c']; //takes first one only
	opt.gap = 0;
	opt.outerGap = false;

	opt.clickToSelect = true;
	opt.tooltips = document.getElementById('c_b_TTip').textContent.includes('ON');

	opt.useSpec = S_useSpec;
	opt.useBehaviors = S_useSpec && S_useBehaviors; //code might reference to spec objects such as areas

	opt.game = S_startGame;
	opt.playMode = S_playMode;

	S.settings = opt; 
}
function setAutoplayFunctionForMode(mode,isStartup=false) {
	// in solo playmode, solo player is always index 0 player
	if (nundef(mode)) mode = S.settings.playMode;
	if (!isStartup) S_autoplayFunction = mode == 'solo' ? (_g, _) => _g.playerIndex != 0 : () => false;
}
function setPlayMode(mode,isStartup=false) {
	setAutoplayFunctionForMode(mode,isStartup);
	if (mode == 'solo') {
		hide(document.getElementById('c_b_NextPlayer'));
		hide(document.getElementById('c_b_RunToEnd'));
	} else if (mode == 'hotseat') {
		show(document.getElementById('c_b_NextPlayer'));
		show(document.getElementById('c_b_RunToEnd'));
	} else {
		show(document.getElementById('c_b_NextPlayer'));
		show(document.getElementById('c_b_RunToEnd'));
	}
}
function initSETTINGS() {
	setPlayMode(S.settings.playMode,true);

	//take S.user.spec and override default options
	if (isdef(S.user.spec) && isdef(S.user.spec.SETTINGS)) { for (const k in S.user.spec.SETTINGS) { S.settings[k] = S.user.spec.SETTINGS[k]; } }

	//add game specific test buttons (run to...) if specified in user spec / SETTINGS
	initAutoplayToActionButtons();
}
function initAutoplayToActionButtons() {
	//cheats! TODO: remove
	if (S.settings.game == 'catan') setKeys(S.settings,['dev', 'keywords', 'action'],[['buy','buy devcard'],['hex','place robber'],['Corner','settlement or city'],['Edge', 'road']])
	//add chrome for dev options!!!
	let kws = lookup(S.settings, ['dev', 'keywords', 'action']);
	if (!kws) return;
	//console.log('action keywords', kws);
	let i = 0;
	let dActionButtons = document.getElementById('a_d_autoplay_buttons');
	for (const pair of kws) {
		//eg. ['hex','place robber']
		//mach einen button in 'autoplay_buttons'
		let b = document.createElement('button');
		b.innerHTML = pair[1];
		b.id = 'c_b_RTA_' + i;
		i += 1;
		b.onclick = () => onClickRunToAction(b.id, pair[0]);
		dActionButtons.appendChild(b);
	}

}
