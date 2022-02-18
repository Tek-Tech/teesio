if((typeof window)==undefined){
    const { Ear } = require("@tek-tech/ears");
}
class TeeSioSocket extends Ear{


    init(){

    }

    constructor(socket,isCli=true){

    }
}
if((typeof module)!=='undefined'){
    module.exports = TeeSioSocket
}