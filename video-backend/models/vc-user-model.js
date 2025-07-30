class User{
    #secureKey;
    #identifierKey;
    #username;
    constructor(username, password){
        this.#identifierKey = crypto.createHmac('SHA256',`${username}-${password}`).digest('base64');
        this.#secureKey = this.#identifierKey.slice(0,5)+'-vc-backend-user';
        this.#username = username;
    }

    getUser(){
        return {
            id : this.#identifierKey,
            key :this.#secureKey,
            username:this.#username
        }
    }
    
}



module.exports = User