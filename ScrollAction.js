'use strict';

// класс реагирования элемента на сролл документа

var $ = require('jquery'),
    Class = require('class.extend');

module.exports = MinimalClass.extend({ // TODO
  __className: 'ScrollAction',
  create: function()
  {
    this.initScrollAction();
    this.createScrollAction();
  },
  createScrollAction: function()
  {
    var self = this;

    if(!this.element.hasClass('scroll-action')){ this.element.addClass('scroll-action'); }

    this.tid = this.element.attr('tid') || false;
    this.scrollType = this.opt.scrollType || this.element.attr('sa-type') || false;
    this.exePrc = this.opt.exePrc || parseInt(this.element.attr('sa-exe-prc') || 15);
    this.noretrig = this.opt.noretrig || parseInt(this.element.attr('sa-noretrig'))

    this.initScroll(true);
  },
  initScrollAction: function()
  {
    this.opt.scrollType = false;

    this.opt.minPrc = false;
    this.opt.exePrc = false;
    this.opt.maxPrc = false;

    this.opt.off = false;
    this.opt.xoff = false;
    this.opt.yoff = false;

    this.opt.locked = false;
    this.opt.initFunc = false;
    this.opt.execFunc = false;

    this.top = 0;
    this.left = 0;
    this.width = 0;
    this.height = 0;

    this.activeScroll = false;
  },
  initScroll: function(force)
  {
    if(this.noretrig && !force) return;

    switch(this.scrollType)
    {
      case 'func':
        this.opt.initFunc();
        break;
      default:
        this.element.removeClass('atscroll');
        break;
    }

    this.activeScroll = false;
    return false;
  },
  lockScroll: function(dir)
  {
    if( this.opt.locked == dir ) return;
    this.opt.locked = dir;

    if(dir){
      this.initFunc();
    }else{
      this.update();
    }
  },
  update: function()
  {
    this.updateScroll(__app__.scrollTop,__app__.scrollTopDir);
  },
  updateScrollPrc: function(scrollTop)
  {
    var actionStart = this.ht - __app__.wh;
    var actionEnd = Math.min(this.hb,__app__.pageHeight - __app__.wh );
    var actionLen = actionEnd - actionStart;

    var prc = 0;
    if(scrollTop < actionStart) prc = 0;
    else if( scrollTop > actionEnd ) prc = 100;
    else prc = ( scrollTop - actionStart ) / actionLen * 100;

    return prc;
  },
  updateScroll: function(scrollTop,scrollDir)
  {
    if(this.locked || window.contentFixed) return;

    var prc = this.updateScrollPrc(scrollTop);
    if(!this.activeScroll && prc >= this.exePrc)
    {
      switch(this.scrollType)
      {
        case 'func':
          this.opt.execFunc();
          break;
        default:
          if(!this.element.hasClass('atscroll'))
            this.element.addClass('atscroll');
          break;
      }

      this.activeScroll = true;
    }else if(scrollTop < 100){
       return this.initScroll();
    }
  },
  resize: function(ww,wh)
  {

  },
  recalc: function()
  {
    var offset = this.element.offset();

    this.top = offset.top;
    this.left = offset.left;

    this.width = this.element.outerWidth(true);
    this.height = this.element.outerHeight(true);

    this.ht = this.top;
    this.hc = Math.round( this.top + this.height / 2 );
    this.hb = this.top + this.height;
  },
  remove: function()
  {
    this.rm();
  }
});