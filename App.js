
import React from "react";
import { StatusBar, View } from 'react-native';
import CircularSlider from "./CircularSlider";

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'black' }}>
      <StatusBar hidden />
      <CircularSlider />
    </View>
  );
};
export default App;