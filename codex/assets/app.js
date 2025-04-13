$(document).ready(function() {
  App.Run();
});

const App = {
  Run: function() {
    Global.Init();
    Interface.Init();
  }
};

const Global = {
  TUMBLER_COUNT: 5,
  CODE_COUNT: 5,
  SELECTED_TUMBLER: 0,
  TUMBLER_CODE: [ 0, 0, 0, 0, 0 ],
  
  Init: function() {
    Global.TUMBLER_CODE = [ Global.CODE_COUNT, Global.CODE_COUNT, Global.CODE_COUNT, Global.CODE_COUNT, Global.CODE_COUNT ];
  }
};

const Device = {

  IS_ROTATED: false,

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

  Scale: function() {
    let scale = 1, rotation = 0;
    Device.IS_ROTATED = false;
    if (Device.isMobilePortrait()) {
      rotation = '90deg';
      scale = $(window).innerWidth() / 400;
      Device.IS_ROTATED = true;
    } else if (Device.isMobileLandscape()) {
      rotation = '0deg';
      scale = $(window).innerHeight() / 400;
    } else {
      rotation = '0deg';
    }
    $('#container').css({
      transform: "translate(-50%, -50%) " + "scale(" + scale + ") " + "rotate(" + rotation + ")"
    });
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

const Codex = {

  SelectTumbler: function(direction) {
    Global.SELECTED_TUMBLER = Global.SELECTED_TUMBLER + direction;
    Global.SELECTED_TUMBLER = Global.SELECTED_TUMBLER > 4 ? 0 : Global.SELECTED_TUMBLER;
    Global.SELECTED_TUMBLER = Global.SELECTED_TUMBLER < 0 ? 4 : Global.SELECTED_TUMBLER;
    $('.tumbler').removeClass('selected');
    $('.tumbler:eq(' + Global.SELECTED_TUMBLER + ')').addClass('selected');
  },

  ResetSelected: function() {
    Global.SELECTED_TUMBLER = 0;
    $('.tumbler').removeClass('selected');
  },

  Reset: async function() {
    Global.Init();
    $('.inner').css({
      marginTop:  -(($('.code').height() * 4) + ($('.code').height() / 2)) + 'px'
    });
    Codex.SetCodeStyles();
  },

  SetCodeStyles: function(codes) {
    Global.TUMBLER_CODE.forEach((i, index) => {
      $(`.inner:eq(${index}) .code`).each(function(codeIndex, el) {
        $(el).removeClass('active').removeClass('previous').removeClass('next');
        if (codeIndex === i) {
          $(el).addClass('active');
        }
        if (codeIndex < i) {
          $(el).addClass('previous');
        }
        if (codeIndex > i) {
          $(el).addClass('next');
        }
      });
    });
  },

  MoveUp: function(i) {
    const movePos = ($('.code').height() * Global.TUMBLER_CODE[i]) + ($('.code').height() / 2);
    $(`.tumbler:eq(${i})`).find('.inner').animate({
      marginTop: -movePos + 'px'
    }, 100, function() {
      Global.TUMBLER_CODE[i] = Global.TUMBLER_CODE[i] + 1;
      if (Global.TUMBLER_CODE[i] === (Global.CODE_COUNT * 2) - 1) {
        Global.TUMBLER_CODE[i] = 3;
        const newPos = ($('.code').height() * Global.TUMBLER_CODE[i]) - ($('.code').height() / 2);
        $(`.tumbler:eq(${i})`).find('.inner').css({ marginTop: -newPos + 'px' });
      }
      Codex.SetCodeStyles();
    });
  },

  MoveDown: function(i) {
    const movePos = ($('.code').height() * (Global.TUMBLER_CODE[i] - 1)) - ($('.code').height() / 2);
    $(`.tumbler:eq(${i})`).find('.inner').animate({
      marginTop: -movePos + 'px'
    }, 100, function() {
      Global.TUMBLER_CODE[i] = Global.TUMBLER_CODE[i] - 1;
      if (Global.TUMBLER_CODE[i] === 1) {
        Global.TUMBLER_CODE[i] = Global.TUMBLER_CODE[i] + Global.CODE_COUNT + 1;
        const newPos = ($('.code').height() * Global.TUMBLER_CODE[i]) - ($('.code').height() / 2);
        $(`.tumbler:eq(${i})`).find('.inner').css({ marginTop: -newPos + 'px' });
      }
      Codex.SetCodeStyles();
    });
  },

};

const Interface = {

  CreateTumbler: function(index) {
    let codes = '';
    for (let i = 0; i < 12; i++) {
      codes += `<div class="code"><div class="symbol symbol${(i % 6)}"></div></div>`;
    }
    const tumbler = `<div class="tumbler tumbler${index}"><div class="outer"><div class="inner">${codes}</div></div></div>`;
    return tumbler;
  },

  BuildCodex: function() {
    let tumblers = '';
    for (let i = 0; i < 5; i++) {
      tumblers += Interface.CreateTumbler(i);
    }
    const codex = `<div id="codex">${tumblers}</div>`;
    const container = `<div id="main"><div id="container">${codex}</div></div>`;
    $('body').append(container);
    $('.tumbler').first().addClass('first');
    $('.tumbler').last().addClass('last');
    $('.inner').css({
      marginTop:  -(($('.code').height() * 4) + ($('.code').height() / 2)) + 'px'
    });
    Codex.SetCodeStyles();
  },

  Events: function() {
    $('.tumbler').each(function(i, el){
      const $el = $(el);
      const hammer = new Hammer(el, {
        domEvents: true
      });
      hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
      hammer.on('swipeup', function () {
        if (Device.IS_ROTATED) { return; }
        $('.tumbler').removeClass('selected');
        Codex.MoveUp(i);
      });
      hammer.on('swipedown', function () {
        if (Device.IS_ROTATED) { return; }
        $('.tumbler').removeClass('selected');
        Codex.MoveDown(i);
      });
      hammer.on('swipeleft', function () {
        if (!Device.IS_ROTATED) { return; }
        $('.tumbler').removeClass('selected');
        Codex.MoveDown(i);
      });
      hammer.on('swiperight', function () {
        if (!Device.IS_ROTATED) { return; }
        $('.tumbler').removeClass('selected');
        Codex.MoveUp(i);
      });
    });

    const hammer = new Hammer(document, {
      domEvents: true
    });
    hammer.on('doubletap', function (e) {
      Codex.Reset();
    });

    $(document).on("keyup", function(e) {
      if (e.which == 39) { // ->
        e.preventDefault();
        Codex.SelectTumbler(1);
      } else if (e.which == 37) { // <-
        e.preventDefault();
        Codex.SelectTumbler(-1);
      } else if (e.which == 38) { // Up
        e.preventDefault();
        Codex.SelectTumbler(0);
        Codex.MoveUp(Global.SELECTED_TUMBLER);
      } else if (e.which == 40) { // Down
        e.preventDefault();
        Codex.SelectTumbler(0);
        Codex.MoveDown(Global.SELECTED_TUMBLER);
      } else if (e.which == 13 || e.which == 32) { // Enter or Space
        e.preventDefault();
        Codex.Reset();
      } else if (e.which == 36) { // Home
        e.preventDefault();
      } else if (e.which == 35) { // End
        e.preventDefault();
      } else if (e.which == 27) { // Escape
        Codex.ResetSelected();
      }
    });

    $(document).on("click", function() {
      $('.tumbler').removeClass('selected');
      Device.Scale();
    });

    $(document).on("dblclick", function() {
      Codex.Reset();
    });
  },

  Init: function() {
    Interface.BuildCodex();
    Interface.Events();
    Device.Scale();
  }

};