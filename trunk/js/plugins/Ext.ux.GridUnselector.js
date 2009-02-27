/**
 * A gridpanel plugin to enable "unselecting" selection
 */

Ext.ns('Ext.ux');

Ext.ux.GridUnselector = function(){
  this.init = function(grid){

    grid.on('click',function(e){
      var mb = this.getView().mainBody;

      // Excluding mainBody (grid rows) and header checkbox of CheckboxSelectionModel 
      if(!e.getTarget('div#'+mb.id) && !e.getTarget('.x-grid3-hd-checker')){
        this.getSelectionModel().clearSelections();  

        // To uncheck header checkbox of CehckboxSelectionModel, 
        var cb = Ext.select('div#'+this.getGridEl().dom.id+' div.x-grid3-hd-checker-on');
        if(cb){
          cb.each(function(t){
            t.removeClass('x-grid3-hd-checker-on');  
          });
        }
      }
    },grid);

    var sm = grid.getSelectionModel();
    // Row/CheckboxSelectionModel
    if(typeof sm.getSelections == 'function'){
      grid.on('rowmousedown', function(t,ri,e){
        var rec = this.getStore().getAt(ri);
        var sels = sm.getSelections();

        if(sels.length && sels.length == 1 && sm.isIdSelected(rec.id)){
          sm.deselectRow(ri);
          return false;
        }else if(sels.length && sels.length > 1 && sm.isIdSelected(rec.id)){
          sm.clearSelections();
        }
      },grid);
    // CellSelectionModel
    }else if(typeof sm.getSelectedCell == 'function'){
      grid.on('cellmousedown', function(t,ri,ci,e){
        var rec = this.getStore().getAt(ri);
        var cell = sm.getSelectedCell();

        if(cell && cell.length && cell[0]==ri && cell[1]==ci){
          sm.clearSelections();
          return false;
        }
      },grid);
    }
  };    
};
