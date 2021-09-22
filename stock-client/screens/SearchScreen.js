import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, Text, ScrollView, TouchableOpacity, AsyncStorage, FlatList } from 'react-native';
import { useStocksContext, addToWatchList } from '../contexts/StocksContext';
import { SearchBar } from 'react-native-elements';
import { scaleSize } from '../constants/Layout';

export default function SearchScreen({ navigation }) {
  const { ServerURL, addToWatchlist } = useStocksContext();
  const [search, setSearch] = useState("");
  // Store the symbols list here
  const [state, setState] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);

  const getSymbolList = async () => {
    try {
      let res = await fetch(ServerURL + "/symbol/list");
      let data = await res.json();

      return data.Symbol.map((stock) => ({
        symbol: stock.Symbol,
        name: stock.CompanyName,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStock = async () => {
    try {
      const data = await getSymbolList()
      setState(data)
      setFilteredStocks(data)
    } catch (error) {
      console.log(error);
    }
  }

  const filterStock = (search) => {
    setSearch(search)
 
    const filteredStocks = state && state.filter(({symbol, name}) => symbol.toUpperCase().includes(search.toUpperCase()) ||
    name.toUpperCase().includes(search.toUpperCase()))
    setFilteredStocks(filteredStocks)
  }

  useEffect(() => {
    fetchStock();
  }, []);

  const addStockToWatchList = async(symbol) => {
    try {
      await addToWatchlist(symbol)
      navigation.navigate("Stocks");
    } catch(err){
      console.log("Error adding stock to watchlist", err)
    }

  }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View >
          <SearchBar
            placeholder="Search"
            onChangeText={filterStock}
            value={search}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          {filteredStocks.map((event) => {
            return (
              <TouchableOpacity key={event.symbol} onPress={() => addStockToWatchList(event.symbol)}>
                <Text style={styles.symbolInSearch} > {event.symbol} </Text>
                <Text style={styles.compnayNameInSearch} >{event.name}</Text>
              </TouchableOpacity>);
          })}
        </ScrollView>

      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 7,
    padding: 10,
  },

  scrollView: {
    marginLeft: '7%',
    width: '100%',
    marginTop: '1%',
  },

  symbolInSearch: {
    paddingHorizontal: scaleSize(5),
    paddingTop: scaleSize(15),
    color: "#fff",
    fontSize: scaleSize(20),
},

compnayNameInSearch: {
    paddingHorizontal: scaleSize(10),
    color: "#fff",
},
});