import { UserStateParams } from "users";

export class UsersRouter {
	constructor() { }

	public static register($stateProvider: angular.ui.IStateProvider) {
		$stateProvider
			.state("users", {
				url: "/users",
				template: "<users-index></users-index>"
			});
	}
}