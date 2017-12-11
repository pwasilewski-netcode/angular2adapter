# angular2adapter
Use TypeScript and new Angular annotations in old AngularJS

>TL;DR - If you use new Angular, give you a breake and be a happy coder :)

Use it only and only if you have to mess around with AngularJS >= 1.4
and you are tired of coding useless boilerplates in AngularJS.

Code now using TypeScript and annotations provided in the new Angular.
Support for:
* NgModule
* Component
* Directive
* Service
* Input
* Output

Passing providers and declarations force to import dependencies
and directly allow to do an injection into modules, components,
directives, services.
Partial support for injecting:
* providers (services only)
* declarations (components and directives)

## How to run demo?
1. Install node dependencies: `npm install`
2. Build demo: `npm run-script build`
3. Host demo app on localhost:8000: `npm run-script start`
4. Open in web browser `http://localhost:8000`

## Stay tuned for more
* It's the very begining of angular2adapter and i'll develop this solution to be more compatible with Angular (2, 4, etc).
* I'll write more demos and tutorial how to use it in real AngularJS projects.