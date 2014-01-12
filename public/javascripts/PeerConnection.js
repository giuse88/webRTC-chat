/* PeerConnection.js */

var app = app || {};

(function() {

app.PeerConnection = Backbone.Model.extend({
  
  /* costants */
  WAITING:0, 
  CONNECTING:1,
  CONNECTED:2, 
  UNKNOWN:3, 

  defaults: {
    status : this.UNKNOWN, 
    isStarted   : false,  
    msgQueue : null,  
    session : null,
    peerId : '', 
    remoteStream  : null, 
    isInitiator : false, 
    isStarted : false, 
    remoteConnection : null, 
  }, 

  initialize: function(id, session, isInitiator) {
    var self=this; 
    
    this.attributes.msgQueue = new Array(); 
    this.attributes.peerId = id;
    this.attributes.session = session; 
    
    if(isInitiator) 
      this.set('isInitiator', true);  

    if (session.isSessionReady())
      this._start(); 
    else 
      session.on('ready', function() { console.log("Session ready" + self.getPeerId()); self._start()}); 

    console.log("Creating Peer Connection");  
  },

  getPeerId: function () {
    return this.attributes.peerId; 
  }, 

  isInitiator : function() {
    return this.get('isInitiator'); 
  }, 

  /* 
  setAsInitiator : function() {
    this.set('isInitiator', true); 
  }, 
*/
  _start: function() { 
    console.log("START");
    console.log("Messages pending in the queue : " + this.attributes.msgQueue.length); 
   this._createPeerConnection();
   this._addLocalStream(); 
   this.set('isStarted', true); 
   console.log("Is initiator : " + this.isInitiator()); 

   this.processQueue();
   
   if (this.isInitiator())
     this.doOffer();
   
  }, 
  
  _addLocalStream: function() {
   this.attributes.remoteConnection.addStream(this.attributes.session.getLocalStream()); 
  },  

  isStarted: function() {
   return this.get('isStarted'); 
  }, 

  processQueue: function () {
  while(this.attributes.msgQueue.length > 0)
    this.processMessage(this.attributes.msgQueue.shift());     
  }, 

  onUserMediaError: function (error) {
  console.log('Failed to get access to local media. Error code was ' + error.code);
  alert('Failed to get access to local media. Error code was ' + error.code + '.');
  }, 

  processMessage: function (message) { 
  var pc = this.get('remoteConnection');
  if (message.type === 'candidate') {
    var candidate = new RTCIceCandidate({sdpMLineIndex: message.label,
                                         candidate: message.candidate});
    pc.addIceCandidate(candidate);
  }
  else if ( message.type === 'offer') { 
    pc.setRemoteDescription( new RTCSessionDescription(message));
    this.doAnswer();
  } else if ( message.type === 'answer') {
    pc.setRemoteDescription( new RTCSessionDescription(message));
  } else {
    console.log("Unknow message");
  }
  },

  onRemoteStreamRemoved: function () {
    console.log("Stream Removed"); 
  }, 

  onRemoteStreamAdded : function (event) {
  this.set('remoteStream', event.stream);
  this.get('session').trigger('peer:ready', this);
  //attachMediaStream(remoteVideo, remoteStream);
  }, 

  iceCandidateType: function(candidateSDP) {
  if (candidateSDP.indexOf("typ relay ") >= 0)
    return "TURN";
  if (candidateSDP.indexOf("typ srflx ") >= 0)
    return "STUN";
  if (candidateSDP.indexOf("typ host ") >= 0)
    return "HOST";
  return "UNKNOWN";
  }, 

  onIceCandidate: function(event) {
  if (event.candidate) {
    this.attributes.session.send(this.attributes.peerId, {type: 'candidate',
                 label: event.candidate.sdpMLineIndex,
                 id: event.candidate.sdpMid,
                 candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
  }, 

  doOffer : function () {
    console.log("Creating offer"); 
    var self = this; 
    this.attributes.remoteConnection.createOffer(function(localDescriptor) {
                                                 self.gotDescriptor(localDescriptor)}, 
                                                 function() {}, constraints);  
  },
  
  doAnswer : function () {
    var self = this; 
    console.log("Creting answer" + this.getPeerId());
    this.attributes.remoteConnection.createAnswer(function(localDescriptor) { 
                                                 self.gotDescriptor(localDescriptor)}, 
                                                 function() {}, constraints);  
  },
  
  gotDescriptor : function(localDescription) {
    this.get('remoteConnection').setLocalDescription(localDescription); 
    this.get('session').send(this.getPeerId(), localDescription);
    console.log("I have got : " + localDescription);
  }, 

  dispatchMessage : function (msg) {
    console.log("Adding message  : " + this.getPeerId()); 
    // only if started
    if(this.isStarted())
      this.processMessage(msg);
    else 
      this.attributes.msgQueue.push(msg);
  }, 

/*  
  getMessage: function() {
    if ( msg.length < 1) 
      return null; 
    else 
     return  this.mswQueue.shift(); 
  }, 
*/
 _createPeerConnection: function() {
  var self = this;  
  try{ 
  this.attributes.remoteConnection = new RTCPeerConnection(pcConfig, pcConstraints);
  var pc =  this.attributes.remoteConnection;
  pc.onicecandidate = function(e) { self.onIceCandidate(e)};
  console.log('Created RTCPeerConnnection with:\n' +
              'config: \'' + JSON.stringify(pcConfig) + '\';\n' +
              'constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object; \n WebRTC is not supported by this browser.');
    return;
  }
  pc.onaddstream = function(e) { self.onRemoteStreamAdded(e);};
  //pc.onremovestream = this.onRemoteStreamRemoved;
  
} 

});

})();