var express = require("express");
var router = express.Router();
const https = require('https')

const API_KEY = "";

const stockListAPI = {
    hostname: 'financialmodelingprep.com',
    port: 443,
    path: '/api/v3/nasdaq_constituent?apikey=' + API_KEY,
    method: 'GET'
}

let stockList;

// Hit API once to save all stock symbols in stockList
const req = https.request(stockListAPI, (res) => {
    let text = '';
    res.on('data', (d) => {
        text += d;
    })
    res.on('end', () => {
        stockList = JSON.parse(text);
    })
})

req.on('error', (error) => {
    console.error(error)
})

req.end()


router.get("/", function (req, res, next) {
    res.json({ status: 'success' });
});

// Save stockList in DB by inserting symbols
router.get("/symbol", function (req, res, next) {
    let symbolList = [];
    stockList.map((stock) => (
        symbolList.push({ Symbol: stock.symbol, CompanyName: stock.name })
    ))
    req.db('Stock').insert(symbolList).then(() => {
        res.status(201).json({ Message: 'Successful Insertion' });
        console.log(`Successful Insertion`);
    }).catch(error => {
        res.status(500).json({ Message: "Database error - not updated", Error: error });
        console.log("Error execution sql query");
        console.log(error);
    })
});

// Retrieve stock symbol list not hitting API multiple times
router.get('/symbol/list', function (req, res, next) {

    (async () => {
        try {
            let query = req.db
                .from("Stock")
                .select("CompanyName", "Symbol")
            let rows = await query;
            res.json({ Error: false, Message: "Success", Symbol: rows });
        } catch (err) {
            console.log(err);
            res.json({ Error: true, Message: "Error executing MYSQL query" });
        };
    }
    )();
});

// For the stock detail page including a table
router.post('/stock', function (req, res, next) {
    const symbol = req.body.symbol;
console.log(symbol);
    let stocks;
        const stocksAPI = {
            hostname: 'financialmodelingprep.com',
            port: 443,
            path: '/api/v3/quote/'+symbol+'?apikey=' + API_KEY,
            method: 'GET' 
          }

        const reqAPI = https.request(stocksAPI, (resAPI) => {
            let text = '';
            let data;
            resAPI.on('data', (d) => {
            text += d;
            });
            console.log(data);
            resAPI.on('end', () => {
                stocks = JSON.parse(text);
console.log(stocks);

                if(typeof stocks[0]!== "undefined"){
                    data={
                        msg: "Success to get price list",
                        stock: { symbol: stocks[0].symbol, price: stocks[0].price, changed: stocks[0].changesPercentage, low: stocks[0].dayLow, dayHigh: stocks[0].high, open: stocks[0].open, volume: stocks[0].volume }
                }
                }else{
                    data={
                        msg: "Fail to get price list",
                        stock: {symbol: symbol, price: "no result", changed: "no result"}
                    }
                }

                res.send(data);
            });
        }).on('error', (error) => {
            console.error(error)
        }).end()      
    });


// For the graph in the stock detail page
router.post('/stock/graph', function (req, res, next) {
    let symbol = req.body.symbol;
    let stocks;
    const stocksAPI = {
        hostname: 'financialmodelingprep.com',
        port: 443,
        path: '/api/v3/historical-price-full/' + symbol + '?timeseries=50&apikey=' + API_KEY,
        method: 'GET'
    }

    const reqAPI = https.request(stocksAPI, (resAPI) => {
        let text = '';

        resAPI.on('data', (d) => {
            text += d;
        });
        resAPI.on('end', () => {
            stocks = JSON.parse(text);

            res.send(stocks);
        });
    }).on('error', (error) => {
        console.error(error)
    }).end()
});

module.exports = router;