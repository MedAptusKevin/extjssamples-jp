/**
 * A treepanel plugin to enable "unselecting" tree node  
 */

Ext.ns('Ext.ux');

Ext.ux.TreeUnselector = function(){
  this.init = function(tree){

    tree.on('render',function(tree){
      var el = tree.getTreeEl();
      el.on('click',function(e,t){ 
        if(this.id == t.id){ 
          tree.getSelectionModel().clearSelections(); 
        } 
      },el); 
    }); 

    tree.on('beforeclick',function(node,event){ 
      if(node.isSelected()){ 
        node.unselect(); 
        return false; 
      }
    });
  };    
};
