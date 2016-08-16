var TestClient = function(user, serverURL, config) {
  if (typeof user === "string" && user.indexOf("http") > -1 && !serverURL && !config) {
    serverURL = user;
    user = undefined;
  } else if (typeof user === "object") {
    config = user;
    user = undefined;
  } else if (typeof user === "string" && user.indexOf("http") < 0 && typeof serverURL === "object") {
    config = serverURL;
    serverURL = undefined;
  } else if (user && user.indexOf("http") > -1 && typeof serverURL === "object") {
    config = serverURL;
    serverURL = user;
    user = undefined;
  }
  this.localStream = undefined;
  if (!config) {
    config = {
      iceServers: [{
        urls: "stun:61.152.239.47"
      }, {
        urls: ["turn:61.152.239.47:4478?transport=udp", "turn:61.152.239.47:443?transport=udp", "turn:61.152.239.47:4478?transport=tcp", "turn:61.152.239.47:443?transport=tcp"],
        credential: "master",
        username: "woogeen"
      }]
    };
  } else {
    config["iceServers"] = [{
      urls: "stun:61.152.239.47"
    }, {
      urls: ["turn:61.152.239.47:4478?transport=udp", "turn:61.152.239.47:443?transport=udp", "turn:61.152.239.47:4478?transport=tcp", "turn:61.152.239.47:443?transport=tcp"],
      credential: "master",
      username: "woogeen"
    }];
  };
  this.peerClient = new Woogeen.PeerClient(config);
  this.serverURL = serverURL || "http://10.239.44.127:8095/";
  console.log('serverURL:'+this.serverURL);
  this.user = user || "user" + new Date().getTime();
  console.log('user:'+this.user);
  this.request = {};
}

