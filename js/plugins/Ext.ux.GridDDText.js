/**
 * A gridpanel plugin to customize ddText
 */

Ext.ns('Ext.ux');

Ext.ux.GridDDText = function(fn,scope){
  if(fn && typeof fn == 'function'){
    this.ddfn = fn;
  }
  
  if(scope && typeof scope == 'string'){
    this.scope = scope;
  }
};

Ext.ux.GridDDText.prototype = {
  init : function(grid){
    if(!this.ddfn) return;

    this.grid = grid;
    grid.on('render',this.modifyDragDropText, this);
  },

  modifyDragDropText : function(){
    var grid = this.grid;
    var v = grid.getView();
    if(!v.dragZone) return;

    var fn = this.ddfn;
    var scope = this.scope || this;

    grid.getDragDropText = function(){
      var sel = v.dragZone.dragData.selections;
      return fn.call(scope, grid, sel);   
    }
  }
};
