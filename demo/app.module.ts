import * as angular from "angular";
import { NgModule } from "angular2adapter";
import { AppComponent } from "app.component";
import { HomeRouter, HomeIndexComponent } from "home";
import { UsersRouter, UsersIndexComponent,
		 UsersTableComponent, UserDetailsComponent } from "users";

@NgModule({
	imports: ["ui.router"],
	declarations: [AppComponent, HomeIndexComponent,
				   UsersIndexComponent, UsersTableComponent,
				   UserDetailsComponent],
	bootstrap: [AppComponent]
})
export class App {
	constructor() {
		this.config();
		this.routing();
	}

	private config(): void {
		angular.module("app").config(($httpProvider: angular.IHttpProvider) => {
			delete $httpProvider.defaults.headers.common["X-Requested-With"];
		});
	}

	private routing(): void {
		angular.module("app").config(($stateProvider: angular.ui.IStateProvider,
									  $urlRouterProvider: angular.ui.IUrlRouterProvider,
									  $urlMatcherFactoryProvider: angular.ui.IUrlMatcherFactory) => {
			$urlMatcherFactoryProvider.strictMode(false);
			$urlRouterProvider.otherwise("/home");
			HomeRouter.register($stateProvider);
			UsersRouter.register($stateProvider);
		});
	}
}