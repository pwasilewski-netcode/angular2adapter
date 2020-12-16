/* *****************************************************************************
MIT License

Copyright (c) 2015 Paweł Wasilewski <https://github.com/pwasilewski-netcode>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
***************************************************************************** */

/*
	Angular2Adapter
	Author: Paweł Wasilewski <https://github.com/pwasilewski-netcode>

	TL;DR - If you use new Angular, give you a breake and be a happy coder :)

	Use it only and only if you have to mess around with AngularJS >= 1.4
	and you are tired of coding useless boilerplates in AngularJS.

	Code now using TypeScript and annotations provided in the new Angular.
	Support for:
	- NgModule
	- Component
	- Directive
	- Service
	- Input
	- Output

	Passing providers and declarations force to import dependencies
	and directly allow to do an injection into modules, components,
	directives, services.
	Partial support for injecting:
	- providers (services only)
	- declarations (components and directives)
*/



import * as angular from "angular";
import functionArguments = require("function-arguments");

// Polyfill: Add Function.name for browsers that don't support it (eg. IE)
const _function: any = function f() { };
if (!_function.name) {
	Object.defineProperty(Function.prototype, "name", {
		get: function() {
			const name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
			Object.defineProperty(this, "name", { value: name });
			return name;
		}
	});
}

export let defaultModuleId = "app";

export interface NgModuleMetadata {
	declarations?: any[];
	imports?: any[];
	bootstrap?: any[];
	providers?: any[];
	id?: string;
}

export function NgModule(meta?: NgModuleMetadata) {
	return (target: any) => {
		register(null, target, meta);
	};
}

export interface ComponentMetadata {
	selector: string;
	template?: string;
	templateUrl?: string;
	controllerAs?: string;
	moduleId?: string;
	inputs?: string[];
	outputs?: string[];
	providers?: any[];
}

export function Component(meta: ComponentMetadata) {
	return (target: any) => {
		register(meta.moduleId).component(target, meta);
	};
}

export interface DirectiveMetadata {
	selector: string;
	require?: string;
	moduleId?: string;
	priority?: number;
	terminal?: boolean;
	transclude?: any;
	$$tlb?: boolean;
	providers?: any[];
}

export function Directive(meta: DirectiveMetadata) {
	return (target: any) => {
		register(meta.moduleId).directive(target, meta);
	};
}

export interface InjectableMetadata {
	moduleId?: string;
}

export function Injectable(meta?: InjectableMetadata) {
	return (target: any) => {
		register(!meta ? null : meta.moduleId).service(target, meta);
	};
}

export function Input() {
	return (target: any, key: string) => {
		register(null).input(target, key);
	};
}

export function Output() {
	return (target: any, key: string) => {
		register(null).output(target, key);
	};
}

enum DependencyKind {
	Component, Directive, Service
}

interface DependencyItem {
	kind: DependencyKind;
	classType: any;
	meta: ComponentMetadata | DirectiveMetadata | InjectableMetadata;
}

interface ModulesDependencies {
	[name: string]: DependencyItem;
}

const modulesDependencies: ModulesDependencies = { };

interface Register {
	component(classType: any, meta: ComponentMetadata): Register;
	directive(classType: any, meta: DirectiveMetadata): Register;
	service(classType: any, meta: InjectableMetadata): Register;
	input(classType: any, name: string): Register;
	output(classType: any, name: string): Register;
}

