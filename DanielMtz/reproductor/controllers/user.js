var EndpointBase = require('./endpoint-base');

class MusicUsers extends EndpointBase{
    constructor(response, request, mongo, result) {
        super(response, request, mongo, result);
    }
    async GET(user) {

        if (user) {
            user = this.toRegex(user);
            var owner = await this.SingleQueryDatabase(
                'MusicPlayer',
                'Users', {
                    owner: {
                        $regex: '^' + user + '$'
                    }
                }
            );
            this.result.data = {
                message: owner != null ? 'Succesful user service query' : 'User not found',
                result: owner
            };
            this.status = owner != null ? 200 : 404;
            this.FinishRequest();
        } else {
            this.result.data = {
                message: 'Insufficient Search criteria',
                error: '"User" parameter is required to perform this query',
                result: 'WARNING'
            }; //Fin del result.data
            this.status = 406;
            this.FinishRequest();
        }
    } //Fin del Get

    

}
module.exports = MusicUsers;