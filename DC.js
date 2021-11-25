const DC={id:null, dc:null, me:null, you:null};

(function(){
  URL='rtc-signal.php';

  let oldid = window.location.hash.match(/^#([1-9]\d{2})$/);
  if (oldid) DC.id = oldid[1];

  function chooseID(){
    let len = 3;
    let max=Math.pow(10,len)-1;
    let min=Math.pow(10,len-1);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var cfg  = {
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  var pc=null;

  function post(data, callback){
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if(ajax.readyState==4 && ajax.status==200){
        callback(JSON.parse(ajax.responseText))
      }
    }
    ajax.open("POST", URL);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(data);
  }

  function init() {
    pc = new RTCPeerConnection(cfg)

    pc.onicecandidate = function(e) {
      if (e.candidate != null) {
        post("id="+DC.id+"&to="+DC.you+"&msg="+encodeURIComponent(JSON.stringify({"ice":e.candidate})), gotmsgs);
      }
    }
    pc.onicegatheringstatechange = function(e){
      if (e.target.iceGatheringState=="complete") {
        function poll(){
          post("to="+DC.you+"&id="+DC.id, function(d){
            gotmsgs(d);
            if (DC.me=='bob' && DC.dc.readyState=="connecting") setTimeout(poll, 1000);
          })
        }
        setTimeout(poll, 1000);
      }
    }
    window.location.replace('#'+DC.id)
  }

  function gotmsgs(d){
    for (c of d.msgs) {
      if (c.ice) {
        pc.addIceCandidate(new RTCIceCandidate(c.ice)).catch(eHandler)
      }
      if (c.sdp) {
        gotsdp(c.sdp)
      }
    }
  }

  function gotsdp(sdp){
    pc.setRemoteDescription( new RTCSessionDescription(sdp)).then(function(){
      if (sdp.type=='offer') pc.createAnswer().then(createdDesc).catch(eHandler)
    });
  }

  function createdDesc(desc){
    pc.setLocalDescription(desc).then(function(){
      post("to="+DC.you+"&id="+DC.id+"&msg="+encodeURIComponent(JSON.stringify({"sdp":pc.localDescription})),gotmsgs)
    }).catch(eHandler);
  }

  DC.host = function( setup ) {
    DC.me='bob';
    DC.you='alice';
    if (!DC.id) DC.id = chooseID();

    init()
    DC.dc = pc.createDataChannel('test')
    Object.assign(DC.dc, setup)
    pc.createOffer().then(createdDesc).catch(eHandler)

    return DC.id;
  };

  DC.join = function( joinid, setup ){
    DC.me='alice';
    DC.you='bob';
    DC.id = joinid;

    init();
    pc.ondatachannel = function (e) {
      DC.dc = e.channel || e;
      Object.assign(DC.dc, setup)
    }
    post("to=bob&id="+DC.id, gotmsgs);
  }

  DC.send = function(data){
    if (DC.dc && DC.dc.readyState=="open" && data) {
      DC.dc.send(JSON.stringify(data));
    }
  }

  function eHandler(error) {
    console.log(error);
  }

})();