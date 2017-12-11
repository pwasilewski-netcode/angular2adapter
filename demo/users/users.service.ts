import { Injectable } from "angular2adapter";
import { UserModel } from "users"

@Injectable()
export class UsersService {
	constructor(private $q: angular.IQService,
				private $http: angular.IHttpService) { }

	public getAll(): Promise<Array<UserModel>> {
		const deferred = this.$q.defer<Array<UserModel>>();
		this.$http.get<Array<UserModel>>("/users/users.json")
			.then(resp => deferred.resolve(resp.data));
		return deferred.promise;
	}
}