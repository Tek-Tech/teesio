if((typeof window)=='undefined'){
    var { Ear } = require("@tek-tech/ears");
}
class TeeSioSocket extends Ear{



    post(tgt,data,cb){
        this.socket.emit(
            tgt,data
        )
        if(cb)  this.get(
            `${tgt}Res`,cb
        )
    }

    get(tgt,cb){
        if(cb)this.socket.on(
            `${tgt}`,cb
        )
    }

    initSocket(cb){
 
        if(cb)cb()
    }

    _attribute(attribute){
        return this.identity.hasOwnProperty(attribute) ? this.identity[attribute] : null
    }
    
    setUuid(uuid){
        this.identity.uuid = uuid
        this.uuidentified = true
    }
    getUuid(){
        return this._attribute('uuid')
    }

    isUuidentified(){
        return this.uuidentified
    }

    init(){
        this.initSocket()
    }

    constructor(socket){
        super()
        this.identity = {uuid:null}
        this.uuidentified = false
        this.socket = socket
    }
}

class TeeSioCliSocket extends TeeSioSocket{


    setUuid(uuid){
        super.setUuid(uuid)
        if((typeof Cman)!='undefined') Cman.setCookie('diuu',this.getUuid())
        this.uuidentified = true
    }

    initSocket(cb){
 
        this.get(
            'askingUuidentify',()=>{

                this.showUuidentity()
        
            }
        )
        this.get(
            'givinuuidentity',uuid=>{
                this.setUuid()
            }
        )

    }

    showUuidentity(){
        this.getUuidentity(
            ()=>{
                if(this.getUuid()){
                    this.socket.emit("uuidentity",this.getUuid())
                }
                else this.noUuidentidyProc()
            }
        )


    }

    noUuidentidyProc(){
        this.post(
            'nouuidentity',{}
        )
    }

    getUuidentity(cb){

        if((typeof window)!='undefined' && window.gotCman){
            const uuid = Cman.cooks().hasOwnProperty('diuu') ? Cman.cooks()['diuu'] : null
            this.setUuid(uuid)
            if(cb)cb(uuid)
        }

    }

    connect(cb){
        this.socket = io.connect('/',window.hasOwnProperty('gotCman')&&Cman.cooks().hasOwnProperty('diuu')&&Cman.cooks('diuu')!='null'?{diuu:Cman.cooks('diuu')}:{})
        if(cb)cb()
    }

    constructor(socket){
        super(socket)
        this.getUuidentity()
        this.connect(()=>{
            this.init()
        })
    }

}

class TeeSioServSocket extends TeeSioSocket{


    processCliData(){
        console.log('this.is cli data ', this.identity)
    }

    generateUuid(){
        const { v4  } = require('uuid')
        let uu = v4()
        this.setUuid(uu)
        return  uu
    }

    __askIdentify(){
        this.post(
            'askingIdentity',{}
        )
        this.post(
            'askingUuidentify',{}
        )
        this.get(
            'uuidentity',(
                uuidentity=>{
                    this.setUuid(uuidentity)
                    this.processCliData()
                }
            )
        )
        
        this.socket.on(
            'nouuidentity',()=>{
                this.socket.emit(
                    'givinuuidentity'
                    ,this.getUuid()?this.getUuid():this.generateUuid()
                )
            }
        )
    }

    checkSocketGreetings(){
        const {handshake} = this.socket
        const {query} = handshake
        const {diuu} = query
        if(diuu)this.setUuid(diuu)
    }

    initSocket(){


        this.__askIdentify()
        
        
    }
    constructor(socket){
        super(socket)
        this.checkSocketGreetings()
        this.init()
    }


}



if((typeof module)!=='undefined'){
    module.exports = {TeeSioSocket,TeeSioServSocket,TeeSioCliSocket}
}