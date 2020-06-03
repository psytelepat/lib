'use strict';
var __slice = Array.prototype.slice;

module.exports.querySelectorAll = function(val, el) {
  return el 
    ? __slice.call(el.querySelectorAll(val))
    : __slice.call(document.querySelectorAll(val));
}

module.exports.bindEvent = function(elm, evt, callback) {
  evt = evt.split(' ');
  evt.map(function(evt){
    if(elm.addEventListener){
      elm.addEventListener(evt, callback, false);
    }else{
        elm.attachEvent("on"+evt, callback);
    }    
  });
}

module.exports.unbindEvent = function(elm, evt, callback) {
  evt = evt.split(' ');
  evt.map(function(evt){
    if(elm.removeEventListener){
      elm.removeEventListener(evt, callback, false);
    }else{
        elm.detachEvent("on"+evt, callback);
    }
  });
}

module.exports.create = function(className,appendTo,tagName) {
  if( typeof className === 'undefined' ){ className = false; }
  if( typeof appendTo === 'undefined' ){ appendTo = false; }
  if( typeof tagName === 'undefined' ){ tagName = 'DIV'; }
  var elm = document.createElement(tagName);
  if(className) elm.className = className;
  if(appendTo) appendTo.appendChild(elm);
  return elm;
}

module.exports.transitionEndEventName = function () {
  var i,
    undefined,
    el = document.createElement('div'),
    eventNames = {
      'transition':'transitionend',
      'OTransition':'otransitionend',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd',
      'msTransition' : 'MSTransitionEnd'
    };

  for (i in eventNames) {
    if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
      return eventNames[i];
    }
  }
}

module.exports.animationEndEventName = function () {
  var i,
    undefined,
    el = document.createElement('div'),
    eventNames = {
      'animation':'animationend',
      'OAnimation':'oAnimationEnd',
      'WebkitAnimation':'webkitAnimationEnd',
      'MozAnimation':'mozAnimationRnd',
      'msAnimation':'MSAnimationEnd'
    };

  for (i in eventNames) {
    if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
      return eventNames[i];
    }
  }
}

module.exports.hasClass = function(el, className) {
  return el.className.indexOf(className) === -1 ? false : true;
}

module.exports.addClass = function(el, className) {
  if (!this.hasClass(el, className)) el.className += ' ' + className;
}

module.exports.removeClass = function(el, className, accurate) {
  if( typeof accurate === 'undefined' ) { accurate = true; }
  if(!this.hasClass(el, className)) return;
  if(!accurate){
    el.className = el.className.replace(className, '');  
  }else{
    var newClassNames = [],
        classNames = el.className.split(' ');
    classNames.forEach(function(item,i){
      if( item.length && item != className )
        newClassNames.push( item );
    });
    el.className = newClassNames.join(' ');
  }
}

module.exports.addClasses = function(el, classNames) {
  var self = this;
  classNames.forEach(function(className,i){ self.addClass(el, className); });
}

module.exports.removeClasses = function(el, classNames) {
  var self = this;
  classNames.forEach(function(className,i){ self.removeClass(el, className); });
}

module.exports.cb = function(cb,data) {
    if( typeof cb != 'function' ) return false;
    if( typeof data == 'undefined' ) data = false;
    return cb( data );
}