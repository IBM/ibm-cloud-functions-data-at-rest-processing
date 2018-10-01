/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */

var Cloudant = require('@cloudant/cloudant');
var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var openwhisk = require('openwhisk');

var cloudant;

function main(params) {
    cloudant = Cloudant({account:params.USERNAME, password:params.PASSWORD});
	return new Promise(function (resolve,reject) {
	    let mydb = cloudant.db.use("stocks");
        mydb.list(function(err, data) {
            if (err) {
                reject(err);
            } else {
                var stocksArray = _.map(data.rows, function(doc) {
                    return doc.id
                })
                console.log(stocksArray)
                resolve(getDataAndNews(stocksArray));
            }
        });
	})
}

function getDataAndNews(stocks) {
    let url = "https://api.iextrading.com/1.0/stock/market/batch?symbols=" + stocks.toString() + "&types=news,chart&range=1m"
    return new Promise(function (resolve,reject) {
        request(url, function (error,response,body) {
            if (error) {
                reject(error)
            }
            resolve(updateData(JSON.parse(body)));
        })
    })
}

function updateData(newData) {
    return new Promise(function (resolve,reject) {
        // action names and its package should be the one you deployed in manifest.yaml
        const actionParameters = {name: 'data-at-rest-processing/send-to-nlu',params: {data: newData}}
        const notifyParameters = {name: 'data-at-rest-processing/notify',params: {data: newData}}
        var ow = openwhisk();

        ow.actions.invoke(actionParameters);
        ow.actions.invoke(notifyParameters);

        cloudant.db.destroy("stocks-details", function (err) {
            cloudant.db.create("stocks-details", function (err) {
                let mydb = cloudant.db.use("stocks-details")
                var doc = newData;
                doc._id = "data-and-news"
                mydb.insert(doc, function(err,body) {
                    if (err) {
                        reject(err)
                    }
                    resolve(body)
                })
            });
        })
    })
}