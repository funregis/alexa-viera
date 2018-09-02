const Alexa = require('alexa-sdk');
const request = require('request');
const {apiKey, appId, serverAddress} = require('./config.json');

const skillName = 'TV Panasonic Remote';

const COMMANDS = {
  group:{
    command: 'X_SendKey',
    path : '/nrc/control_0',
    urn: 'panasonic-com:service:p00NetworkControl:1'
  },
  power : '<X_KeyEvent>NRC_POWER-ONOFF</X_KeyEvent>',
  volume: {
    up: '<X_KeyEvent>NRC_VOLUP-ONOFF</X_KeyEvent>',
    down: '<X_KeyEvent>NRC_VOLDOWN-ONOFF</X_KeyEvent>',
    mute: '<X_KeyEvent>NRC_MUTE-ONOFF</X_KeyEvent>'
  },
  channel: {
    up: '<X_KeyEvent>NRC_CH_UP-ONOFF</X_KeyEvent>',
    down: '<X_KeyEvent>NRC_CH_DOWN-ONOFF</X_KeyEvent>'
  },
  number: '<X_KeyEvent>NRC_D@input@-ONOFF</X_KeyEvent>'
};
const RENDERS = {
  group:{
    command : 'SetVolume',
    path: '/nrc/control_0',
    urn: 'schemas-upnp-org:service:RenderingControl:1'
  },

  volume: '<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>@input@</DesiredVolume>'
} 

const SOAP_TEMPLATES = `<?xml version='1.0' encoding='utf-8'?>
   <s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'>
    <s:Body>
     <u:@command@ xmlns:u='urn:panasonic-com:service:p00NetworkControl:1'>
      @action@
     </u:@command@>
    </s:Body>
   </s:Envelope>`;
   
const SOAP_ACTION = '"urn:@urn@#@command@"';

const makeRequest = (group, action, context) => {
  request.post({
    uri: `${serverAddress}${group.path}`,
    headers: {'Content-Type': 'text/xml; charset="utf-8', 'SOAPACTION': SOAP_ACTION.replace('@urn@',group.urn).replace('@command@',group.command)},
    body: SOAP_TEMPLATES.replace('@command@',group.command).replace('@action@',action)
  }, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      context.emit(':tell', 'Non');
      console.error(error);
      return;
    }
    context.emit(':tell', 'D\'accord');
  });
};

var handlers = {

    "PowerIntent"() {
      makeRequest(COMMANDS.group,COMMANDS.power, this);
    },

    /*"NetflixIntent"() {
      makeRequest(CODES.NETFLIX, this);
    },

    "AppsIntent"() {
      makeRequest(CODES.APPS, this);
    },*/

    "MuteIntent"() {
      makeRequest(COMMANDS.group,COMMANDS.volume.mute, this);
    },

    "VolUpIntent"() {
      makeRequest(COMMANDS.group,COMMANDS.volume.up, this);
    },

    "VolDownIntent"() {
      makeRequest(COMMANDS.group,COMMANDS.volume.down, this);
    },

    /*"VolUpHighIntent"() {
      makeRequest(CODES.VOLUME_UP_HIGH, this);
    },

    "VolDownHighIntent"() {
      makeRequest(CODES.VOLUME_DOWN_HIGH, this);
    },*/

    /*"PlayIntent"() {
      makeRequest(CODES.PLAY, this);
    },

    "PauseIntent"() {
      makeRequest(CODES.PAUSE, this);
    },*/

    "AboutIntent": function () {
        const speechOutput = `Régis fait le boulot d'amazon.`;
        this.emit(':tellWithCard', speechOutput, skillName, speechOutput);
    },

    "AMAZON.HelpIntent": function () {
        const speechOutput = `
        Voilà ce que vous pouvez dire:
        Allume la TV.
        Plus de volume TV.
        Moins de volume TV`;
        this.emit(':ask', speechOutput, speechOutput);
    },

    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Au revoir");
    },

    "AMAZON.CancelIntent": function () {
         this.emit(':tell', "Au revoir");
    },

    "LaunchRequest": function () {
      const speechText = `
      Bienvenue a ${skillName}. Pour savoir quoi demander, dites 'aide'.`;
      const repromptText = `Pour les instructions, dites 'aide'.`
      this.emit(':ask', speechText, repromptText);
    }

};

exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