function register(moduleName?: string,
				  classType: any = null,
				  newModuleMeta: NgModuleMetadata = null): Register {
	var r: Register = {
		component: component,
		directive: directive,
		service: service,
		input: input,
		output: output
	};
	let contextName: string, contextModule: angular.IModule;
	setContext(moduleName, classType, newModuleMeta);
	return r;

	function setContext(moduleName: string, classType: any, meta: NgModuleMetadata): void {
		contextName = !!moduleName ? moduleName : defaultModuleId;
		if (classType == null) {
			contextModule = getModule(contextName);
			return;
		}
		contextModule = createModule(classType, newModuleMeta);
		newInstance(classType);
		contextName = contextModule.name;
		const metaDependencies = new Array(
			...(!!meta.declarations ? meta.declarations : []),
			...(!!meta.providers ? meta.providers : [])
		);
		const dependencies = spliceModulesDependencies(metaDependencies);
		registerModuleDependencies(dependencies);
		bootstrap(meta);
	}

	function component(classType: any, meta: ComponentMetadata): Register {
		if (contextModule == null) {
			modulesDependencies[contextName + classType.name] = {
				kind: DependencyKind.Component,
				classType: classType,
				meta: meta
			};
			return r;
		}
		const factory = (...args: any[]): angular.IDirective => {
			setupInputs(classType, meta.inputs);
			setupOutputs(classType, meta.outputs);
			const directive: angular.IDirective = {
				restrict: getRestrictions(meta.selector),
				controller: classType,
				controllerAs: !!meta.controllerAs
					? meta.controllerAs
					: camelCase(classType.name),
				scope: { },
				bindToController: angular.merge({}, classType.prototype.$inputs, classType.prototype.$outputs),
				template: meta.template,
				templateUrl: meta.templateUrl,
				transclude: true,
				link: fn(classType.prototype.link)
			};
			return directive;
		};
		inject(classType);
		contextModule
			.directive(getSelectorName(meta.selector), factory)
			.controller(classType.name, classType);
		return r;
	}

	function directive(classType: any, meta: DirectiveMetadata): Register {
		if (contextModule == null) {
			modulesDependencies[contextName + classType.name] = {
				kind: DependencyKind.Directive,
				classType: classType,
				meta: meta
			};
			return r;
		}
		const factory = (...args: any[]): angular.IDirective => {
			const directive: angular.IDirective = {
				restrict: getRestrictions(meta.selector),
				controller: classType,
				priority: meta.priority,
				require: meta.require,
				terminal: meta.terminal,
				transclude: meta.transclude,
				link: fn(classType.prototype.link)
			};
			if (!!meta.$$tlb) {
				(<any>directive).$$tlb = true;
			}
			return directive;
		};
		inject(classType);
		contextModule
			.directive(getSelectorName(meta.selector), factory)
			.controller(classType.name, classType);
		return r;
	}

	function service(classType: any, meta: InjectableMetadata): Register {
		if (contextModule == null) {
			modulesDependencies[contextName + classType.name] = {
				kind: DependencyKind.Service,
				classType: classType,
				meta: meta
			};
			return r;
		}
		inject(classType);
		const serviceName = camelCase(classType.name);
		contextModule.service(serviceName, classType);
		return r;
	}

	function input(classType: any, name: string): Register {
		if (classType.$inputs == null)
			classType.$inputs = { };
		classType.$inputs[name] = "=?";
		return r;
	}

	function output(classType: any, name: string): Register {
		if (classType.$outputs == null)
			classType.$outputs = { };
		classType.$outputs[name] = "=?";
		return r;
	}

	function setupInputs(classType: any, metaInputs: string[]): void {
		const inputs = classType.prototype.$inputs || { };
		if (!!metaInputs) {
			metaInputs.forEach(item => {
				inputs[item] = "=?";
			});
		}
		classType.prototype.$inputs = inputs;
	}

	function setupOutputs(classType: any, metaOutputs: string[]): void {
		const outputs = classType.prototype.$outputs || { };
		if (!!metaOutputs) {
			metaOutputs.forEach(item => {
				outputs[item] = "=?";
			});
		}
		classType.prototype.$outputs = outputs;
	}

	function getSelectors(selector: string): string[] {
		return selector.split(",");
	}

	function getSelectorName(selector: string): string {
		let name: string = getSelectors(selector)[0];
		name = name.replace( /-([a-z])/ig, function(all, letter) {
			return letter.toUpperCase();
		});
		return name.replace(/[\[\]\.-]/g, "");
	}

	function getRestrictions(selector: string): string {
		let restrictions = "";
		const selectors = getSelectors(selector);
		selectors.forEach(x => {
			if (x.indexOf("[") > -1)
				restrictions += "A";
			else if (x.indexOf(".") > -1)
				restrictions += "C";
			else
				restrictions += "E";
		});
		return restrictions;
	}

	function camelCase(s: string): string {
		return s.charAt(0).toLowerCase() + s.slice(1);
	}

	function fn(f: Function): any {
		return !!f ? f : () => { };
	}

	function getModule(moduleId: string): angular.IModule {
		try {
			return angular.module(moduleId);
		}
		catch (ex) {
			return null;
		}
	}

	function createModule(classType: any, meta: NgModuleMetadata): angular.IModule {
		const moduleName = (!!meta && !!meta.id) ? meta.id : camelCase(classType.name);
		const imports = (!!meta.imports ? meta.imports : []).map((val: any) => {
			return !!val.name ? val.name : val;
		});
		return angular.module(moduleName, imports);
	}

	function newInstance(classType: any): any {
		const obj: any = {};
		obj.__proto__ = classType.prototype;
		const result = classType.call(obj);
		return (typeof result !== "undefined") ? result : obj;
	};

	function registerModuleDependencies(items: DependencyItem[]): void {
		for (const item of items) {
			switch (item.kind) {
				case DependencyKind.Component:
					component(item.classType, <ComponentMetadata>item.meta);
					break;
				case DependencyKind.Directive:
					directive(item.classType, <DirectiveMetadata>item.meta);
				case DependencyKind.Service:
					service(item.classType, <InjectableMetadata>item.meta);
			}
		}
	}

	function bootstrap(meta: NgModuleMetadata): void {
		if (!meta.bootstrap || meta.bootstrap.length == 0)
			return;
		angular.bootstrap(document, [contextName]);
	}

	function spliceModulesDependencies(itemsToResolve: Array<any>): DependencyItem[] {
		const dependencyItems = new Array<DependencyItem>();
		itemsToResolve.forEach(item => {
			if (!item) return;
			const name = contextName + item.name;
			const dependency = modulesDependencies[name];
			if (!!dependency) {
				dependencyItems.push(dependency);
				const dependencyMeta = <DirectiveMetadata | ComponentMetadata>dependency.meta;
				if (!!dependencyMeta && !!dependencyMeta.providers)
					dependencyItems.push(...spliceModulesDependencies(dependencyMeta.providers));
				delete modulesDependencies[name];
			}
		});
		return dependencyItems;
	}

	function inject(classType: any): void {
		const args = functionArguments(classType.prototype.constructor);
		classType.$inject = args;
	}
}