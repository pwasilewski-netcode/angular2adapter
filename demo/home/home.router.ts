export class HomeRouter {
	constructor() { }

	public static register($stateProvider: angular.ui.IStateProvider) {
		$stateProvider
			.state({
				name: "home",
				url: "/home",
				template: "<home-index></home-index>"
			});
	}
}