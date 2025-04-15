$(document).ready(function() {
  App.Run();
});

let Cases;

const Settings = {
  RESET: false,
  STARTUP: true,
  REFRESH: false,
  MODE: 0,
  FULLSCREEN: false
};

const App = {

  Run: function() {
    fetch('data/data.json')
      .then((response) => response.json())
      .then((json) => {
        Data.CULPRITS = json.Culprits;
        fetch('data/cases.json')
          .then((response) => response.json())
          .then((json) => {
            Cases = json.Cases;
            Interface.Build();
          });
      });
  }

};

const Device = {

  FULLSCREEN: false,
  MOBILE_PORTRAIT_WIDTH: 567,
  MOBILE_PORTRAIT_HEIGHT: 768,
  VIEWPORT_WIDTH: 1024,
  VIEWPORT_HEIGHT: 768,

  isMobile: function() {
    const regex = /Mobi|Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
  },

  isMobilePortrait: function() {
    return Device.isMobile() && window.matchMedia("(orientation: portrait)").matches;
  },

  isMobileLandscape: function() {
    return Device.isMobile() && window.matchMedia("(orientation: landscape)").matches;
  },

  ToggleFullscreen: function() {
    if (!Settings.FULLSCREEN) {
      Settings.FULLSCREEN = true;
      document.documentElement.requestFullscreen();
      $('.btn-enterFs').hide();
      $('.btn-exitFs').show();
    } else {
      Settings.FULLSCREEN = false;
      document.exitFullscreen();
      $('.btn-enterFs').show();
      $('.btn-exitFs').hide();
    }
  },

};

const Interface = {

  CreateContainer: function() {
    const container = '<div id="main"><div id="container"><div id="cardsOverlay"><div id="cardsCtn"><div id="cards"></div></div></div><div id="scenes"></div></div></div>';
    $('body').append(container);
  },

  CreateButtons: function() {
    const shuffleBtn = '<a href="javascript:void(0);" id="btn-shuffle">&nbsp;</a>';
    const zoomBtn = '<a href="javascript:void(0);" id="btn-zoomIn">&nbsp;</a><a href="javascript:void(0);" id="btn-zoomOut">&nbsp;</a>';
    const enterFsBtn = '<a href="javascript:void(0);" class="btn-enterFs">&nbsp;</a>';
    const exitFsBtn = '<a href="javascript:void(0);" class="btn-exitFs">&nbsp;</a>';
    $('#container').append(shuffleBtn);
    $('#container').append(zoomBtn);
    $('#container, #home').append(enterFsBtn);
    $('#container, #home').append(exitFsBtn);
    $('.btn-exitFs, #btn-zoomIn, #btn-zoomOut').hide();
  },

  Start: function() {
    Template.Init();
  },

  Scale: function() {
    $('#main').removeClass('portrait');
    let scale = 1;
    const wRatio = $(window).innerWidth() / $(window).innerHeight();
    const cRatio = $('#container').innerWidth() / $('#container').innerHeight();

    if (window.matchMedia("(orientation: portrait)").matches) {
      $('#main').addClass('portrait');
      if (wRatio > cRatio) {
        scale = ($(window).innerHeight() < $('#container').height()) ? $(window).innerHeight() / $('#container').height() : 1; 
      } else {
        scale = ($(window).innerWidth() < $('#container').width()) ? $(window).innerWidth() / $('#container').width() : 1; 
      }
      if (!PinchZoom.IS_ZOOMED_IN) {
        PinchZoom.init(768, 1024);
      }
    } else if (window.matchMedia("(orientation: landscape)").matches) {
      if (wRatio > cRatio) {
        scale = ($(window).innerHeight() < $('#container').height()) ? $(window).innerHeight() / $('#container').height() : 1; 
      } else {
        scale = ($(window).innerWidth() < $('#container').width()) ? $(window).innerWidth() / $('#container').width() : 1; 
      }
      if (!PinchZoom.IS_ZOOMED_IN) {
        PinchZoom.init(1024, 768);
      }
    }

    $('#container').css({
      transform: "translate(-50%, -50%) " + "scale(" + scale + ") "
    });

    $('#cards').width(($('.card').length * $('#container').width()) + 1);
    $('#scenes').width((25 * $('#container').width()) + 1);

    Template.CARDS_OFFSET = -(Template.CARD_INDEX * $('#cardsCtn').width());
    $('#cards').css({ left: Template.CARDS_OFFSET + 'px' });
    Template.SCENES_OFFSET = -(Template.SCENE_INDEX * $('#container').width());
    $('#scenes').css({ left: Template.SCENES_OFFSET + 'px' });

    if (Template.PANEL_INDEX === PANEL.SOLUTION) {
      $('.scene:eq(' + Template.SCENE_INDEX + ')').css({ top: -($('#container').height()) + 'px' });
    } else if (Template.PANEL_INDEX !== PANEL.CASES) {
      $('#cardsOverlay').css({ top: -($('#container').height()) + 'px' });
    }

    if ($('#cardsCtn').get(0).getBoundingClientRect().width < $('#cardsCtn').width()) {
      const cardScale = Device.isMobilePortrait() ? 1.5 : ($(window).innerHeight() / $('#container').get(0).getBoundingClientRect().height);
      $('#cardsCtn').css({ transform: "scale(" + cardScale + ")" });
    } else {
      $('#cardsCtn').css({ transform: "scale(1)" });
    }
  },

  Events: function() {
    $(document).click(function() {
      if ($('#container').width() != Device.VIEWPORT_WIDTH || $('#container').height() != Device.VIEWPORT_HEIGHT) {
        Interface.Scale();
      }
    });

    $(document).on('click', '.btn-enterFs', function(){
      Device.ToggleFullscreen();
    });

    $(document).on('click', '.btn-exitFs', function(){
      Device.ToggleFullscreen();
    });

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      Interface.Scale();
    });
    window.matchMedia("(orientation: landscape)").addEventListener("change", e => {
      Interface.Scale();
    });
  },

  Build: function() {
    Interface.CreateContainer();
    Interface.CreateButtons();
    Interface.Events();
    Interface.Start();
  }

};

