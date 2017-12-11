import { Component, Input } from "angular2adapter";

@Component({
	selector: "app",
	template: `
		<div>
			<h1>{{ vm.title }}</h1>
			<nav>
				<ul>
					<li><a ui-sref="home">Home</a></li>
					<li><a ui-sref="users">Users</a></li>
				</ul>
			</nav>
			<div ui-view></div>
		</div>
	`,
	controllerAs: "vm"
})
export class AppComponent {
	@Input() public title: string;
}