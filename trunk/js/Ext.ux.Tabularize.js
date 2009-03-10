/**
 * Ext.ux.Tabularize
 *
 * Need more implementation
 * Does not work with CellSelectionModel
 * Not tested with EditorGridPanel
 *
 * @author Yuki Naotori (naotori@gmail.com)
 */

Ext.ns('Ext.ux');

Ext.ux.Tabularize = function(cfg){
	cfg = cfg || {};
	Ext.apply(this,cfg);
};

Ext.ux.Tabularize.prototype = {
	RS: '__rowspan__',
	CS: '__colspan__',

	init: function(gp){
		this.grid = gp;
	  var view = gp.getView();
		var that = this;
		var ar = view.afterRender;
		view.afterRender = function(){
			ar.call(this);
			that.spanCols();
			that.spanRows();
		};

		view.getRow = function(row){
			return Ext.select('.x-grid3-row tr', false, this.mainBody.dom).item(row).dom;
		};

		view.findRowIndex = function(el){
			var r = this.findRow(el);
      var tr = this.fly(el).findParent('tr', this.rowSelectorDepth);

			return r ? r.rowIndex + tr.rowIndex : false;
		};

		gp.on({
			columnresize: {
				fn: this.recalculateCellWidth, 
				scope: this
			},
			columnmove: {
				fn: function(){
					this.spanCols();
					this.spanRows();
				},
				scope: this
			},
			sortchange: {
				fn: function(){
					this.spanCols();
					this.spanRows();
				},
				scope: this
			}
		});
	},

	recalculateCellWidth: function(){
		var grid = this.grid;
		var cm = grid.getColumnModel();
		Ext.select('.x-grid3-row', true, grid.getView().mainBody.dom).each(function(r){
			Ext.select('.x-grid3-row-table',true,r.dom).setStyle({tableLayout:'auto'});
		});

		Ext.select('.x-grid3-row tr', true, grid.getView().mainBody.dom).each(function(r){
			var k = 0;
			Ext.select('.x-grid3-cell-inner', true, r.dom).each(function(c,t,i){
				var colspan = c.parent().dom.colSpan;
				var width = 0;
				for(var j=0; j<colspan; j++){
					width += cm.getColumnWidth(i+j+k);	
				}
				k += j-1;
//								c.setWidth(width);
				c.parent().setWidth(width);
			});
		});
	},

	spanCols: function(){
		var grid = this.grid;
		Ext.select('.x-grid3-cell-inner:nodeValue('+this.CS+')', true, grid.getView().mainBody.dom).each(function(c){
			var t = c.parent().prev();
			t.dom.colSpan++;
			c.parent().remove();
		});
		this.recalculateCellWidth();
	},

	spanRows: function(){
		var grid = this.grid;
		Ext.select('.x-grid3-cell-inner:nodeValue('+this.RS+')', true, grid.getView().mainBody.dom).each(function(c){
			var row = c.findParent('tr',10,true);
			var del = row.findParent('div',10,true);
			var dest = del.prev();
			var tbody = dest.child('tbody');
			tbody.appendChild(row);
			del.remove();
		},this);

		Ext.select('.x-grid3-cell-inner:nodeValue('+this.RS+')', true, grid.getView().mainBody.dom).each(function(c){
			var row = c.findParent('tr',10,true);
			var idx = 0;

			var tgt = this.findCellInColumn(c.parent(),row.prev());
			tgt.dom.rowSpan++;
			tgt = tgt.child('div');
			tgt.setHeight(tgt.getHeight()+c.getHeight());
		},this);

		Ext.select('.x-grid3-cell-inner:nodeValue('+this.RS+')', true, grid.getView().mainBody.dom).each(function(c){
			c.parent().remove();
		},this);
	},

	findCellInColumn: function(cell, target_row){
		var current_row = cell.parent();
		var idx = cell.dom.cellIndex;
		var real_idx = idx;
		current_row.select('td',true).each(function(c){
			if(c.dom.cellIndex >= idx) return false;
			real_idx += c.dom.colSpan - 1;
		});

		var span = 0;
		var ret = 0;
		target_row.select('td',true).each(function(c){
			span += c.dom.colSpan -1
			if(span + c.dom.cellIndex >= real_idx){
				ret = c.dom.cellIndex;
				return false;
			}
		});


		if(target_row.child('td:nth('+(ret+1)+')')
							   .child('.x-grid3-cell-inner:nodeValue('+this.RS+')')){
			return this.findCellInColumn(cell, target_row.prev());							
		}else{
			return target_row.child('td:nth('+(ret+1)+')');
		}
	}
};

