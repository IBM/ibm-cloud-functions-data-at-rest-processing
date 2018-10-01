/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  
const twilio = require('twilio');
const Promise = require('bluebird');
const request = require('request');

function main(params) {
    let stocks = Object.keys(params.data)
    
    // get recent data of stocks
    let mostRecentData = [];
    for (i in stocks) {
        let stock = stocks[i]
        mostRecentData.push({stock: stock, lastData: params.data[stock].chart.pop()})
    }
    
    // find out which parameters are set for either twilio or slack
    let notifyArray = [];
    if (params.TWILIO_SID && params.TWILIO_AUTH && params.NUMBER_OF_RECEIVER && params.TWILIO_NUMBER) {
        notifyArray.push(true)
    } else {
        notifyArray.push(false)
    }
    notifyArray.push(Boolean(params.SLACK_WEBHOOK))
    
    // set the message to be sent in notification
    let threshold = params.THRESHOLD || 0
    let message = mostRecentData.reduce(function (messages,currentValue) {
        let value = currentValue.lastData.changePercent
        if (Math.abs(value) > params.THRESHOLD) {
            return messages + currentValue.stock + " has changed by " + value + "\n"
        } else {
            return messages
        }
    },"")
    
    return new Promise.map(notifyArray, function(bool,index) {
        if (index == 0) {
            return twilioNotify(bool,params,message)
        } else {
            return slackNotify(bool,params,message)
        }
    }).then(function (results) {
        return {result: results};
    })
}

function twilioNotify(paramsIsPresent,params,message) {
    return new Promise(function (resolve,reject) {
        if (paramsIsPresent) {
            var client = new twilio(params.TWILIO_SID, params.TWILIO_AUTH);
            client.messages.create({
                body: message,
                to: params.NUMBER_OF_RECEIVER,  // Text this number
                from: params.TWILIO_NUMBER // From a valid Twilio number
            })
            .then(function (message) {
                console.log("sent")
                resolve({result:message.sid})
            });
        } else {
            resolve({result: "No credentials for Twilio"})
        }
    });
}

function slackNotify(paramsIsPresent,params,message) {
    return new Promise(function (resolve,reject) {
        if (paramsIsPresent) {
            request({
                method: 'POST',
                uri: params.SLACK_WEBHOOK,
                json: true,
                body: {text: message}
            }, function (err,response,body) {
                resolve({result: body})
            })
        } else {
            resolve({result: "No slack webhook found in params"})
        }
    })
}
