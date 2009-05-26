/**
 * A gridpanel plugin to customize ddText
 */

Ext.ns('Ext.ux');

Ext.ux.GridDDText = function(){
  this.init = function(grid){
    this.grid = grid;
    grid.on('render',this.modifyDragDropText, this);
  },

  this.modifyDragDropText = function(){
    var grid = this.grid;
    var v = grid.getView();
    if(!v.dragZone) return;

    grid.getDragDropText = function(){
      var sel = v.dragZone.dragData.selections;
      var rows = [];
      for(var i=0; i<sel.length; i++){
        var data = [];
        for(var key in sel[i].data){
          data.push(sel[i].data[key]);
        }
        if(i>=2){
          rows.push('...(その他'+(sel.length-2)+'行)');
          break;
        }else{
          rows.push(data.join(','));
        }
      }
      return rows.join('<br />');
    };
  }
};
