class User{
    #secureKey;
    #identifierKey;
    #username;
    #createUser;
    constructor(username, password,mode){
        if(typeof mode !== 'number')throw new Error('Invalid type , param user mode');
        this.#identifierKey = crypto.createHmac('SHA256',`${username}-${password}`).digest('base64');
        this.#secureKey = this.#identifierKey.slice(0,5)+'-vc-backend-user';
        this.#username = username;
        this.#createUser = userModeLookup.mode
    }

    getUser(){
        return {
            id : this.#identifierKey,
            secret_key :this.#secureKey,
            username:this.#username
        }
    }
    
}

const userMode = {
    "CREATE" : 0,
    "LOOKUP" : 1,
}

const userModeLookup = {
      0:"CREATE",
      1: "LOOKUP", 
}

module.exports = User