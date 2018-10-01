var title = document.getElementById("titleModelName");
var companyName = document.getElementById("companyName");
var companyDescription = document.getElementById("companyDescription");
var newsCards = document.getElementById("newsCards");


function getParameterByName(name) {
  let url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var ticker = getParameterByName("stock")
title.innerHTML = ticker

getDataAndNews(ticker, function (data) {
  console.log(data.chart.map(function (doc) {
    return [doc.date,doc.low,doc.open,doc.close,doc.high]
  }))
});

google.charts.load('current', {'packages':['corechart','scatter']});
google.charts.setOnLoadCallback(drawChart);

getCompanyData(ticker, function(data) {
  console.log(data)
  companyName.innerHTML = data.companyName
  companyDescription.innerHTML = data.description
})

function drawChart() {

  getDataAndNews(ticker, function(data) {

    // get news
    console.log(data.news)
    const news = data.news
    for (i in news) {
      let newsCardDom = document.createElement('div')
      let newsCardTitleDom = document.createElement('div')
      let newsCardTitleHeaderDom = document.createElement('h2')
      let newsCardSummaryDom = document.createElement('div')
      let dateDom = document.createElement('div')

      newsCardDom.className = "news-card mdl-card mdl-shadow--4dp"
      newsCardTitleDom.className = "mdl-card__title mdl-card--expand mdl-card--border"
      newsCardTitleHeaderDom.className = "mdl-card__title-text"
      newsCardSummaryDom.className = "mdl-card__supporting-text mdl-card--border"
      dateDom.className = "mdl-card__supporting-text"

      newsCardTitleHeaderDom.innerHTML = news[i].headline
      newsCardTitleDom.innerHTML = "<a class='news-title' href='" + news[i].url+ "'>" + newsCardTitleHeaderDom.outerHTML + "</a>"
      newsCardSummaryDom.innerHTML = news[i].summary
      const date = new Date(news[i].datetime)
      dateDom.innerHTML = date
      newsCardDom.appendChild(newsCardTitleDom)
      newsCardDom.appendChild(newsCardSummaryDom)
      newsCardDom.appendChild(dateDom)
      newsCards.appendChild(newsCardDom)
    }


    // get data
    var convertedData = data.chart.map(function (doc) {
      let date = doc.date.toString().split('-')
      let shortDate = date[1] + "-" + date[2]
      return [shortDate,doc.low,doc.open,doc.close,doc.high]
    })
    // convertedData.unshift(["Date","Low","Open","Close","High"])
    console.log(convertedData)
    let pricesData = google.visualization.arrayToDataTable(convertedData,true)
    let options = {
      hAxis: {
        slantedText: true,
        slantedTextAngle: 45
      },
      candlestick: {
        risingColor: {strokeWidth: 0, stroke: "#000", fill: "#00c853"},
        fallingColor: {strokeWidth: 0, fill: "#d50000"}
      },
      colors: ["#9e9e9e"],
      chartArea: {
        height: '75%'
      },
      legend: 'none'
    }

    let chart = new google.visualization.CandlestickChart(document.getElementById('chart_div'));

    chart.draw(pricesData, options);
  })

  getNLU(ticker, function(data) {
    var data = data.rows.filter(function(data) {
      let stock = data.doc.stock
      if (stock.toLowerCase() == ticker.toLowerCase()) {
        return data
      }
    })
    var emotions = data.map(function (data,index) {
      var emotion = data.doc.emotion.document.emotion
      return [{v:index,f:data.doc.retrieved_url},emotion.sadness,emotion.joy,emotion.fear,emotion.disgust,emotion.anger]
    })
    if (emotions.length > 0) {
      emotions.unshift(['News','Sadness','Joy','Fear','Disgust','Anger'])
      var emotionsData = google.visualization.arrayToDataTable(emotions)
      let scatterOptions = {
        hAxis: {
          gridlines: {color: '#fff',count:emotions.length - 1}
        },
        lineWidth: 1,
        vAxis: {title: 'Score'}
      };

      let scatter = new google.visualization.ScatterChart(document.getElementById('emotion_chart'));
      scatter.draw(emotionsData, scatterOptions);
    }
  })
}

// window.onresize = drawChart;