TestClient.prototype = {
  debug: function(title, msg) {
    console.log("TestClient DEBUG MESSAGE: ");
    console.log(title, msg);
  },
  isIE: function() { //ie?
          if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
          else
            return false;
  },
  createLocalStream: function(config) {
    if (!config) {
      config = {
        audio: true,
        video: true
      };
    }
    var that = this;
    if (this.localStream) {
      this.localStream = undefined;
    }
    this.request["createLocal_success"] = this.request["createLocal_success"] || 0;
    this.request["createLocal_failed"] = this.request["createLocal_failed"] || 0;
    Woogeen.LocalStream.create(config, function(err, stream) {
      if (err) {
        that.debug("create stream error:", err);
        that.request["createLocal_failed"]++;
        return;
      }
      that.debug("create stream", "success");
      that.localStream = stream;
      that.request["createLocal_success"]++;
      that.showInPage(stream, "LOCAL STREAM");
    }, function(err) {
      that.request["createLocal_failed"]++;
    });
			$(function(){
          var notice = new PNotify({
            title: 'API: createLocalStream',
            text: 'CreateLocalStream .......',
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });
  },
  bindDefaultListener: function(types) {
    var i = 0,
      count = types.length,
      that = this;
    while (i < count) {
      var str = types[i];
      this.request[str + "_success"] = this.request[str + "_success"] || 0;
      this.request[str + "_failed"] = this.request[str + "_failed"] || 0;
      this.peerClient.addEventListener(str, function(e) {
        that.debug(str + "_success", e);
        that.request[str + "_success"]++;
      }, function(e) {
        that.debug(str + "_failed", e);
        that.request[str + "_failed"]++;
      });
      i++;
    }
  },
  bindListener: function(type, seccessCallBack, errCallBack) {
    this.request[type + "_success"] = this.request[type + "_success"] || 0;
    this.request[type + "_failed"] = this.request[type + "_failed"] || 0;
    this.peerClient.addEventListener(type, seccessCallBack, errCallBack);
  },
  connect: function() {
    var that = this;
    this.request["connect_success"] = this.request["connect_success"] || 0;
    this.request["connect_failed"] = this.request["connect_failed"] || 0;
    console.log('urll:'+this.serverURL);
    this.peerClient.connect({
      host: this.serverURL,
      token: this.user
    }, function() {
      that.debug("connect peer", "success");
      that.request["connect_success"]++;

    }, function() {
      that.debug("connect peer", "failed");
      that.request["connect_failed"]++;
    });
		  $(function(){
          var notice = new PNotify({
            title: 'API: Connection',
            text: "Connect .......",
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
	  });
  },
  disconnect: function() {
    var that = this;
    this.request["disconnect_success"] = this.request["disconnect_success"] || 0;
    this.request["disconnect_failed"] = this.request["disconnect_failed"] || 0;
    this.peerClient.disconnect(function() {
      that.debug("disconnect peer", "success");
      that.request["disconnect_success"]++;
    }, function() {
      that.debug("disconnect peer", "failed");
      that.request["disconnect_failed"]++;
    });
  },
  accept: function(tc) {
    var that = this;
    this.request["accept_success"] = this.request["accept_success"] || 0;
    this.request["accept_failed"] = this.request["accept_failed"] || 0;
    if (typeof tc === "string") {
      this.peerClient.accept(tc, function() {
        that.debug("accept:", "accept user: " + tc + " success");
        that.request["accept_success"]++;

      }, function() {
        that.debug("accept:", "accept user: " + tc + " failed");
        that.request["accept_failed"]++;
      });
    } else {
      this.peerClient.accept(tc.user, function() {
        that.debug("accept:", "accept user: " + tc.user + " success");
        that.request["accept_success"]++;
      }, function() {
        that.debug("accept:", "accept user: " + tc.user + " failed");
        that.request["accept_failed"]++;
      });
    }
			$(function(){
          var notice = new PNotify({
            title: 'API:Accept',
            text: "Accept .......",
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });

     });
  },
  deny: function(tc) {
    var that = this;
    this.request["deny_success"] = this.request["deny_success"] || 0;
    this.request["deny_failed"] = this.request["deny_failed"] || 0;
    if (typeof tc === "string") {
      this.peerClient.deny(tc, function() {
        that.debug("deny:", "deny user: " + tc + " success");
        that.request["deny_success"]++;
      }, function() {
        that.debug("deny:", "deny user: " + tc + " failed");
        that.request["deny_failed"]++;
      });
    } else {
      this.peerClient.deny(tc.user, function() {
        that.debug("deny:", "deny user: " + tc.user + " success");
        that.request["deny_success"]++;
      }, function() {
        that.debug("deny:", "deny user: " + tc.user + " failed");
        that.request["deny_failed"]++;
      });
    }
		$(function(){
          var notice = new PNotify({
            title: 'deny action',
            text: 'publish .......',
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });
  },
  invited: function(tc) {
    var that = this;
    this.request["invite_success"] = this.request["invite_success"] || 0;
    this.request["invite_failed"] = this.request["invite_failed"] || 0;
    if (typeof tc === "string") {
      this.peerClient.invite(tc, function() {
        that.debug("invite:", "invite user: " + tc + " success");
        that.request["invite_success"]++;
      }, function() {
        that.debug("invite:", "invite user: " + tc + " failed");
        that.request["invite_failed"]++;
      });
    } else {
      this.peerClient.invite(tc.user, function() {
        that.debug("invite:", "invite user: " + tc.user + " success");
        that.request["invite_success"]++;
      }, function() {
        that.debug("invite:", "invite user: " + tc.user + " failed");
        that.request["invite_failed"]++;
      });
	  	$(function(){
          var notice = new PNotify({
            title: 'API:invite',
            text: "Invite .......",
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });
    }

  },
  publish: function(tc) {
    var that = this;
    this.request["publish_success"] = this.request["publish_success"] || 0;
    this.request["publish_failed"] = this.request["publish_failed"] || 0;
    if (typeof tc === "string") {
      this.peerClient.publish(this.localStream, tc, function() {
        that.debug("publish:", "publish to user: " + tc + " success");
        that.request["publish_success"]++;
      }, function() {
        that.debug("publish:", "publish to user: " + tc + " failed");
        that.request["publish_failed"]++;
      });
    } else {
      this.peerClient.publish(this.localStream, tc.user, function() {
        that.debug("publish:", "publish to user: " + tc.user + " success");
        that.request["publish_success"]++;
      }, function() {
        that.debug("publish:", "publish to user: " + tc.user + " failed");
        that.request["publish_failed"]++;
      });
    }
	$(function(){
          var notice = new PNotify({
            title: 'API:publish',
            text: 'publish .......',
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });
  },
  unpublish: function(tc) {
    var that = this;
    this.request["unpublish_success"] = this.request["unpublish_success"] || 0;
    this.request["unpublish_failed"] = this.request["unpublish_failed"] || 0;
    if (typeof tc === "string") {
      this.peerClient.unpublish(this.localStream, tc, function() {
        that.debug("unpublish:", "unpublish to user: " + tc + " success");
        that.request["unpublish_success"]++;
      }, function() {
        that.debug("unpublish:", "unpublish to user: " + tc + " failed");
        that.request["unpublish_failed"]++;
      });
    } else {
      this.peerClient.unpublish(this.localStream, tc.user, function() {
        that.debug("unpublish:", "unpublish to user: " + tc.user + " success");
        that.request["unpublish_success"]++;
      }, function() {
        that.debug("unpublish:", "unpublish to user: " + tc.user + " failed");
        that.request["unpublish_failed"]++;
      });
    }
  $(function(){
          var notice = new PNotify({
            title: 'API:unpublish',
            text: "unpublish .......",
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });
  },
  send: function(tc, msg) {
    var that = this;
    this.request["send_success"] = this.request["send_success"] || 0;
    this.request["send_failed"] = this.request["send_failed"] || 0;
    if (typeof tc === "string") {
      console.log("*********send", "tc.user is", tc, " msg is ", msg);
      this.peerClient.send(msg, tc, function() {
        that.debug("send success:", "send to user: " + tc + " success");
        that.request["send_success"]++;
      }, function() {
        that.debug("send fail:", "send to user: " + tc + " failed");
        that.request["send_failed"]++;
      });
    } else {
      console.log("*********send", "tc.user is", tc.user, " msg is ", msg);
      this.peerClient.send(msg, tc.user, function() {
        that.debug("send success:", "send to user: " + tc.user + " success");
        that.request["send_success"]++;
      }, function() {
        that.debug("send fail:", "send to user: " + tc.user + " failed");
        that.request["send_failed"]++;
      });
    }

  },
  stop: function(tc) {
    var that = this;
    this.request["stop_success"] = this.request["stop_success"] || 0;
    this.request["stop_failed"] = this.request["stop_failed"] || 0;
    if (typeof tc === "string") {
      this.peerClient.stop(tc, function() {
        that.debug("stop:", "stop to user: " + tc + " success");
        that.request["stop_success"]++;
      }, function() {
        that.debug("stop:", "stop to user: " + tc + " failed");
        that.request["stop_failed"]++;
      });
    } else {
      this.peerClient.stop(tc.user, function() {
        that.debug("stop:", "stop to user: " + tc.user + " success");
        that.request["stop_success"]++;
      }, function() {
        that.debug("stop:", "stop to user: " + tc.user + " failed");
        that.request["stop_failed"]++;
      });
    }
			  	$(function(){
          var notice = new PNotify({
            title: 'API:stop',
            text: "stop .......",
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });

  },
  enableVideo: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    return stream.enableVideo();
  },
  disableVideo: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    return stream.disableVideo();
  },
  enableAudio: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    return stream.enableAudio();
  },
  disableAudio: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    return stream.disableAudio();
  },
  hasVideo: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    return stream.hasVideo();
  },
  hasAudio: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    return stream.hasAudio();
  },
  close: function(tc) {
    tc = tc || this;
    var stream = tc.localStream;
    stream.close();
  },
  showLog: function() {
	  var cssId = 'myCss';  // you could encode the css path itself to generate id..
     if (!document.getElementById(cssId))
        {
          var head  = document.getElementsByTagName('head')[0];
           var link  = document.createElement('link');
           link.id   = cssId;
           link.rel  = 'stylesheet';
           link.type = 'text/css';
           link.href = 'C:\\Users\\yzha176\\Documents\\webrtc-javascript-sdk\\test\\p2pInteractionTest\\vendor\\pnotify.custom.min.css';
           link.media = 'all';
            head.appendChild(link);
          }
  },
  showInPage: function(stream, tag) {
    console.log('showInPage!')
	 	$(function(){
          var notice = new PNotify({
            title: 'API:show',
            text: "show" + tag +" at HTML page:",
            type: 'error',
            hide: false
          });
          notice.get().click(function() {
            notice.remove();
          });
     });
    var that = this;
    var isIE= that.isIE();
  
    if(isIE==true){
      console.log('IE detected!')
      var localdiv = document.createElement("div");
      var Dectection = true;
      var IsPlaying = false;
         if (window.navigator.appVersion.indexOf('Trident') > -1){
              var canvas = document.createElement('canvas');
              canvas.width = 320;
              canvas.height = 240;
              canvas.setAttribute('autoplay', 'autoplay::autoplay');
              canvas.setAttribute("id", "stream" + stream.id());
              canvas.setAttribute("class", "video");
              // canvas.style.position = "absolute";
              // canvas.style.left = 100;
              // canvas.style.top = 200;
               //document.body.appendChild(canvas);
			    document.body.appendChild(canvas);
			     var para = document.createElement("p");
                var node = document.createTextNode(tag);
                 para.appendChild(node);
                 document.body.appendChild(para);
             // document.getElementById('myVideo').appendChild(canvas);
              if(stream instanceof Woogeen.LocalStream){
                Woogeen.UI.attachMediaStream(canvas, stream.mediaStream);
              }else{
                Woogeen.UI.attachRemoteMediaStream(canvas, stream.mediaStream, stream.mediaStream.attachedPCID);
              }
              // attachMediaStream(canvas, stream.mediaStream);
              console.log('stream added..'+stream.mediaStream);
              return;
            }
    }
    var video = document.createElement("video"),
      videoId = "stream" + stream.id();
    video.setAttribute("id", videoId);
    video.setAttribute("width", "320px");
    video.setAttribute("height", "240px");
    video.setAttribute("class", "video");
    video.setAttribute("autoplay", "autoplay");
    // video.style.position = "absolute";
    // video.style.left = 100;
    // video.style.top = 200;
    console.log('added video:'+stream.mediaStream);
    document.body.appendChild(video);
    var para = document.createElement("p");
    var node = document.createTextNode(tag);
    para.appendChild(node);
    document.body.appendChild(para);
    Woogeen.UI.attachMediaStream(video, stream.mediaStream);
    this.request[videoId] = startDetection(videoId, "320", "240");
	
		 
  },
  removeVideo: function(stream) {
    var videos = document.getElementsByClassName("video");
    if (stream) {
      videos = [document.getElementById("stream" + stream.id())]
    };
    for (var i = 0; i < videos.length; i++) {
      document.body.removeChild(videos[i]);
    };
  },
  videoPlaying: function() {
    return isVideoPlaying();
  },
  getRequest: function() {
    return this.request;
  },
  clearClient: function() {
    if (this.peerClient) {
      this.peerClient.disconnect();
    }
    this.peerClient = undefined;
    this.request = undefined;
    this.user = undefined;
    if (this.localStream) {
      this.localStream.close();
    }
    this.localStream = undefined;
    this.removeVideo();
  },
  recreateTestClient: function(user, serverURL, config) {
    if (user && user.indexOf("http") > -1 && !serverURL && !config) {
      serverURL = user;
      user = undefined;
    } else if (typeof user === "object") {
      config = user;
      user = undefined;
    } else if (typeof user === "string" && user.indexOf("http") < 0 && typeof serverURL === "object") {
      config = serverURL;
      serverURL = undefined;
    } else if (user && user.indexOf("http") > -1 && typeof serverURL === "object") {
      config = serverURL;
      serverURL = user;
      user = undefined;
    }
    if (!config) {
      config = {};
    }
    this.peerClient = new Woogeen.PeerClient(config);
    this.serverURL = serverURL || "http://localhost:8095/";
    this.user = user || "user" + new Date().getTime();
    this.request = {};
  }
};

TestClient.prototype.constructor = TestClient;