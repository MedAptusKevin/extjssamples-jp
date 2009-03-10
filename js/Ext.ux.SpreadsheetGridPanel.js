/**
 * Ext.ux.SpreadsheetGridPanel
 *
 * @author   Yuki Naotori
 */

Ext.grid.GridEditor.prototype.autoSize = true;

Ext.ns('Ext.ux');

Ext.ux.SpreadsheetGridPanel = Ext.extend(Ext.grid.EditorGridPanel,{
	colsNum: 26, // max
	rowsNum: 26, // max
	colWidth: 50, 

	initComponent: function(){
		this.colsNum = Math.min(this.colsNum, Ext.ux.SpreadsheetGridPanel.prototype.colsNum);		
		this.rowsNum = Math.min(this.rowsNum, Ext.ux.SpreadsheetGridPanel.prototype.rowsNum);
		this.clicksToEdit = 1;
		this.autoScroll = true;
		
		var	fields = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ').slice(0,this.colsNum);
		var that = this;

		var editorCfg = {
			enableKeyEvents: true,
			listeners: {
				keyup: {
					fn: function(t,e){
						if(e.ctrlKey && e.getKey()==86){
							(function(){
								var v = t.getRawValue();
								t.setRawValue('');
								var rows = v.split("\n");
								
								var cells = [];
								for(var i = 0; i < rows.length; i++){
									cells[i] = rows[i].split("\t"); 
								}
								var g = that;
								var cm = g.getColumnModel();
								var store = that.getStore();
								var selected = g.getSelectionModel().getSelectedCell();
								var row = selected ? selected[0]: 0;
								var col = selected ? selected[1]: 0;

								for(var i=0; i<cells.length; i++){
									var rec = store.getAt(row+i);
									for(var j=0; j<cells[i].length; j++){
										var fieldName = cm.getDataIndex(col+j);
										rec.set(fieldName,cells[i][j]);
									}
								}
								t.hide();
							}).defer(100);
						}
					}
				}
			}
		};

		var columns = [], data = [];
		for(var i=0; i<this.colsNum; i++){
			columns[i] = {dataIndex: fields[i], width: this.colWidth, header: fields[i], editor: new Ext.form.TextArea(editorCfg)};
		}

		for(var j=0; j<this.rowsNum; j++){
			data[j] = [];
			for(var i=0; i<this.colsNum; i++){
				data[j][i] = '';
			}
		}

		this.columns = columns;
		this.store = new Ext.data.SimpleStore({
			data: data,
			fields: fields
		});

		Ext.ux.SpreadsheetGridPanel.superclass.initComponent.call(this);
	}
});

Ext.reg('spreadsheetgrid',Ext.ux.SpreadsheetGridPanel);
