import { Component, Input } from "angular2adapter";
import { UserModel } from "users";

@Component({
	selector: "user-details",
	template: require("./user-details.tpl.html"),
	controllerAs: "vm"
})
export class UserDetailsComponent {
	@Input() public ngModel: UserModel;

	constructor() {
	}
}