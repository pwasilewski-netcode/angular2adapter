export interface UserModel {
	id: number;
	firstName: string;
	lastName: string;
	age: number;
}

export interface UserStateParams extends angular.ui.IStateParamsService {
	id: number;
}