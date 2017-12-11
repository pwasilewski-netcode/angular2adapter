import { Component } from "angular2adapter";
import { UserModel, UsersService } from "users";

@Component({
	selector: "users-index",
	template: `
		<users-table ng-model="vm.users" ng-show-details="vm.onShowDetails"></users-table>
		<p>Loaded {{ vm.users.length }} users</p>
		<p ng-show="vm.users.length == 0">No users loaded</p>
		<p ng-show="vm.users.length > 0 && vm.detailedUser == null">Select user for more details</p>
		<user-details ng-show="vm.detailedUser != null" ng-model="vm.detailedUser"></user-details>
	`,
	controllerAs: "vm",
	providers: [UsersService]
})
export class UsersIndexComponent {
	private users = new Array<UserModel>();
	private detailedUser: UserModel;

	constructor(private $scope: angular.IScope,
				private usersService: UsersService) {
		this.load();
	}

	private load() {
		this.usersService.getAll().then(items => {
			this.$scope.$evalAsync(() => {
				this.users.splice(0, this.users.length, ...items);
			});
		});
	}

	private onShowDetails = (id: number): void => {
		this.$scope.$evalAsync(() => {
			this.detailedUser = this.users[id];
		});
	};
}