/**
 * A panel plugin to fix IE bug for resetting radio/checkbox values on DOM manipulation
 */

Ext.ns('Ext.ux');

Ext.ux.IEInputResetFix = function(){
  this.init = function(panel){

    // Problem only occurs with IE6/7 when animCollapse=true  
    if(Ext.isIE && panel.animCollapse){

     var ieDomResetFix = function(ev,p){
        var el = p.body;

        // Match all INPUT tags with type=radio and type=checkbox under panel's body
        var inputs = el.select('input[type=radio], input[type=checkbox]');

        // save status
        if(ev=='beforecollapse'){
          var stat = {};
          inputs.each(function(i){
            stat[Ext.id(i)] = i.dom.checked;
          });
          p.stat = stat;

        // restore saved status
        }else if(ev=='collapse' || ev=='expand'){
          if(!p.stat) return;
          inputs.each(function(i){
            i.dom.checked = p.stat[Ext.id(i)] !== undefined ? p.stat[Ext.id(i)] : i.dom.checked;
          });
        }
     };

      // Save status on 'beforecollapse', and restore it on 'collapse' and 'expand'  
      panel.on({
        'beforecollapse': ieDomResetFix.createDelegate(panel,['beforecollapse',panel]),  
        'collapse': ieDomResetFix.createDelegate(panel,['collapse',panel]),  
        'expand': ieDomResetFix.createDelegate(panel,['expand',panel])
      });
   }
  }
};

// For Ext 3.0 and above
if(Ext.preg){
  Ext.preg('ieinputresetfix',Ext.ux.IEInputResetFix);
}
