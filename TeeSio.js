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
            this.setReady()
        }
        else{
            console.log('sio object not found..')
        }
    }

    onNewSocket(socket){
        console.log('got new socket connection...',socket)
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