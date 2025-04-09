$(document).ready(function() {
  App.Run();
});

let Cases;

const Settings = {
  DEFAULT_SOURCE: 'data-cases.json',
  CUSTOMSOURCE: 'investigators-custom.js',
  DATASOURCE: 'investigators-default.js',
  RESET: false,
  STARTUP: true,
  REFRESH: false,
  MODE: 0,
  FULLSCREEN: false
};

const App = {

  Run: function() {
    Interface.Build();
  }

};

const Device = {

  isMobile: function() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
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
      $('.btn-enterfs').hide();
      $('.btn-exitfs').show();
    } else {
      Settings.FULLSCREEN = false;
      document.exitFullscreen();
      $('.btn-enterfs').show();
      $('.btn-exitfs').hide();
    }
  },

};

const Interface = {

  DEFAULT_WIDTH: 825,
  DEFAULT_HEIGHT: 1152,
  WINDOW_WIDTH: 0,
  WINDOW_HEIGHT: 0,

  CreateContainer: function() {
    const container = '<div id="main"><div id="container"><div id="cards"></div><div id="scenes"></div></div></div>';
    $('body').append(container);
  },

  CreateStartpage: function() {
    //const startPage = '<div id="home"><div class="padding"><a href="javascript:void(0);" id="btn-standard" class="cta noselect" dataref="0"></a><a href="javascript:void(0);" id="btn-custom" class="cta noselect" dataref="2"></a></div></div>';
    //$('#main').append(startPage);
    Interface.Scale();
  },

  CreateButtons: function() {
    const homeBtn = '<a href="javascript:void(0);" id="btn-home">&nbsp;</a>';
    const settingsBtn = '<a href="javascript:void(0);" id="btn-settings">&nbsp;</a>';
    const infoBtn = '<a href="info/" id="btn-info">&nbsp;</a>';
    const enterfsBtn = '<a href="javascript:void(0);" class="btn-enterfs">&nbsp;</a>';
    const exitfsBtn = '<a href="javascript:void(0);" class="btn-exitfs">&nbsp;</a>';
    $('#container').append(homeBtn);
    //$('#container').append(settingsBtn);
    $('#home').append(infoBtn);
    $('#container, #home').append(enterfsBtn);
    $('#container, #home').append(exitfsBtn);
    $('.btn-exitfs').hide();
  },

  Start: function() {
    $('#home').hide();
      Settings.MODE = 0;
      Settings.REFRESH = true;
      Settings.DATASOURCE = Settings.DEFAULT_SOURCE;
      Data.LoadDataSource(Settings.DATASOURCE);
  },

  Scale: function() {
    let scale, rotation;
    scale = (462 / Interface.DEFAULT_WIDTH);

    if (Device.isMobileLandscape()) {
      rotation = '90deg';
      scale = ($(window).innerHeight() - 20) / Interface.DEFAULT_WIDTH;
    } else if (Device.isMobilePortrait()) {
      rotation = '0deg';
      scale = ($(window).innerWidth() - 20) / Interface.DEFAULT_WIDTH;
    } else {
      rotation = '0deg';
    }

    $('#home, #container, .settings').css({
      transform: "translate(-50%, -50%) " + "scale(" + scale + ") " + "rotate(" + rotation + ")"
    });

    $('#cards').width(($('.card:visible').length * $('#container').width()) + 1);
    $('#scenes').width(($('.scene:visible').length * $('#container').width()) + 1);
  },

  Events: function() {
    $(document).click(function() {
      if ($('#container').width() != Interface.WINDOW_WIDTH || $('#container').height() != Interface.WINDOW_HEIGHT) {
        Interface.Scale();
      }
    });

    $(document).on('click', '#btn-standard', function(){
      Interface.Start();
    });

    $(document).on('click', '#btn-custom', function(){
      $('#home').hide();
      Settings.MODE = 2;
      Settings.REFRESH = true;
      Settings.DATASOURCE = Settings.CUSTOMSOURCE;
      Data.LoadDataSource(Settings.DATASOURCE);
    });

    $(document).on('click', '.btn-enterfs', function(){
      Device.ToggleFullscreen();
    });

    $(document).on('click', '.btn-exitfs', function(){
      Device.ToggleFullscreen();
    });

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      if (Device.isMobile()) {
        Interface.Scale();
      }
    });
  },

  Build: function() {
    Interface.CreateContainer();
    Interface.CreateStartpage();
    Interface.CreateButtons();
    Interface.Events();
    Interface.Start();
  }

};

