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
var NLU = require('watson-developer-cloud/natural-language-understanding/v1.js');
const Promise = require('bluebird');
var nlu;
var cloudant;

function main(params) {
    cloudant = Cloudant({account:params.USERNAME, password:params.PASSWORD});
    nlu = new NLU({
        username: params.NLU_USERNAME,
        password: params.NLU_PASSWORD,
        version: '2018-03-16'
    })

    var urlArray = [];
    var stocks = Object.keys(params.data)
    for (i in stocks) {
        var news = params.data[stocks[i]].news
        for (j in news) {
            urlArray.push({
                "stock": stocks[i],
                "url": news[j].url
            })
        }
    }
    return Promise.map(urlArray, function (urlArray) {
        return analyze(urlArray)
    }, {concurrency: 10}).then(function(results) {
        // results is an array of data from all the resolved promises
        // remove null/undefined
        return save({"docs": results.filter(n => n)});
    }).catch(function(err) {
        // process error here
        console.log(err)
    });
}

function analyze(urlArray) {
    return new Promise(function (resolve,reject) {
        let parameter = { url: urlArray.url, features: { sentiment: {}, emotion: {}}}
        nlu.analyze(parameter, function (err, response) {
            if (err) {
                console.log('url: ', urlArray.url)
            }
            if (response) {
                response.stock = urlArray.stock
            }
            resolve(response)
        })
    })
}

function save(docs) {
    return new Promise(function (resolve,reject) {
        cloudant.db.destroy("nlu", function (err) {
            cloudant.db.create("nlu", function () {
                let mydb = cloudant.db.use("nlu");
                mydb.bulk(docs, function(err) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs)
                })
            })
        })
    })
}