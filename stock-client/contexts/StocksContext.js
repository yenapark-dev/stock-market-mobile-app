import React, { useState, useContext, useEffect } from "react";
import { AsyncStorage } from "react-native";

const StocksContext = React.createContext();

export const StocksProvider = ({ children }) => {
  const [state, setState] = useState([]);
  
  return (
    <StocksContext.Provider value={[state, setState]}>
      {children}
    </StocksContext.Provider>
  );
};

export const useStocksContext = () => {
  const [state, setState] = useContext(StocksContext);
  const [flag, setFlag] = useState(false);

  // Retrieve the watchlist from async storage
  const retrieveData = async () => {
    try {
      const stockWatchList = await AsyncStorage.getItem("WatchList")
      if(stockWatchList !== null){
        setState(JSON.parse(stockWatchList))
      }
    } catch(err){
      console.log("there was an error retrieving the watchlist from async storage", err)
    }
  }

  const storeData = async (key, value) => {
    try {
      // Save it in Async Storage
      await await AsyncStorage.setItem(key, value)
    }catch(err){
      console.log("error storing the watchlist", err)
    }
  }

    // Add the new symbol to the watchlist, save it in useStockContext state and persist to AsyncStorage
    const addToWatchlist = (newSymbol) => {
      // If state already includes this symbol dont add it

      setState(prevState => {
        if(prevState.includes(newSymbol)) return prevState;

        const stockWatchList = JSON.stringify(state.concat(newSymbol))
        storeData("WatchList", stockWatchList)
        return prevState.concat(newSymbol)
      })
    }

  useEffect(() => {
    retrieveData(); 
}, []);

  return { ServerURL: 'http://172.22.30.58:3001/api', watchList: state,  addToWatchlist };

};