const Template = {

  DEFAULT_WIDTH: 1406,
  DEFAULT_HEIGHT: 815,
  WINDOW_WIDTH: 0,
  WINDOW_HEIGHT: 0,
  CARD_INDEX: 0,
  CARDS_OFFSET: 0,
  SCENE_INDEX: 0,
  SCENES_OFFSET: 0,
  DISPLAY_SETTINGS: false,
  SHOW_SCENES: false,
  SHOW_STORY: false,

  CreateSettings: function() {
    let settingsCtn = '';
    if (Settings.MODE == 0) {
      settingsCtn = '<div id="settings-default" class="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding" id="filter"><h2>Filter by Expansion</h2><ul><li><a href="javascript:void(0);" class="base" dataref="base"><span class="icon"></span><span class="text">Core</span></a></li><li><a href="javascript:void(0);" class="btt" dataref="btt"><span class="icon"></span><span class="text">Beyond the Threshold</span></a></li><li><a href="javascript:void(0);" class="soa" dataref="soa"><span class="icon"></span><span class="text">Streets of Arkham</span></a></li><li><a href="javascript:void(0);" class="sot" dataref="sot"><span class="icon"></span><span class="text">Sanctum of Twilight</span></a></li><li><a href="javascript:void(0);" class="hj" dataref="hj"><span class="icon"></span><span class="text">Horrific Journeys</span></a></li><li><a href="javascript:void(0);" class="pots" dataref="pots"><span class="icon"></span><span class="text">Path of the Serpent</span></a></li><li><a href="javascript:void(0);" class="rm" dataref="rm"><span class="icon"></span><span class="text">Recurring Nightmares</span></a></li><li><a href="javascript:void(0);" class="smfa" dataref="smfa"><span class="icon"></span><span class="text">Forbidden Alchemy</span></a></li><li><a href="javascript:void(0);" class="smcotw" dataref="smcotw"><span class="icon"></span><span class="text">Call of the Wild</span></a></li></ul></div></div>';
      $('#main').append(settingsCtn);
    } else {
      settingsCtn = '<div id="settings-custom" class="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding"><h2>Settings</h2><label>Custom Cases:</label><p>To use your own custom investigators, paste the url of your data JS file. <a href="info/">Find out more</a>.</p><p><span id="data-message"></span></p><div class="input-ctn"><input type="text" id="datasource" /></div><a href="javascript:void(0);" id="btn-update-data" class="btn">Update</a><a href="javascript:void(0);" id="btn-reset-data" class="btn">Reset</a></div></div>';
      $('body').append(settingsCtn);
    }

    $('.btn-exitfs, .settings').hide();
    $('#filter ul li a:not(.base)').addClass('inactive');
    $('#filter ul li a.base').addClass('active');
    Settings.REFRESH = false;
  },

  BuildCard: function(scenario) {
    const caseOf = '<div id="caseOf">The Case of</div>';
    const caseTitle = '<div id="caseTitle">' + scenario.Title + '</div>';
    const overview = '<div id="overview">' + Data.Replace(scenario.Overview) + '</div>';
    const taskBox = '<div id="taskBox"><div class="taskBoxMessage"><div id="instruction" class="' + scenario.TextSize + '">' + Data.Replace(scenario.Instruction) + '</div><div id="task">' + scenario.Task + '</div></div></div>';
    const timeLimit = '<div id="timeLimit">' + scenario.TimeLimit + '</div>';
    const template = '<div class="card"><div class="inner"><div class="front ' + scenario.CardBackground + '"><div class="difficulty ' + scenario.Difficulty + '">&nbsp;</div>' + caseOf + caseTitle + overview + timeLimit + taskBox + '</div></div></div>';
    $('#cards').append(template);
  },

  BuildScene: function(index, puzzles) {
    const scene = '<div class="scene scene' + (index % 5) + '"><div class="puzzle puzzle' + (puzzles[(index % 5)][Data.SCENE_TRACK[(index % 5)]]) + '"></div></div>';
    $('#scenes').append(scene);
    Data.SCENE_TRACK[(index % 5)] += 1;
  },

  CreateCase: function() {
    jQuery.each(Cases, function(index, scenario) {
      Template.BuildCard(scenario);
    });

    const puzzles = [ Data.RandomPuzzles(), Data.RandomPuzzles(), Data.RandomPuzzles(), Data.RandomPuzzles(), Data.RandomPuzzles() ];
    for (let i = 0; i < 25; i++) {
      Template.BuildScene(i, puzzles);
    }

    $('#scenes').html($('.scene').sort(function() {
      return Math.random()-0.5;
    }));
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
    movePos = (direction == 'right') ? leftPos - $('#container').width() : leftPos + $('#container').width();
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

    let leftPos, movePos;
    leftPos = Template.SCENES_OFFSET;
    movePos = (direction == 'right') ? leftPos - $('#container').width() : leftPos + $('#container').width();
    Template.SCENES_OFFSET = movePos;
    Template.SCENE_INDEX = Template.SCENE_INDEX = (direction == 'right') ? Template.SCENE_INDEX + 1 : Template.SCENE_INDEX - 1;

    $('#scenes').animate({
      left: movePos + 'px'
    }, 300, function() {

    });
  },

  Goto: function(index) {
    if (Template.SHOW_SCENES) {
      if (index < $('.scene').length) {
        const leftPos = -(index * $('#container').width());
        Template.SCENE_INDEX = index;
        Template.SCENES_OFFSET = leftPos;
        $('#scenes').css('left', leftPos);
      }
    } else {
      if (index < Cases.length) {
        const leftPos = -(index * $('#container').width());
        Template.CARD_INDEX = index;
        Template.SHOW_STORY = false;
        Template.CARDS_OFFSET = leftPos;
        $('#cards').css('left', leftPos);
      }
    }
  },

  ShowStory: function(direction) {
    if (direction == 'up' && !Template.SHOW_SCENES) {
      Template.SHOW_SCENES = true;
      let movePos = $('#container').height();
      $('#cards').animate({
        top: -movePos + 'px'
      }, 300);
    } else if (direction == 'down' && Template.SHOW_SCENES) {
      Template.SHOW_SCENES = false;
      $('#cards').animate({
        top: '0'
      }, 300);
    }
  },

  NavigateHorizontal: function(direction, altDirection) {
    if (!Template.DISPLAY_SETTINGS) {
      if (Device.isMobileLandscape()) {
        Template.ShowStory(altDirection);
      } else {
        if (Template.SHOW_SCENES) {
          Template.NavigateScenes(direction);
        } else {
          Template.NavigateCards(direction);
        }
      }
    }
  },

  NavigateVertical: function(direction, altDirection) {
    if (!Template.DISPLAY_SETTINGS) {
      if (Device.isMobileLandscape()) {
        if (Template.SHOW_SCENES) {
          Template.NavigateScenes(direction);
        } else {
          Template.NavigateCards(direction);
        }
      } else {
        Template.ShowStory(altDirection);
      }
    }
  },

  Events: function() {
    const hitArea = document.getElementById('container');
    const hammer = new Hammer(hitArea);
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

    $(document).on("keyup", function(e) {
      if (e.which == 39) {
        e.preventDefault();
        Template.NavigateHorizontal('right', 'down');
      } else if (e.which == 37) {
        e.preventDefault();
        Template.NavigateHorizontal('left', 'up');
      } else if (e.which == 38) {
        e.preventDefault();
        Template.NavigateVertical('right', 'up');
      } else if (e.which == 40) {
        e.preventDefault();
        Template.NavigateVertical('left', 'down');
      } else if (e.which == 13 || e.which == 32) {
        e.preventDefault();
        Template.Goto(Data.RandomCase());
      } else if (e.which == 36) {
        e.preventDefault();
        Template.Goto(0);
      } else if (e.which == 35) {
        e.preventDefault();
        Template.Goto(Cases.length - 1);
      } 
    });

    $(document).on('click', '#btn-home', function(){
      $('#home').show();
    });

    $(document).on('click', '#btn-settings', function(){
      if (!Template.DISPLAY_SETTINGS) {
        $('.settings').show();
        Template.DISPLAY_SETTINGS = true;
        $('.btn-exitfs, .btn-enterfs, #btn-settings').hide();
      }
    });

    $(document).on('click', '#btn-exit-settings', function(){
      if (Template.DISPLAY_SETTINGS) {
        $('.settings').hide();
        Template.DISPLAY_SETTINGS = false;
        if (Template.FULLSCREEN) {
          $('.btn-enterfs').hide();
          $('.btn-exitfs, #btn-settings').show();
        } else {
          $('.btn-enterfs, #btn-settings').show();
          $('.btn-exitfs').hide();
        }
        $('#data-message').text('');
      }
    });
  },

  Init: function() {
    Template.CreateSettings();
    Template.CreateCase();
    Template.Events();
    Interface.Scale();
  }

};

