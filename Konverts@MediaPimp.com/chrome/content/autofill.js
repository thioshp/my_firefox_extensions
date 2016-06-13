if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.FieldRule = function(name, rule, value) {
	this.name = name;
	this.ruleRegExp = new RegExp(rule, 'i');
	this.value = value;
	return;
}

com.VidBar.FieldRule.prototype = {
	name : null,
	ruleRegExp: null,
	value: null,
	isRuleMatching: function(str) {
		// Test if the fieldRule matches the given string:
		return this.ruleRegExp.test(str);
	},
	getValue: function(){
		return this.value;
	}
}

com.VidBar.AutoFill = function() {
	this.profile = new com.VidBar.Profile();
	this.initProfile();
}

com.VidBar.AutoFill.prototype = {
	regExpFormFieldTypes : '^(?:(?:text(?:area)?))$',
	regExpFormFieldTypeTester : null,
	fieldRuleDefs : {
		"firstname" : "(?:first\w*name)|(?:name\w*first)",
		"middlename" : "(?:middle\w*name)|(?:name\w*middle)",
		"lastname" : "(?:last\w*name)|(?:name\w*last)",
		"email" : "mail",
		"company" : "company",
		"address1" : "(?:(?:street)|(?:addr))\w*1",
		"address2" : "(?:(?:street)|(?:addr))\w*2",
		"city" : "(?:city)|(?:town)",
		"state" : "(?:state)|(?:prov)|(?:region)",
		"zip" : "(?:zip)|(?:post\w*code)",
		"country" : "country",
		"phone" : "phone",
		"fax" : "fax"
	},
	profile : null,
	fieldRules : [],

	initProfile : function(){
		this.profile.load();
		this.fieldRules = [];
		for(var i in this.fieldRuleDefs){
			var rule = this.fieldRuleDefs[i];
			var value = this.profile.fieldValues[i];
			com.VidBar.__d("rule: "+rule);
			com.VidBar.__d("value: "+value);
			this.fieldRules.push(new com.VidBar.FieldRule(i, rule, value))
		}
	},
	editProfile : function() {
		var options = "chrome,centerscreen,modal";
		window.openDialog("chrome://vidbar/content/editProfile.xul",
				"BasicToolBar-EditProfile-Dialog", options, {});
		//alert("reload");
		this.initProfile();
	},
	autoFill: function() {
		var doc;
		if(content)
			doc = content.document;
		else
			doc = gBrowser.contentDocument;
		
		// Check if any web forms are available on the current window:
		if(doc && doc.forms && doc.forms.length > 0) {

		 	// Go through the forms:
		 	for(var i = 0; i < doc.forms.length; i++) {
		 		// The form elements list:
				var elements = doc.forms[i].elements;
				
				// Go through the form elements:
				for(var j = 0; j < elements.length; j++) {				    
					// Fill out valid form field types:
					com.VidBar.__d("name: "+elements[j].name+" type: "+elements[j].type);
					if(this.isValidFormField(elements[j])) {
						this.setFormField(elements[j]);
					}
				}
		 	}
		}
	},
	isValidFormField: function(element) {
		if(element.disabled) {
			return false;
		}
		if(!this.regExpFormFieldTypeTester) {
			this.regExpFormFieldTypeTester = new RegExp(
				this.regExpFormFieldTypes
			);
		}
		return this.regExpFormFieldTypeTester.test(element.type);
	},
	setFormField: function(element) {
		var labelValue = this.getLabelForElement(element);
		com.VidBar.__d("label: "+labelValue);

		// Go through the list of fieldRules:
		for(var i=0; i < this.fieldRules.length; i++) {
			
			var rule = this.fieldRules[i];
			com.VidBar.__d("rule: "+rule.name);
			
			if((element.name && rule.isRuleMatching(element.name)) ||
				(labelValue && rule.isRuleMatching(labelValue)) ||
				(element.id && rule.isRuleMatching(element.id))){

				com.VidBar.__d("matched");
				// Set the element:
				if(!element.value) {
					element.value = rule.getValue();
					break;
				}
			}
		}
	},
	getLabelForElement: function(element) {
		if(element.form && element.id) {
			// Method to retrieve the textual content of the label assigned to the form element:
			var labels = element.form.getElementsByTagName('label');
			for(var i=0; i<labels.length; i++) {
				if(labels[i].htmlFor && labels[i].htmlFor == element.id) {
					// label elements may contain other inline elements,
					// so we just use the innerHTML content and strip it of all HTML tags
					// whitespace is removed from the beginning and end of the string for convenience:
					return this.trim(this.stripTags(labels[i].innerHTML));
				}
			}
		}
		return this.getLabelCloseToElement(element);
	},
	getLabelCloseToElement: function(element) {
		var label = null;
		var node = element;
		var nextNode;
		// For other elements the label is usually placed as previousSibling:
		nextNode = 'previousSibling';
		// Check if a sibling contains the element label:
		while(node[nextNode]) {
			node = node[nextNode];
			label = this.getNodeTextContent(node, true);
			if(label) {
				return label;
			}
		}
		// Parse the siblings of the parentNode:
		node = element.parentNode;
		if(node) {
			while(node[nextNode]) {
				node = node[nextNode];
				label = this.getNodeTextContent(node, true);
				if(label) {
					return label;
				}
			}
			// If the parentNode of the parentNode is a table cell,
			// also parse the siblings of this node:
			node = element.parentNode.parentNode;
			if(node && node.nodeName == 'TD') {
				while(node[nextNode]) {
					node = node[nextNode];
					label = this.getNodeTextContent(node, true);
					if(label) {
						return label;
					}
				}
			}
		}
		return null;
	},
	getNodeTextContent: function(node, trim) {
		// Get the text content from the current node or its child nodes:
		var text;		
		if(node.nodeType == 3) {
			// nodeType 3 is a text node:
			text = node.nodeValue;
		} else {
			// Do not follow selection nodes, script nodes or noscript nodes:
			if(node.nodeName == 'SELECT' || node.nodeName == 'SCRIPT' || node.nodeName == 'NOSCRIPT') {
				return '';
			}
			text = '';
			for(var i=0; i<node.childNodes.length; i++) {
				text += this.getNodeTextContent(node.childNodes[i]);
			}
		}
		if(trim) {
			return this.trim(text);
		} else {
			return text;
		}
	},
	stripTags: function(str) {
		if (!arguments.callee.regExp) {
			arguments.callee.regExp = new RegExp('<\\/?[^>]+?>', 'g');
		}
		// Return string stripped from HTML tags:
		return str.replace(arguments.callee.regExp, '');
	},
	
	trim: function(str) {
		if (!arguments.callee.regExp) {
			arguments.callee.regExp = new RegExp('(?:^\\s+)|(?:\\s+$)', 'g');
		}
		// Return string with whitespace removed at beginning and end of the string:
		return str.replace(arguments.callee.regExp, '');
	}
};

