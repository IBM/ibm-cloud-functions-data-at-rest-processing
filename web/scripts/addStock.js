var createButton = document.getElementById("createButton");
var div = document.getElementById("createClassifierDiv");
var inputDiv = document.getElementById("inputDiv");
var ticker = document.getElementById("ticker");
var cancelCreateButton = document.getElementById("cancelCreateModel");
var confirmCreateButton = document.getElementById("confirmCreateModel");
var tableBody = document.getElementById("tableModelsContent");

inputDiv.hidden = true
cancelCreateButton.hidden = true
confirmCreateButton.hidden = true

cancelCreateButton.onclick = function() {
  createButton.hidden = false
  inputDiv.hidden = true
  cancelCreateButton.hidden = true
  confirmCreateButton.hidden = true
  inputDiv.className = "mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-upgraded"
  ticker.value = ""
}

// create the text input on click
createButton.onclick = function() {
  console.log("test");
  createButton.hidden = true
  inputDiv.hidden = false
  cancelCreateButton.hidden = false
  confirmCreateButton.hidden = false
}

confirmCreateButton.onclick = function () {
  createClassifier()
}

// create the classifier
function createClassifier() {
  addStock(ticker.value, function(result,company){
    if (result.error) {
      return
    }
    console.log(result)
    console.log(company)
    addToTable(company.symbol, company.companyName, company.sector)
  })
}

function getAllDocuments() {
  getAll(function(result) {
    for (var index in result.rows) {
      let doc = result.rows[index].doc
      console.log(doc)
      addToTable(doc._id, doc.companyName, doc.sector)
    }
  })
}

function addToTable(symbol,name,sector) {
  let row = document.createElement('tr');
  let symbolDom = document.createElement('td');
  let nameDom = document.createElement('td');
  let sectorDom = document.createElement('td');
  symbolDom.className = "mdl-data-table__cell--non-numeric"
  nameDom.className = "mdl-data-table__cell--non-numeric"
  sectorDom.className = "mdl-data-table__cell--non-numeric"

  symbolDom.innerHTML = "<a href='stock.html?stock=" + symbol + "'>" + symbol + "</a>"
  row.appendChild(symbolDom)
  nameDom.innerHTML = name
  row.appendChild(nameDom)
  sectorDom.innerHTML = sector
  row.appendChild(sectorDom)
  tableBody.appendChild(row)
}

getAllDocuments()
