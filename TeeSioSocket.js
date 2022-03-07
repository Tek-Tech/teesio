if(((typeof module) != 'undefined')){
    
    Ear = require("@tek-tech/ears").Ear;
}
class TeeSioSocket extends Ear{

    initSocket(cb){
 
        if(cb)cb()
    }

    post(event,data,cb){
        this.socket.emit(
            event,data
        )
        if(cb)this.get(
            `${event}Res`,cb
        )
    }

    get(event,handler){
        this.socket.on(
            event,handler
        )
    }


    _attribute(attribute){
        return this.identity.hasOwnProperty(attribute) ? this.identity[attribute] ? this.identity[attribute] : null : null
    }
    
    setUuid(uuid){
        this.identity.uuid = uuid
        this.uuidentified = true
        this.trigger('uuidentified')
    }
    setTeeId(teeId){
        this.identity.teeId = teeId
        this.teeidentified = true
        this.trigger('teeidentified')
    }
    getUuid(){
        return this._attribute('uuid')
    }
    getTeeId(){
        return this._attribute('teeId')
    }

    isUuidentified(){
        return this.uuidentified
    }

    isTeeIdentified(){
        return this.teeIdentified
    }

    init(){
        this.initSocket()
    }


    whenUuidentified(cb){
        if(this.isUuidentified()){
            cb()
        }else{
            this.when(
                'uuidentified',cb
            )
        }

        
    }

    whenTeeIdentified(cb){
        if(this.isTeeIdentified()){
            cb()
        }else{
            this.when(
                'teeidentified',cb
            )
        }

        
    }

    constructor(socket){
        super()
        this.identity = {uuid:null,teeId:null}
        this.uuidentified = false
        this.teeidentified = false
        this.socket = socket
    }
}

class TeeSioCliSocket extends TeeSioSocket{



    setUuid(uuid){
        super.setUuid(uuid)
        this.trigger('uuidentified')
        if((typeof Cman)!='undefined') Cman.setCookie('diuu',this.getUuid())
    }

    setTeeId(teeId){
        super.setTeeId(teeId)
        this.trigger('teeidentified')
        if((typeof Cman)!='undefined') Cman.setCookie('teeId',this.getTeeId())
    }

    getUuid(){
        return this._attribute("uuid")
    }
    getTeeId(){
        return this._attribute("teeId")
    }

    initSocket(cb){
 
        this.socket.on(
            'askingUuidentify',()=>{
                this.showUuidentity()
        
            }
        )
        this.socket.on(
            'givinuuidentity',uuid=>{
                this.setUuid(uuid)
            }
        )

        this.socket.on(
            'askingIdentify',()=>{

                this.showUuidentity()
        
            }
        )
        this.socket.on(
            'givinidentity',teeId=>{
                this.setTeeId(teeId)
            }
        )

    }

    showUuidentity(){
        this.getUuidentity(
            ()=>{
                if(this.getUuid()){
                    this.uuidentified = true
                    this.trigger('uuidentified')
                    this.socket.emit("uuidentity",this.getUuid())
                }
                else this.noUuidentidyProc()
            }
        )


    }

    showIdentity(){
        this.getIdentity(
            ()=>{
                if(this.getUuid()){
                    this.teeIdentified = true
                    this.trigger('teeidentified')
                    this.socket.emit("identity",this.getTeeId())
                }
                else this.noidentidyProc()
            }
        )


    }



    noUuidentidyProc(){
        this.socket.emit(
            'nouuidentity',{}
        )
    }

    noidentidyProc(){
        this.socket.emit(
            'noidentity',{}
        )
    }



    gotUuid(){
        return this.uuidentified
    }

    getUuidentity(cb){

        if((typeof window)!='undefined' && window.gotCman){
            const uuid = Cman.cooks().hasOwnProperty('diuu') ? Cman.cooks()['diuu'] : null
            if(uuid)this.setUuid(uuid)
            if(cb)cb(uuid)
        }

    }

    getIdentity(cb){

        if((typeof window)!='undefined' && window.gotCman){
            const teeId = Cman.cooks().hasOwnProperty('teeId') ? Cman.cooks()['teeId'] : null
            if(teeId)this.setTeeId(teeId)
            if(cb)cb(teeId)
        }

    }

    gotTeeId(){
        return this.teeidentified
    }

    connect(cb){
        let query = {}
        if(window.hasOwnProperty('gotCman')&&Cman.cooks().hasOwnProperty('diuu')&&Cman.cooks()['diuu']!='null'){
            query.diuu = Cman.cooks()['diuu']
        }
        if(window.hasOwnProperty('gotCman')&&Cman.cooks().hasOwnProperty('teeId')&&Cman.cooks()['teeId']!='null'){
            query.teeId = Cman.cooks()['teeId']
        }
        this.socket = io.connect('/',query)
        if(cb)cb()
    }

    constructor(socket){
        super(socket)
        this.teeId = null
        this.getUuidentity()
        this.getIdentity()
        this.connect(()=>{
            this.init()
        })
    }

}

class TeeSioServSocket extends TeeSioSocket{


    processCliData(){
        if(this.identity && this.identity.hasOwnProperty('uuid') && !['null','undefined'].join('-').match(this.identity.uuid)){ 


        }else{
            this.generateUuid()
            this.socket.emit(
                'givinuuidentity'
                ,this.getUuid()?this.getUuid():this.generateUuid()
            )
        }
        if(this.identity && this.identity.hasOwnProperty('teeId') && !['null','undefined'].join('-').match(this.identity.teeId)){
            this.socket.emit(
                'givinidentity'
                ,this.getTeeId()
            )
        }
    }

    generateUuid(){
        const { v4  } = require('uuid')
        let uu = v4()
        this.setUuid(uu)
        return  uu
    }

    __askIdentify(){
        this.socket.emit(
            'askingIdentify',{}
        )
        this.socket.emit(
            'askingUuidentify',{}
        )
        this.socket.on(
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
        this.socket.on(
            'identity',(
                identity=>{
                    this.setTeeid(identity)
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
        if((typeof handshake) != 'undefined'){
            const {query} = handshake
            const {diuu} = query
            if(diuu)this.setUuid(diuu)
        }
    }

    gotTeeId(){
        return this.teeId
    }

    initSocket(){


        this.__askIdentify()
        
        
    }
    constructor(socket){
        super(socket)
        this.teeId = null
        this.checkSocketGreetings()
        this.init()
    }


}



if((typeof module)!=='undefined'){
    module.exports = {TeeSioServSocket}
}