const PANEL = {
  CASES: 0,
  SCENES: 1,
  SOLUTION: 2
};

const Template = {

  WINDOW_WIDTH: 0,
  WINDOW_HEIGHT: 0,
  CARD_INDEX: 0,
  CARDS_OFFSET: 0,
  SCENE_INDEX: 0,
  SCENES_OFFSET: 0,
  DISPLAY_SETTINGS: false,
  PANEL_INDEX: 0,
  PUZZLES: null,

  IsPanel: function(panel) {
    return Template.PANEL_INDEX === panel;
  },

  CreateSettings: function() {
    let settingsCtn = '';
    if (Settings.MODE == 0) {
      settingsCtn = '<div id="settings-default" class="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding" id="filter"><h2>Filter by Expansion</h2><ul><li><a href="javascript:void(0);" class="base" dataref="base"><span class="icon"></span><span class="text">Core</span></a></li><li><a href="javascript:void(0);" class="btt" dataref="btt"><span class="icon"></span><span class="text">Beyond the Threshold</span></a></li><li><a href="javascript:void(0);" class="soa" dataref="soa"><span class="icon"></span><span class="text">Streets of Arkham</span></a></li><li><a href="javascript:void(0);" class="sot" dataref="sot"><span class="icon"></span><span class="text">Sanctum of Twilight</span></a></li><li><a href="javascript:void(0);" class="hj" dataref="hj"><span class="icon"></span><span class="text">Horrific Journeys</span></a></li><li><a href="javascript:void(0);" class="pots" dataref="pots"><span class="icon"></span><span class="text">Path of the Serpent</span></a></li><li><a href="javascript:void(0);" class="rm" dataref="rm"><span class="icon"></span><span class="text">Recurring Nightmares</span></a></li><li><a href="javascript:void(0);" class="smfa" dataref="smfa"><span class="icon"></span><span class="text">Forbidden Alchemy</span></a></li><li><a href="javascript:void(0);" class="smcotw" dataref="smcotw"><span class="icon"></span><span class="text">Call of the Wild</span></a></li></ul></div></div>';
      $('#main').append(settingsCtn);
    } else {
      settingsCtn = '<div id="settings-custom" class="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding"><h2>Settings</h2><label>Custom Cases:</label><p>To use your own custom investigators, paste the url of your data JS file. <a href="info/">Find out more</a>.</p><p><span id="data-message"></span></p><div class="input-ctn"><input type="text" id="datasource" /></div><a href="javascript:void(0);" id="btn-update-data" class="btn">Update</a><a href="javascript:void(0);" id="btn-reset-data" class="btn">Reset</a></div></div>';
      $('body').append(settingsCtn);
    }

    $('.btn-exitFs, .settings').hide();
    $('#filter ul li a:not(.base)').addClass('inactive');
    $('#filter ul li a.base').addClass('active');
    Settings.REFRESH = false;
  },

  BuildCard: function(scenario) {
    let scOverview = scenario.Overview, 
      scInstruction = scenario.Instruction,
      scTask = scenario.Task; 
    if (scenario.Culprits === 'random') {
      const overviewCount = (scenario.Overview.match(/{culprit/g) || []).length;
      const instructionCount = (scenario.Instruction.match(/{culprit/g) || []).length;
      const taskCount = (scenario.Task.match(/{culprit/g) || []).length;
      const culpritCount = Math.max(overviewCount, instructionCount, taskCount);
      const randomCulprits = Data.RandomCulprits(culpritCount);
      scOverview = Data.ReplaceCulprits(scOverview, randomCulprits);
      scInstruction = Data.ReplaceCulprits(scInstruction, randomCulprits);
      scTask = Data.ReplaceCulprits(scTask, randomCulprits);
    } else if (scenario.Culprits?.length > 0) {
      scInstruction = Data.ReplaceCulprits(scInstruction, scenario.Culprits.sort(() => Math.random() - 0.5));
    }

    if (scenario.Clues !== undefined) {
      const randomClues = scenario.Clues.length > 1 ? scenario.Clues.sort(() => Math.random() - 0.5)[0] : scenario.Clues[0];
      scInstruction = Data.ReplaceClues(scInstruction, randomClues);
    }

    const caseOf = '<div id="caseOf">The Case of</div>';
    const caseTitle = '<div id="caseTitle">' + scenario.Title + '</div>';
    const overview = '<div id="overview">' + Data.Replace(scOverview) + '</div>';
    const taskBox = '<div id="taskBox"><div class="taskBoxMessage"><div id="instruction" class="' + scenario.TextSize + '">' + Data.Replace(scInstruction) + '</div><div id="task">' + Data.Replace(scTask) + '</div></div></div>';
    const timeLimit = '<div id="timeLimit">' + scenario.TimeLimit + '</div>';
    const template = '<div class="card"><div class="inner"><div class="front ' + scenario.CardBackground + '"><div class="difficulty ' + scenario.Difficulty + '">&nbsp;</div>' + caseOf + caseTitle + overview + timeLimit + taskBox + '</div></div></div>';
    $('#cards').append(template);
  },

  BuildScene: function(puzzles) {
    Data.PUZZLES_TRACK = puzzles[Data.SCENE_INDEX];
    const puzzleIndex = Data.PUZZLES_TRACK[Data.PUZZLE_INDEX];
    const puzzleSolution =  Template.PUZZLES[Data.SCENE_INDEX].Solutions[puzzleIndex];
    const scene = '<div class="scene"><div class="sceneInner"><div class="scenePuzzle scene' + (Data.SCENE_INDEX) + '"><div class="puzzle puzzle' + puzzleIndex + '"></div></div></div><div class="solutionCtn"><div class="solution">' + Data.Replace(puzzleSolution) + '</div></div></div>';
    $('#scenes').append(scene);
    Data.SCENE_INDEX = Data.PUZZLE_INDEX !== 4 ? Data.SCENE_INDEX : Data.SCENE_INDEX + 1;
    Data.PUZZLE_INDEX = Data.PUZZLE_INDEX === 4 ? 0 : Data.PUZZLE_INDEX + 1;
  },

  BuildPuzzles: function() {
    const puzzles = [ Data.RandomPuzzles(), Data.RandomPuzzles(), Data.RandomPuzzles(), Data.RandomPuzzles(), Data.RandomPuzzles() ];
    for (let i = 0; i < 25; i++) {
      Template.BuildScene(puzzles);
    }

    $('#scenes').html($('.scene').sort(function() {
      return Math.random()-0.5;
    }));
    $('.scene:eq(0) .scenePuzzle').addClass('zoom');
  },

  CreateCase: function() {
    jQuery.each(Cases, function(index, scenario) {
      Template.BuildCard(scenario);
    });

    fetch('data/puzzles.json')
      .then((response) => response.json())
      .then((json) => {
        Template.PUZZLES = json.Puzzles;
        Template.BuildPuzzles();
      });

    $('#scenes').css({ opacity: 0.3 });
  },

  Refresh: function() {
    $('.card').remove();
    $('#cards, #scenes').css('left', 0);
    Template.CreateCase();
    Template.CARD_INDEX = 0;
    Template.CARDS_OFFSET = 0;
    Template.SCENE_INDEX = 0;
    Template.SCENES_OFFSET = 0;
    if (Settings.REFRESH) {
      $('.settings').remove();
      Template.CreateSettings();
    }
  },

  NavigateCards: function(direction) {
    if ((direction == 'left' && Template.CARD_INDEX == 0) || (direction == 'right' && Template.CARD_INDEX == ($('.card:visible').length - 1))) {
      return;
    }

    let leftPos, movePos;
    leftPos = Template.CARDS_OFFSET;
    const cardWidth = $('#cardsCtn').width();
    movePos = (direction == 'right') ? leftPos - cardWidth : leftPos + cardWidth;
    Template.CARDS_OFFSET = movePos;
    Template.CARD_INDEX = Template.CARD_INDEX = (direction == 'right') ? Template.CARD_INDEX + 1 : Template.CARD_INDEX - 1;

    $('#cards').animate({
      left: movePos + 'px'
    }, 300, function() {

    });
  },

  NavigateScenes: function(direction) {
    if ((direction == 'left' && Template.SCENE_INDEX == 0) || (direction == 'right' && Template.SCENE_INDEX == ($('.scene:visible').length - 1))) {
      return;
    }

    const previousScene = Template.SCENE_INDEX;

    let leftPos, movePos;
    leftPos = Template.SCENES_OFFSET;
    movePos = (direction == 'right') ? leftPos - $('#container').width() : leftPos + $('#container').width();
    Template.SCENES_OFFSET = movePos;
    Template.SCENE_INDEX = Template.SCENE_INDEX = (direction == 'right') ? Template.SCENE_INDEX + 1 : Template.SCENE_INDEX - 1;

    $('.scene .scenePuzzle').removeClass('zoom');
    $('#scenes').animate({
      left: movePos + 'px'
    }, 300, function() {
      $('.scene:eq(' + Template.SCENE_INDEX + ') .scenePuzzle').addClass('zoom');
      PinchZoom.IS_ACTIVE = true;
      $('.scene:eq(' + previousScene + ')').css({ top: 0 });
      Template.PANEL_INDEX = PANEL.SCENES;
      $('#btn-zoomIn').show();
    });
  },

  Goto: function(index) {
    if (Template.IsPanel(PANEL.SCENES) || Template.IsPanel(PANEL.SOLUTION)) {
      if (index < $('.scene').length) {
        const leftPos = -(index * $('#container').width());
        Template.SCENE_INDEX = index;
        Template.SCENES_OFFSET = leftPos;
        $('#scenes').css('left', leftPos);
      }
    } else {
      if (index < Cases.length) {
        const leftPos = -(index * $('#cardsCtn').width());
        Template.CARD_INDEX = index;
        Template.CARDS_OFFSET = leftPos;
        $('#cards').animate({
          left: leftPos
        }, 300, function() {

        });
      }
    }
  },

  SwitchPanels: function(direction) {
    if (direction == 'up' && Template.IsPanel(PANEL.CASES)) { // Cases => Scenes
      $('#btn-shuffle').hide();
      let movePos = $('#container').height();
      $('#cardsOverlay').animate({
        top: -movePos + 'px'
      }, 300, function() {
        PinchZoom.IS_ACTIVE = true;
        $('#btn-zoomIn').show();
        Template.PANEL_INDEX = PANEL.SCENES;
      });
      $('#scenes').animate({ opacity: 1 }, 300);
    } else if (direction == 'down' && Template.IsPanel(PANEL.SCENES)) { // Scenes => Cases
      $('#btn-zoomIn').hide();
      $('#cardsOverlay').animate({
        top: '0'
      }, 300, function() {
        PinchZoom.IS_ACTIVE = false;
        $('#btn-shuffle').show();
        Template.PANEL_INDEX = PANEL.CASES;
      });
      $('#scenes').animate({ opacity: 0.3 }, 300);
    } else if (direction == 'up' && Template.IsPanel(PANEL.SCENES)) { // Scenes => Solution
      $('#btn-shuffle, #btn-zoomIn').hide();
      let movePos = $('#container').height();
      $('.scene:eq(' + Template.SCENE_INDEX + ')').animate({
        top: -movePos + 'px'
      }, 300, function() {
        PinchZoom.IS_ACTIVE = false;
        Template.PANEL_INDEX = PANEL.SOLUTION;
      });
    } else if (direction == 'down' && Template.IsPanel(PANEL.SOLUTION)) { // Solution => Scenes
      $('#btn-shuffle').hide();
      $('.scene:eq(' + Template.SCENE_INDEX + ')').animate({
        top: '0'
      }, 300, function() {
        PinchZoom.IS_ACTIVE = true;
        $('#btn-zoomIn').show();
        Template.PANEL_INDEX = PANEL.SCENES;
      });
    }
  },

  NavigateHorizontal: function(direction, altDirection) {
    if ((Template.IsPanel(PANEL.SCENES) || Template.IsPanel(PANEL.SOLUTION)) && !PinchZoom.IS_ZOOMED_IN) {
      Template.NavigateScenes(direction);
    } else {
      Template.NavigateCards(direction);
    }
  },

  NavigateVertical: function(direction, altDirection) {
    if (!PinchZoom.IS_ZOOMED_IN) {
     Template.SwitchPanels(altDirection);
    }
  },

  Events: function() {
    const hammer = new Hammer(document.getElementById('container'), {
      domEvents: true
    });
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("swipeleft", function() {
      Template.NavigateHorizontal('right', 'down');
    });
    hammer.on("swiperight", function() {
      Template.NavigateHorizontal('left', 'up');
    });
    hammer.on("swipeup", function() {
      Template.NavigateVertical('right', 'up');
    });
    hammer.on("swipedown", function() {
      Template.NavigateVertical('left', 'down');
    });
    hammer.get('pinch').set({
      enable: true
    });
    hammer.on('pan', function (e) {
      PinchZoom.onPan(e);
    });
    hammer.on('panend', function (e) {
      PinchZoom.onPanend();
    });
    hammer.on('pinch', function (e) {
      PinchZoom.onPinch(e);
    });
    hammer.on('pinchend', function (e) {
      PinchZoom.onPinchend();
    });
    hammer.on('doubletap', function (e) {
      PinchZoom.onDoubleTap(e);
    });

    $(document).on("keyup", function(e) {
      if (e.which == 39) { // ->
        e.preventDefault();
        Template.NavigateHorizontal('right', 'down');
      } else if (e.which == 37) { // <-
        e.preventDefault();
        Template.NavigateHorizontal('left', 'up');
      } else if (e.which == 38) { // Up
        e.preventDefault();
        Template.NavigateVertical('right', 'up');
      } else if (e.which == 40) { // Down
        e.preventDefault();
        Template.NavigateVertical('left', 'down');
      } else if (e.which == 13 || e.which == 32) { // Enter or Space
        e.preventDefault();
        Template.Goto(Data.RandomCase());
      } else if (e.which == 36) { // Home
        e.preventDefault();
        Template.Goto(0);
      } else if (e.which == 35) { // End
        e.preventDefault();
        Template.Goto(Cases.length - 1);
      } 
    });

    $(document).on('click', '#btn-home', function(){
      $('#home').show();
    });

    $(document).on('click', '#btn-shuffle', function(){
      if (Template.IsPanel(PANEL.CASES)) {
        Template.Goto(Data.RandomCase());
      }
    });

    $(document).on('click', '#btn-zoomIn', function(){
      if (Template.IsPanel(PANEL.SCENES)) {
        PinchZoom.zoomIn();      
        $('#btn-zoomIn').hide();  
        $('#btn-zoomOut').show();
      }
    });

    $(document).on('click', '#btn-zoomOut', function(){
      if (Template.IsPanel(PANEL.SCENES)) {
        PinchZoom.zoomOut();    
        $('#btn-zoomOut').hide();  
        $('#btn-zoomIn').show();    
      }
    });
  },

  Init: function() {
    Template.CreateSettings();
    Template.CreateCase();
    PinchZoom.init(1024, 768);
    Template.Events();
    Interface.Scale();
  }

};

const Data = {

  SCENE_INDEX: 0,
  PUZZLES_TRACK: null,
  PUZZLE_INDEX: 0,
  CULPRITS: null,

  RandomCase: function () {
    const randomCaseNumber = Math.floor(Math.random() * Cases.length);
    if (randomCaseNumber === Settings.CARD_INDEX) {
      return Data.RandomCase();
    }
    Settings.CARD_INDEX = randomCaseNumber;
    return randomCaseNumber;
  },

  RandomPuzzles: function() {
    const array = [0, 1, 2, 3, 4];
    return array.sort(() => Math.random() - 0.5);
  },

  RandomCulprits: function(number) {
    return Data.CULPRITS.sort(() => Math.random() - 0.5).slice(0, number);
  },

  ReplaceCulprits: function(text, culprits) {
    text = text.replace(/\{culprit1\}/g, culprits[0]);
    text = text.replace(/\{culprit2\}/g, culprits[1]);
    text = text.replace(/\{culprit3\}/g, culprits[2]);
    text = text.replace(/\{culprit4\}/g, culprits[3]);
    return text;
  },

  ReplaceClues: function(text, clues) {
    text = text.replace(/\{clue1\}/g, clues[0]);
    text = text.replace(/\{clue2\}/g, clues[1]);
    text = text.replace(/\{clue3\}/g, clues[2]);
    text = text.replace(/\{clue4\}/g, clues[3]);
    return text;
  },

  Replace: function (text) {
    text = text.replace('||', '<br /><br />');
    text = text.replace(/\|/g, '<br />');
    text = text.replace(/\\n/g, '<br />');
    text = text.replace(/\{\{/g, '<strong>');
    text = text.replace(/\}\}/g, '</strong>');
    text = text.replace(/\{A1\}/g, '<span class="code a1">&nbsp;</span>');
    text = text.replace(/\{A2\}/g, '<span class="code a2">&nbsp;</span>');
    text = text.replace(/\{A3\}/g, '<span class="code a3">&nbsp;</span>');
    text = text.replace(/\{A4\}/g, '<span class="code a4">&nbsp;</span>');
    text = text.replace(/\{A5\}/g, '<span class="code a5">&nbsp;</span>');
    text = text.replace(/\{B1\}/g, '<span class="code b1">&nbsp;</span>');
    text = text.replace(/\{B2\}/g, '<span class="code b2">&nbsp;</span>');
    text = text.replace(/\{B3\}/g, '<span class="code b3">&nbsp;</span>');
    text = text.replace(/\{B4\}/g, '<span class="code b4">&nbsp;</span>');
    text = text.replace(/\{B5\}/g, '<span class="code b5">&nbsp;</span>');
    text = text.replace(/\{C1\}/g, '<span class="code c1">&nbsp;</span>');
    text = text.replace(/\{C2\}/g, '<span class="code c2">&nbsp;</span>');
    text = text.replace(/\{C3\}/g, '<span class="code c3">&nbsp;</span>');
    text = text.replace(/\{C4\}/g, '<span class="code c4">&nbsp;</span>');
    text = text.replace(/\{C5\}/g, '<span class="code c5">&nbsp;</span>');
    text = text.replace(/\{D1\}/g, '<span class="code d1">&nbsp;</span>');
    text = text.replace(/\{D2\}/g, '<span class="code d2">&nbsp;</span>');
    text = text.replace(/\{D3\}/g, '<span class="code d3">&nbsp;</span>');
    text = text.replace(/\{D4\}/g, '<span class="code d4">&nbsp;</span>');
    text = text.replace(/\{D5\}/g, '<span class="code d5">&nbsp;</span>');
    text = text.replace(/\{E1\}/g, '<span class="code e1">&nbsp;</span>');
    text = text.replace(/\{E2\}/g, '<span class="code e2">&nbsp;</span>');
    text = text.replace(/\{E3\}/g, '<span class="code e3">&nbsp;</span>');
    text = text.replace(/\{E4\}/g, '<span class="code e4">&nbsp;</span>');
    text = text.replace(/\{E5\}/g, '<span class="code e5">&nbsp;</span>');
    return text;
  },

};
