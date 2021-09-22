import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useStocksContext } from '../contexts/StocksContext';
import { scaleSize } from '../constants/Layout';
import StockTable from '../components/StockTable';
import { TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import StockGraph from '../components/StockGraph';


export default function StocksScreen({ route }) {
  const { ServerURL, watchList } = useStocksContext();
  const [priceInfo, setPriceInfo] = useState([]);
  const [stock, setStock] = useState({});
  const [flag, setFlag] = useState(false);
  const [pressed, setPressed] = useState(false);

  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }

  const getPrice = async (symbol) => {
    try {
      let res = await fetch(ServerURL + "/stock", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ symbol: symbol })
      });
      let data = await res.json();
      return data.stock;

    } catch (error) {
      console.error(error);
    }
  };


  const fetchPrice = async (symbol) => {
    if(!watchList ) return;

    // For each symbol in the watchlist fetch the historical price
    // if the symbol already exists in the price series font re-fetch it again

    const newSymbols = watchList.filter((symbol) => priceInfo.findIndex((priceItem) => priceItem.symbol === symbol) == -1)
    try {
      const responseData = await Promise.all(newSymbols.map(async (symbol) => {
        const data = await getPrice(symbol)
        return data
      }))

      setPriceInfo([...priceInfo, ...responseData])
  
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPrice()
  }, [watchList]);


  if(!priceInfo || !priceInfo.length) return null

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {priceInfo.map((stock) => {
          if (!stock) return
          return (
            <TouchableOpacity key={stock.symbol} onPress={() => { setStock(stock); setPressed(true); }} style={styles.row}>
              <Text style={styles.symbolInStock}>{stock.symbol}</Text>
              <Text style={styles.closePrice}>   {stock.price}     </Text>
              {stock.changed < 0 && <Text style={styles.negative}>{stock.changed}</Text>}
              {stock.changed > 0 && <Text style={styles.positive}>{stock.changed}</Text>}
            </TouchableOpacity>

          );
        })}
      </ScrollView>
      {pressed && <Swiper showsPagination={false}>
        <View >
          <StockTable table={stock} />
        </View>
        <View>
          <StockGraph detail={stock.symbol} />
        </View>
      </Swiper>
      }
      {!pressed && <Text style={styles.item}>Please select the stock. </Text>}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: scaleSize(5),
    borderBottomWidth: scaleSize(1),
  },
  scrollView: {
    marginLeft: '20%',
    width: '100%',
    height: '50%'
  },
  symbolInStock: {
    color: 'white',
    fontSize: scaleSize(20),
    textAlign: "left",
    paddingTop: scaleSize(15),
  }, 
  closePrice: {
    color: 'white',
    fontSize: scaleSize(20),
    marginLeft: scaleSize(100),
    justifyContent: "flex-end",
    position: "absolute",
    paddingTop: scaleSize(15),
  },
  negative: {
    fontSize: 20,
    height: 44,
    color: 'red',
    marginLeft: scaleSize(250),
    justifyContent: "flex-end",
    position: "absolute",
    paddingTop: scaleSize(15),
  },
  positive: {
    fontSize: 20,
    height: 44,
    color: 'green',
    marginLeft: scaleSize(250),
    justifyContent: "flex-end",
    position: "absolute",
    paddingTop: scaleSize(15),
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    fontSize: 15,
    height: '27%',
    color: 'white',
    paddingTop: scaleSize(65),
  },
});