const Data = {

  SCENE_TRACK: [0, 0, 0, 0, 0],

  LoadDataSource: function(url) {
    url = Data.Clean(url);
    console.log(url);
    $.ajax({
      dataType: "json",
      url: url,
      async: false,
      success: function(data) {
        console.log(data);
        Cases = data.Cases;
        
        if (Settings.STARTUP) {
          Template.Init();
          Settings.STARTUP = false;
        } else {
          Template.Refresh();
          if (Settings.DATASOURCE != Settings.CUSTOMSOURCE && !Settings.RESET) {
            $('#data-message').removeClass('error');
            $('#data-message').text('Datasource updated. Using custom Cases.');
          } else if (Settings.RESET && !Settings.REFRESH) {
            $('#data-message').removeClass('error');
            $('#data-message').text('Using Default Cases.');
          }
        }
      },
      error: function() {
        $('#data-message').addClass('error');
        $('#data-message').text('Could not get data.');
      }
    });
  },

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
    return array.sort((a, b) => 0.5 - Math.random());
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

  Format: function(text) {
    text = text.replace('\n\n', '<br /><br />');
    text = text.replace(/\\n/g, '<br />');
    text = text.replace(/\{/g, '<i>&quot;');
    text = text.replace(/\}/g, '&quot;</i>');
    text = text.replace(/\[/g, '<strong>');
    text = text.replace(/\]/g, '</strong>');
    return text;
  },

  Clean: function(url) {
    if (url.indexOf('dropbox.com') > -1) {
      url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      url = url.replace('?dl=0', '?raw=1');
    }
    return url;
  }

};
