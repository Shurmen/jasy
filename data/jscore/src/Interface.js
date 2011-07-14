/* 
==================================================================================================
  Jasy - JavaScript Tooling Refined
  Copyright 2010-2011 Sebastian Werner
==================================================================================================
*/

(function() {
	var genericToString = function() {
		return "[Interface " + this.interfaceName + "]";
	};
	
	var removedUnusedArgs = !(function(arg1){}).length;
	var isInterfaceValue = +new Date;
	
	/**
	 * Define a interface which can be used for validation of objects.
	 * 
	 * @param name {String} Name of Interface
	 * @param config {Map} Data structure containing the keys 'events', 'properties' and 'members'.
	 */
	Core.declare("Interface", function(name, config) {
		
		if (Permutation.isSet("debug")) {
			Assert.assertModuleName(name, "Invalid interface name!");
			Assert.assertMap(config, "Invalid interface configuration in " + name);
		}
		
		Core.declare(name, {
			__properties : config.properties,
			__events : config.events,
			__members : config.members,
			__isInterface : isInterfaceValue,
			
			/** {String} Name of the interface */
			interfaceName : name,
			
			/**
			 * Returns a string representing the Interface.
			 *
			 * @signature function() {}
			 * @return {String} String representing
			 */
			toString : genericToString,

			/**
			 * Returns a string representing the Interface.
			 *
			 * @signature function() {}
			 * @return {String} String representing
			 */
			valueOf : genericToString,
			
			/**
			 * Returns a string representing the Interface.
			 *
			 * @signature function(objOrClass) {}
			 * @param objOrClass {Object|Class} Object or Class to verify
			 * @throws Whenever the object or class does not implements the interface.
			 */
			assert : Interface.assert
		});
	});
	
	
	/**
	 * Resolves a given Interface name
	 *
	 * @param interfaceName {String} Name to resolve
	 * @return {Object} Returns the Interface stored under the given name
	 */	
	Interface.getByName = function(interfaceName) {
		if (Permutation.isSet("debug")) {
			Assert.assertString(interfaceName);
		}
		
		var obj = Core.resolve(interfaceName);
		return isInterface(obj) ? obj : null;
	};


	/**
	 * Verifies whether the given object or class implements the given interface.
	 *
	 * @param objOrClass {Object|Class} Object or Class to verify
	 * @param iface {Interface?this} Interface to check for. Falls back to the context being called in.
	 * @throws Whenever the object or class does not implements the interface.
	 */
	var implementsInterface = Interface.assert = function(objOrClass, iface) {
		if (!objOrClass) {
			throw new Error("Invalid class or object to verify interface with: " + objOrClass);
		}
		
		var cls = typeof objOrClass == "object" ? objOrClass.constructor : objOrClass;
		if (!Class.isClass(cls)) {
			throw new Error("Invalid class or object to verify interface with: " + objOrClass);
		}
		
		var clsMembers = cls.prototype;
		var iface = iface || this;
		
		if (!Interface.isInterface(iface)) {
			throw new Error("Invalid interface " + iface);
		}

		var ifaceMembers = iface.__members;
		var commonErrMsg = "Class " + cls.className + " does not implement interface " + iface.interfaceName + ": ";
		
		for (var key in ifaceMembers) {
			var iMember = ifaceMembers[key];
			
			if (!(key in clsMembers)) {
				throw new Error(commonErrMsg + "Missing member: " + key + "!");
			}
			
			var cMember = clsMembers[key];
			
			if (typeof iMember == typeof cMember) {
				if (iMember instanceof Function) {
					if (!(cMember instanceof Function)) {
						throw new Error(commonErrMsg + "Different member types in: " + key + "! Expecting a function!");
					} else if (!removedUnusedArgs && iMember.length != cMember.length) {
						throw new Error(commonErrMsg + "Different number of arguments in function '" + key + "'. Expecting " + iMember.length + "!");
					}
				} else if (iMember instanceof Array && !(cMember instanceof Array)) {
					throw new Error(commonErrMsg + "Different member types in: " + key + "! Expecting an array.");
				}
			} else {
				throw new Error(commonErrMsg + "Different member types in: " + key + "! Expecting type " + (typeof iMember));
			}
		}
	};

	// Add assertion for checking for interface implementation
	Assert.add(implementsInterface, "implementsInterface", "Does not implement %1!");

	/**
	 * Whether the given object is a Interface
	 *
	 * @return {Boolean} Whether the given argument is an valid Interface.
	 */
	var isInterface = Interface.isInterface = function(iface) {
		return !!(iface && typeof iface == "object" && iface.__isInterface === isInterfaceValue);
	};
	
	// Add assertion for interface type
	Assert.add(isInterface, "isInterface", "Invalid interface!");
	
})();