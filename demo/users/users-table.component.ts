import { Component, Input, Output } from "angular2adapter";
import { UserModel } from "users";

@Component({
	selector: "users-table",
	template: require("./users-table.tpl.html"),
	controllerAs: "vm"
})
export class UsersTableComponent {
	@Input() public ngModel: Array<UserModel>;
	@Output() public ngShowDetails: (id: number) => void;
	
	constructor(private $scope: angular.IScope) {
	}
}