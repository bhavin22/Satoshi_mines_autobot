function Init(){
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	if(request.msg === "apply_settings"){
	    	ApplySettings(request.settings);
		}
		else if(request.msg === "start_game"){
			CheckForNextGame();
			// StartGame();
		}
		else if(request.msg === "stop_game"){
			StopGame();
		}
		else if(request.msg === "show_game_result"){
			var gameResult = localStorage.getItem("gameWinLose");
			if(sendResponse){
				sendResponse(JSON.parse(gameResult));
			}
		}
		else if(request.msg === "cheking"){
			if(sendResponse){
				sendResponse("checking done");
			}
		}
		else if(request.msg === "tab_url"){
			if(sendResponse){
				sendResponse(location.href);
			}
		}
	  });
	ChangeLinkOfStartGame();
}

function ChangeLinkOfStartGame(){
	var $button = $(".primary_btn");
	$button.attr("onclick","location.href='https://satoshimines.com/newplayer.php?affiliate=aarc'");
	$button.click();
}
Init();
var gSettings = {
	numberOfBombs:1,
    bet:0,
    sessions:3
}
function ApplySettings(settings){
	gSettings = settings;
	gSettings.bet = parseInt(gSettings.bet);
	var betTextBox = document.getElementById("bet");
	betTextBox.value = settings.bet;
	var mine_options = document.getElementsByClassName("mine_options")[0].children;
	var len = mine_options.length;
	for(var i=0;i<len;i++){
		var button = mine_options[i].children[0];
		if(parseInt(button.innerText) === settings.numberOfBombs ){
			button.click();
			break;
		}
	}
	gSettings.sessions = settings.sessions;
}
var $currentGameBlock = null;
var tileInterval = -1;
var startGameCalled = 0;
function StartGame(){
	var startButton = document.getElementById("start_game");
	var gameDivLen = document.getElementsByClassName("game").length;
	startButton.click();
	var gameStartInterval = setInterval(function(){
		var currnetGameLen = document.getElementsByClassName("game").length;
		var hideGame = $(".hidegame");
		if(gameDivLen < currnetGameLen && hideGame.length === 0){
			$currentGameBlock = $($("div.game")[0]);
			clearInterval(gameStartInterval);
			$board = $currentGameBlock.find(".board");
			var board = $board[0];
			var tiles = board.children;
			function StartBot(){
				++startGameCalled;
				console.log("StartBot called : " + startGameCalled);
				var next_val = $currentGameBlock.find(".stand_next .next").text().replace(",","");
				if(parseInt(next_val) !== 0){
					var tileNo = GetNextTileNumber();
					tiles[tileNo].click();
					var findBits = $currentGameBlock.find(".find").length;
					tileInterval = setInterval(function(){
						var currentFindBits = $currentGameBlock.find(".find").length;
						var bomb = $currentGameBlock.find(".bomb").length;
						if(bomb > 0){
							clearInterval(tileInterval);
							CaculateScore();
							// console.log("bombclearInterval : " + tileInterval);
							CheckForNextGame();
						}
						else if(findBits < currentFindBits){
							clearInterval(tileInterval);
							// console.log("clearInterval : " + tileInterval);
							StartBot();
						}
						else{
							// console.log("noInterval Cleared : " + tileInterval );
						}
					}, 1000);
					// console.log("tileInterval : " + tileInterval);
				}
				else{
					CaculateScore();
					CheckForNextGame();
				}
			}
			StartBot();
		}
	}, 1000);
}
var tileClicked = [];
function GetNextTileNumber(){
	do{
		var tileNo = Math.floor(Math.random()*100 %25);
	}while(tileClicked.indexOf(tileNo) !== -1)
	tileClicked.push(tileNo);
	return tileNo;
}
// function StartBot(){
// 	$board = $currentGameBlock.find(".board");
// 	var board = $board[0];
// 	var tiles = board.children;
// 	var next_val = $currentGameBlock.find(".stand_next .next").text().replace(",","");
// 	if(parseInt(next_val) !== 0){
// 		var tileNo = GetNextTileNumber();
// 		tiles[tileNo].click();
// 		var findBits = $currentGameBlock.find(".find").length;
// 		tileInterval = setInterval(function(){
// 			var currentFindBits = $currentGameBlock.find(".find").length;
// 			var bomb = $currentGameBlock.find(".bomb").length;
// 			if(bomb > 0){
// 				clearInterval(tileInterval);
// 				CaculateScore();
// 				console.log("bombclearInterval : " + tileInterval);
// 				CheckForNextGame();
// 			}
// 			else if(findBits < currentFindBits){
// 				clearInterval(tileInterval);
// 				console.log("clearInterval : " + tileInterval);
// 				StartBot();
// 			}
// 			else{
// 				console.log("noInterval Cleared : " + tileInterval );
// 			}
// 		}, 1000);
// 		console.log("tileInterval : " + tileInterval);
// 	}
// 	else{
// 		CaculateScore();
// 		CheckForNextGame();
// 	}
// }
var currentSession = 0;
var lastGameResult = 0;
function CaculateScore(){
	var gameResult = localStorage.getItem("gameWinLose");
	if(!gameResult){
		gameResult = [];
	}
	else{
		gameResult = JSON.parse(gameResult);
	}
	var $bomb = $currentGameBlock.find("p.bomb");
	var result = {};
	if($bomb[0]){
		var text = $bomb.text();
		text = text.replace(",","");
		var numbers = text.match(/\d+/g);
		var lostBits = numbers[1] ? numbers[1] : numbers[0];
		result = {"result":"lost","bits":lostBits};
	}
	else{
		var $stake = $currentGameBlock.find(".stand_stake .stake");
		var win = parseInt($stake.text().replace(",",""));
		result = {"result":"win","bits":win};
	}
	lastGameResult = result.result;
	gameResult.push(result);
	localStorage.setItem("gameWinLose",JSON.stringify(gameResult));
}

function CheckForNextGame(){
	tileClicked = [];
	var betToIncrease = parseInt(gSettings.reduceBits);
	if(!betToIncrease){
		betToIncrease = Math.abs(gSettings.bet /10);
	}
	if(lastGameResult === "win"){

		gSettings.bet += betToIncrease;
	}
	else if(lastGameResult === "lost"){
		gSettings.bet -= betToIncrease;
	}
	ApplySettings(gSettings);
	if(currentSession < gSettings.sessions){
		currentSession++;
		StartGame();
	}
	else{
		window.close();
		window.open("https://satoshimines.com/newplayer.php?affiliate=aarc");
	}
}

function StopGame(){
	clearInterval(tileInterval);
}