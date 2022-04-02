const { Ear } = require("@tek-tech/ears");

const path = require('path')
class TeeSio extends Ear{



    getSocketClassPath(){
        return path.join(__dirname,"TeeSioSocket.js")
    }


    isListening(){
        return this.isListening
    }

    isReady(){
        return this.ready
    }

    gotSio(){
        return this.gotConfig('sio')
    }

    gotConfig(configname){
        return this.config.hasOwnProperty(configname)
    }

    getConfig(configname){
        return (this.gotConfig(configname)) ? this.config[configname] : null
    }

    gotIo(){
        return this.io
    }

    setIo(){
        this.io = this.getConfig('sio')()
    }

    init(){
        if(this.gotSio()){
            this.setIo()
            const listeners = this.getConfig('listeners')?this.getConfig('listeners'):[]
            this.registerSocketListeners(listeners)
            this.setReady()
        }
        else{
            console.log('sio object not found..')
        }
    }

    onNewSocket(socket){
        const sock = new (require(this.getSocketClassPath()).TeeSioServSocket)(socket)
        this.appendSocket(sock)
        
        this.socketlisteners.forEach(
            listener=>{
                socket.off(
                    listener[0],(data)=>{
                        listener[1](data,sock)
                    }
                )
                sock.get(
                    listener[0],(data)=>{
                        listener[1](data,sock)
                    }
                )
            }
        )

    }
    
    registerSocketListeners(listeners=[]){
        this.socketlisteners = listeners
    }

    registerSocketListener(listener){
        this.socketlisteners.push(listener)
    }

    appendSocket(sock){
        if(sock.getUuid()){
            if(this.getSockByUuid())this.replaceSock(uuid,sock)
            else    this.clisockets.push(sock)
        }
    }
    replaceSock(uuid,sock){
        this.clisockets.forEach(
            (socket,idx)=>{
                if(socket.getUuid()==uuid){
                    sokcet = sock
                    this.clisockets[idx]=sock
                }
            }
        )
    }
    getSockByUuid(uuid){
        let found = null
        this.clisockets.forEach(
            sock=>{
                if(sock.getUuid()==uuid)found = sock
            }
        )
        return found
    }

    listen(){
        if(this.gotSio()){
            if(!this.gotIo()) this.setIo()
            this.io.listen(this.gotConfig('usesTeeWeb')?this.getConfig('server').getInstance():this.getConfig('server'))
            this.io.on(
                'connection',socket=>{
                    this.onNewSocket(socket)
                }
            )
            this.isListening = true
        }
    }

    assignData(data){
        Object.keys(data).forEach(
            configname=>{
                this.config[configname] = data[configname]
            }
        )
    }




    constructor(data){
        super()
        this.socketlisteners = []
        this.clisockets = []
        this.isListening = false
        this.io = null
        this.config = {}
        this.assignData(data)
        this.init()
        this.whenReady(
            ()=>{
                console.log("Teesio is ready")
            }
        )
    }


}






module.exports = {TeeSio}