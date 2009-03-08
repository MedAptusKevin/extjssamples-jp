/*
 * Ext.ux.JsonpTreeLoader
 *
 * Project Home: 
 * API Documentation: 
 *
 * copyright   Copyright 2009 Yuki Naotori
 * license     GNU General Public License version 3
 *
 * The content of this file is an implementation of Ext JS version 2.
 * Thus this is subject to the Open Source License of Ext JS
 * http://extjs.com/license, and is licensed under GNU General Public
 * License version 3 http://www.gnu.org/copyleft/gpl.html
 */

Ext.ns('Ext.ux');

/**
 * @class Ext.ux.JsonpTreeLoader
 * @extends Ext.tree.TreeLoader
 * <p>A TreeLoader that can convert JSON data extracted via JSONP interface into a hierarchy of 
 * {@link Ext.tree.TreeNode}s. Array/object members of data will become child nodes and other primitive
 * value members will become attributes. This class also assumes that arrays will only contain objects
 * as its direct members (no array or primitive values are allowed). Also, the property name of each node
 * will be added to the tree node as an attribute called <tt>propName</tt>.</p>
 * <p>You can control which properties to include as nodes via config option <tt>nodeProperty</tt>. Also,
 * you can control the mappings from JSON to node attributes by providing <tt>mappingFn</tt> for each property
 * as config options.
 * @param {Object} config A config object containing config properties.
 * @author Yuki Naotori
 * @version 0.1
 */
