class RequestParser{
    static cookieParsertoObj(cookieStr){
    const cookieArray= cookieStr.split(';').map((val)=>val.trim());
    const cookieObj = {};
    for(let a  of cookieArray){
        let [name , value] = a.split("=");
        cookieObj[name] = value;
    }
    return cookieObj;
    }


    static cookieParsertoStr(cookieObj){
    let cookieStr = Object.keys(cookieObj).reduce((prev,val)=>{return prev+= val+'='+cookieObj[val]+'; '},'')
    return cookieStr;
    }
}



module.exports = RequestParser