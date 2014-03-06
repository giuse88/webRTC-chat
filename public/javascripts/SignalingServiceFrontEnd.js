/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 06/03/2014
 * Time: 18:43
 * To change this template use File | Settings | File Templates.
 */

/**
 * interface implemented
 *  Connect  return peer Id from the server
 * @type {*}
 */

//======================
//      EXCEPTIONS
//======================

function InvalidValue(msg) {
    this.name = "ValueUndefinied";
    this.message = msg;
}

// ========================
//    PUBLIC INTERFACE
// ========================

function SignalingService (){
    this._checkEventConstants();
}

SignalingService.prototype.connect = function(callBackOnConnected){
    //
    if (io)
        throw new InvalidValue("The module io has not been initialized.");
    //
    this.socket = io.connect();
    this._checkSocket();
    this.socket.on(events.CONNECTED, callBackOnConnected);
}

SignalingService.prototype.getSocket = function() {
    return this.socket;
}

SignalingService.prototype.send = function (eventType, payload) {
    if (!eventType || !payload)
        throw InvalidValue("Specified an incorrect argument");
    this._checkEventType(eventType);
    this._checkSocket();
    this.socket.emit(eventType, payload);

}

SignalinService.prototype.setHandlerForByeEvent = function(handler){
    this._setHandlerFor(events.BYE, handler);
}
SignalinService.prototype.setHandlerForMessageEvent = function(handler){
    this._setHandlerFor(events.MESSAGE, handler);
}
SignalinService.prototype.setHandlerForJoinEvent = function(handler){
    this._setHandlerFor(events.JOIN, handler);
}
SignalinService.prototype.setHandlerForJoinedEvent = function(handler){
    this._setHandlerFor(events.JOINED, handler);
}

//============================================//
//              PRIVATE METHODS
//============================================//

SignalingService.prototype._checkSocket = function(){
    if (this.socket)
        throw new InvalidValue("Invalid socket.io.");
}

SignalingService.prototype._checkEventType = function (new_event) {
    if ( new_event !== events.CONNECTION_REQUEST  ||
         new_event !== events.MESSAGE)
    throw new InvalidValue("The event " + new_event + " specified is unknown.");
}

SignalingService.prototype._setHandlerFor= function (new_event, handler) {
    if (!handler)
        throw new InvalidValue("The handler :  " + handler + "is invalid.");
    this._checkSocket();
    socket.on(new_event, hanlder);
}

SignalingService.prototype._checkEventConstants= function(){
    "use strict";
    if(!events.REQUEST)
        console.log("Error");
}
