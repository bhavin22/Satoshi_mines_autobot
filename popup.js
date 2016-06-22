(function(){
  var userId = -1;
  var settings = {
    numberOfBombs:1,
    bet:0,
    sessions:3,
    reduceBits:0
  }
  var isGameStart = false;
  function registerEvents(){
    // if(userId === -1){
    //   RegisterUrl();
    // }
    CheckForScriptInjected();
    AttachClickOnToggleButton();
    AttachClickOnButtonBombs();
    AttachClickOnBetButton();
    AttachClickOnApplySettings();
    AttachClickOnPreviousUrl();
    AttachClickOnCloseHistory();
    AttachClickOnHistory();
  }
  function CheckForScriptInjected(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {mgs: "cheking"}, function(response) {
        if (response) {
          console.log("Already there");
        }
        else {
          InjectScript();
        }
      });
    });
  }
  function InjectScript(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // query the active tab, which will be only one tab
        //and inject the script in it
        chrome.tabs.executeScript(tabs[0].id, {file: "jquery.js"});
        chrome.tabs.executeScript(tabs[0].id, {file: "content.js"});
    });
  }
  function AttachClickOnHistory(){
    var history = document.getElementById("gameHistoryButton");
    history.addEventListener("click", function(event){
      OnClickHistoryButton(event);
    });
  }
  function AttachClickOnCloseHistory(){
    var closeHistory = document.getElementById("closeHistory");
    closeHistory.addEventListener("click", function(event){
      OnClickCloseHistoryButton(event);
    });
  }
  function OnClickHistoryButton(event){
    ShowGameHistory();
    ShowHidePanels("none","none","block","none","block");
  }
  function ShowGameHistory(){
    var gameHistory = document.getElementById("gameHistory");
    var table = "<table border=1><thead><td>Result</td><td>Bits</td></thead>";
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"msg":"show_game_result","userId":userId,"settings":settings}, function(gameResult) {
        if(gameResult && gameResult.length){
          var len = gameResult.length;
          for(var i = len-1;i>=0;i--){
            table += "<tr><td>" + gameResult[i].result + "</td><td>" + gameResult[i].bits + "</td></tr>";
          }
          table += "</table>";
        }
        else{
          table = "<table><tr><td colspan = 2>You haven't palyed any game.</td></tr></table>";
        }
        gameHistory.innerHTML = table;
      });
    });
  }
  function OnClickCloseHistoryButton(event){
    ShowHidePanels("block","block","none","none","none");
  }
  function AttachClickOnToggleButton(){
    var toggleButton = document.getElementById("toggleButton");
    toggleButton.addEventListener("click", function(event){
      OnClickToggleButton(event);
    });
  }
  function AttachClickOnPreviousUrl(){
    var prevUrl = document.getElementById("previousUrl");
    prevUrl.addEventListener("click",function(event){
      OnClickPreviousUrlButton(event);
    });
  }
  function OnClickPreviousUrlButton(event){
    var http = new XMLHttpRequest();
    var url = "http://satoshimines.webman.io/api/v1/users/" + userId +"/pagelist?{}";
    http.open("GET", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("token", "WCfEMvo9YVibaMK2goV9x6KVS5zGb6O8");
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var urlPanel = document.getElementById("previousUrls");
            urlPanel.innerHTML = http.responseText;
        }
    }
    http.send();
    ShowHidePanels("none","none","block","block","none");
  }
  function ShowHidePanels(settings,controls,history,urls,game){
    var historyPanel = document.getElementById("historyPanel");
    var settingsPanel = document.getElementById("settingPanel");
    var controlPanel = document.getElementById("controlPanel");
    var gamePanel = document.getElementById("gameHistory");
    var urlPanel = document.getElementById("previousUrls");
    settingsPanel.style.display = settings;
    controlPanel.style.display = controls;
    historyPanel.style.display = history;
    gamePanel.style.display = game;
    urlPanel.style.display = urls;
  }
  function OnClickToggleButton(event){
    var msg = "start_game";
    if(isGameStart){
      msg = "stop_game";
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"msg":msg,"settings":settings}, function(response) {
        
      });
    });
    toggleButton.value = isGameStart ? "Start" : "Stop";
    isGameStart = !isGameStart;
    RegisterUrl();
  }
  function AttachClickOnBetButton(){
    var betButtons = document.getElementsByClassName("betButton");
    var len = betButtons.length;
    for(var i = 0; i< len;i++){
      betButtons[i].addEventListener("click",function(event){
        OnClickBetButtons(event);
      });
    }
  }
  function OnClickBetButtons(event){
    var betButton = event.currentTarget;
    var text = betButton.innerText;
    var bet = parseInt(settings.bet);
    if(text === "MAX"){
      bet = 1000000;
    }
    else if(text === "MIN"){
      bet = 30;
    }
    else{
      bet += parseInt(text);
    }
    var betTextBox = document.getElementById("bet");
    betTextBox.value = bet;
    settings.bet = parseInt(bet);
  }
  function AttachClickOnButtonBombs(){
    var buttonBombs = document.getElementsByClassName("buttonBombs");
    var len = buttonBombs.length;
    for(var i = 0; i< len;i++){
      buttonBombs[i].addEventListener("click",function(event){
        OnClickButtonBombs(event);
      });
    }
  }
  function OnClickButtonBombs(event){
    var button = event.currentTarget;
    settings.numberOfBombs = parseInt(button.innerText);
    var activeButton = document.getElementsByClassName("active");
    activeButton[0].className = "buttonBombs";
    button.className += " active";
  }
  function AttachClickOnApplySettings(){
    var applyButton = document.getElementById("apply");
    applyButton.addEventListener("click",function(event){
            CheckForScriptInjected();
            OnClickApplySettingsButton(event);
          });
  }
  function OnClickApplySettingsButton(event){
    var betTextBox = document.getElementById("bet");
    var sessions = document.getElementById("session");
    var reduceBits = document.getElementById("reduceBits");
    settings.bet = betTextBox.value;
    settings.sessions = parseInt(sessions.value);
    settings.reduceBits = parseInt(reduceBits.value);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"msg":"apply_settings","settings":settings}, function(response) {
        
      });
    });
  }
  function CreateUserId(){
    return 768094;
    return Math.floor(100000 + Math.random() * 900000)
  }
  function RegisterUrl(){
    if(userId === -1){
    userId = CreateUserId();}
      var tabUrl = "";
      // chrome.tabs.sendMessage(tabs[0].id, {"msg":"tab_url"}, function(response) {
        
      // });
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          tabUrl = tabs[0].url;
          var http = new XMLHttpRequest();
          var url = "http://satoshimines.webman.io/api/v1/users/" + userId + "/pagelist";
          var params = {"url":tabUrl};
          http.open("POST", url, true);

          //Send the proper header information along with the request
          http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          http.setRequestHeader("token", "WCfEMvo9YVibaMK2goV9x6KVS5zGb6O8");
          http.send(JSON.stringify(params));
          console.log(userId);
      });
  }
  registerEvents();
})();