Ext.ux.JsonpTreeLoader = Ext.extend(Ext.tree.TreeLoader, function(){
   // private vars and methods (allow no overrides)
   // end private vars and methods

  return {
    /**
     * @cfg {Number} timeout (optional) The number of milliseconds to wait for a response. Defaults to 30 seconds.
     */
    timeout : 30000,

    /**
     * @cfg {String} totalProperty Name of the property from which to retrieve the total number of records
     * in the dataset. This is only needed if the whole dataset is not passed in one go, but is being
     * paged from the remote server.
     * @cfg {String} root name of the property which contains the Array of row objects.
     * @cfg {String} callbackParam The name of the parameter to pass to the server which tells
     * the server the name of the callback function set up by the load call to process the returned data object.
     * <p>The server-side processing must read this parameter value, and generate
     * javascript output which calls this named function passing the data object as its only parameter.</p>>
     */
    callbackParam : "callback",

    /**
     * @cfg Array nodeProperty
     * A list of property names to include as tree nodes. If not provided, all array/object members
     * of received data will become nodes
     */
   
    /**
     * @cfg Object mappingFn
     * <p>A collection of functions which map each properties of JSON data into node attributes.</p>
     * <p>Two arguments (attr and node) will be passed to mapping function where "attr" is the reference
     * to the attribute object which will be passed to <tt>createNode</tt> and copied to the attributes
     * property of node, and "node" is an object literal which contains source data to be mapped to 
     * "attr" ("attr" has <tt>propName</tt> and all the primitive values of "node". If not specified
     * in mapping function, the value for attr.text will become that of <tt>propName</tt>).</p>
     * <p>If you want to map {"foo":{"bar":"title", "buz": "something", "qux":"something else" }}, your
     * mapping function will look like:</p>
     * <pre><code>mappingFn: {
     *   foo: function(attr,node){
     *     attr.text = node.bar + node.buz;
     *     attr.something = node.qux;
     *     attr.leaf = false;  
     *     attr.loaded = false;
     *   }
     * }
     * </code></pre>
     */

		// override (called from load methods)
    requestData : function(node, callback){
      if(this.fireEvent("beforeload", this, node, callback) !== false){
  			this.scriptRequest(node,callback);
      }else{
        if(typeof callback == "function"){
          callback();
        }
      }
    },

    // private
    // retrieves data from cross-domain servers by dynamically creating a script tag
    // referred to the "Cross-domain Ext.Ajax/Ext.data.Connection" by Animal
    // url: http://extjs.com/forum/showthread.php?t=1769
    scriptRequest : function(node, cb) {
      var transId = ++Ext.data.ScriptTagProxy.TRANS_ID;
      var trans = {
        id : transId,
        cb : "stcCallback"+transId,
        scriptId : "stcScript"+transId,
				argument: {node: node, callback: cb}
      };

			var url = this.dataUrl || this.url;
      url += (url.indexOf("?") != -1 ? "&" : "?") + this.getParams(node) + String.format("&{0}={1}", this.callbackParam, trans.cb);

      var conn = this;
      window[trans.cb] = function(o){
        conn.handleResponse({responseObject: o },trans);
      };

      trans.timeoutId = this.handleScriptFailure.defer(this.timeout, this, [trans]);

      var script = document.createElement("script");
      script.setAttribute("src", url);
      script.setAttribute("type", "text/javascript");
      script.setAttribute("id", trans.scriptId);
      document.getElementsByTagName("head")[0].appendChild(script);

      return trans;
    },

    // private
    // called inside requestData as a callback with response data from remote server
    handleResponse : function(response,trans){
      var a = trans.argument;
      this.processResponse(response, a.node, a.callback, trans);
      this.fireEvent("load", this, a.node, response);
    },

    // private
    // tries to create tree nodes from retrieved data
    // referred to the "Cross-domain Ext.Ajax/Ext.data.Connection" by Animal and Ext.data.JsonReader
    // url: http://extjs.com/forum/showthread.php?t=1769
    processResponse : function(response, node, callback, trans){
  		var o = response.responseObject;

      this.transId = false;
      this.destroyScriptTrans(trans, true);

      if(this.totalProperty) {
        this.getTotal = this.getJsonAccessor(this.totalProperty);
      }

	    this.getRoot = this.root ? this.getJsonAccessor(this.root) : function(p){return p;};
    	var root = this.getRoot(o), c = root.length, totalRecords = c;

    	if(this.totalProperty){
        var v = parseInt(this.getTotal(o), 10);
        if(!isNaN(v)){
          totalRecords = v;
        }
      }

			node.attributes.totalRecords = totalRecords;

      try {
				var rootName = this.root.split('.').pop();

        node.beginUpdate();
        node.appendChild(this.parseJson(root,rootName));
        node.endUpdate();

        if(typeof callback == "function"){
          callback(this, node);
        }
      }catch(e){
        this.handleFailure(trans);
      }
    },

    /**
     * Checks if the property is in <tt>nodeProperty</tt> list
     * @method isNodeProperty
     * @param {string} property Property to check
     * @return {boolean} true if property is in nodeProperty list (always true if nodePropery is undefined)
     */
    isNodeProperty: function(property){
      return this.nodeProperty 
         ? this.nodeProperty.indexOf(property) !== -1 
         : true; 
    },

    // private
    // parses and creates tree node from retrieved JSON data
		parseJson : function(o, name){
			if(typeof o !== 'object') return;
      else if(name && !this.isNodeProperty(name)) return;
      else if(o instanceof Array) return this.parseArray(o, name);
    
			var nodes = [];
			for(var i in o){
				if(o.hasOwnProperty(i) && this.isNodeProperty(i)){
					if(typeof o[i] == 'object'){
						var treeNode = this.createNode(o[i],i);
						var child = null;
						child = this.parseJson(o[i],i);

						if(child && child.length >= 1){
							treeNode.appendChild(child);
						}

						nodes.push(treeNode);
					}
				}
			}
			return nodes;
		},

    // private
    // parses array and creates tree nodes
		// Assumption: Direct member of array must not be an array
		// Assumption: Array members must be objects, not primitives
    parseArray : function(o, name){
			if(!(o instanceof Array)) return;
			else if(name && !this.isNodeProperty(name)) return;

      var nodes = [];

      Ext.each(o, function(n){
				if(typeof n == 'object'){
				  var treeNode = this.createNode(n,name);
					var child = this.parseJson(n,name);
					if(child && child.length >= 1){
						treeNode.appendChild(child);
					}
					nodes.push(treeNode);
				}
			},this);

			return nodes;
		},

    /**
     * Creates tree node from parsed node data. You can provide a custom loader for new node
     * by setting an instance of {@link Ext.tree.TreeLoader} to <tt>nodeLoader</tt> property
     * in <tt>node</tt> argument. 
     * @method createNode
     * @param {object} node object literal containing node data
     * @param {string} name name of the node data (property name in JSON)
     * @return {Ext.tree.TreeNode} node created node
     */
    createNode : function(node,name){
      var attr = {
        propName: name 
      };
		        
			for(var i in node){
				if(node.hasOwnProperty(i) && (typeof node[i] !== 'object' || i == 'nodeLoader')){
				  attr[i] = node[i];	
				}
			}
			        
			this.processAttributes(attr, node);
			        
			var n = Ext.ux.JsonpTreeLoader.superclass.createNode.call(this, attr);

      // set loader after superclass call (because n.loader is set to "this" inside superclass)
			if(attr.nodeLoader){
				n.loader = attr.nodeLoader;
			}

			return n;
		},

    // private
    // used inside createNode method to process the attributes of the node
		processAttributes: function(attr, n){
			attr.text = attr.text || attr.propName;
			if(this.mappingFn && this.mappingFn[attr.propName]){
				this.mappingFn[attr.propName](attr, n);	
			}else{
				attr.loaded = typeof attr.loaded !== 'undefined' ? attr.loaded : true;
			}
		},

    // private
    // copied from Ext.data.JsonReader
    getJsonAccessor: function(){
      var re = /[\[\.]/;
      return function(expr) {
        try {
          return(re.test(expr))
            ? new Function("obj", "return obj." + expr)
            : function(obj){
              return obj[expr];
            };
        } catch(e){}
        return Ext.emptyFn;
      };
    }(),

    // private
    // fires "loadexception" event
    // referred to the "Cross-domain Ext.Ajax/Ext.data.Connection" by Animal
    // url: http://extjs.com/forum/showthread.php?t=1769
    handleScriptFailure: function(trans) {
      this.transId = false;
      this.destroyScriptTrans(trans, false);
      var response = {
        argument:  trans.argument,
        status: 500,
        statusText: 'Server failed to respond',
        responseText: ''
      };

      var node = trans.argument.node;

      this.fireEvent("loadexception", this, node, response);
    },
    
    // private
    // remove scrip tag which was used to retrieve data
    // referred to the "Cross-domain Ext.Ajax/Ext.data.Connection" by Animal
    // url: http://extjs.com/forum/showthread.php?t=1769
    destroyScriptTrans : function(trans, isLoaded){
      document.getElementsByTagName("head")[0].removeChild(document.getElementById(trans.scriptId));
      clearTimeout(trans.timeoutId);
      if(isLoaded){
        window[trans.cb] = undefined;
        try{
          delete window[trans.cb];
        }catch(e){}
      }else{
        // if hasn't been loaded, wait for load to remove it to prevent script error
        window[trans.cb] = function(){
          window[trans.cb] = undefined;
          try{
            delete window[trans.cb];
          }catch(e){}
        };
      }
    }

   }; // end return
  }()
);
