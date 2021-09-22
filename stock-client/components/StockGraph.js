import React, { useState, useEffect } from "react";
import { useStocksContext } from "../contexts/StocksContext";
// Import all the components we are going to use
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
// Import React Native chart Kit for different kind of Chart
import { LineChart } from "react-native-chart-kit";

var headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const MyBezierLineChart = (props) => {
  const { ServerURL } = useStocksContext();
  const [state, setState] = useState({});

  const getDetail = async () => {
    try {
      let res = await fetch(ServerURL + "/stock/graph", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ symbol: props.symbol }),
      });
      let data = await res.json();
      return data;
    } catch (error) {
      console.log("there was an error here", error);
    }
  };

  const fetchDetail = async () => {
    try {
      const result = await getDetail();
      setState(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!props.symbol) return;
    fetchDetail();
  }, [props.symbol]);

  if (!state.historical) {
    return null;
  }

  const closingPriceSeries = state.historical.map((item) => item.close);

  return (
    <>
      <LineChart
        data={{
          datasets: [{ data: closingPriceSeries }],
        }}
        width={Dimensions.get("window").width - 16} // from react-native
        height={80}
        chartConfig={{
          backgroundColor: "#1cc910",
          backgroundGradientFrom: "#eff3ff",
          backgroundGradientTo: "#efefef",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 255) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </>
  );
};

const StockGraph = (props) => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <View>
          <MyBezierLineChart symbol={props.detail} />
        </View>
      </View>
    </ScrollView>
  );
};

export default StockGraph;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: 10,
  },
  header: {
    textAlign: "center",
    fontSize: 18,
    padding: 16,
    marginTop: 16,
  },
});