

import React from "react";
import { StatusBar, View } from 'react-native';
import CircularAdjustableSlider from "./CircularAdjustableSlider";

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'black' }}>
      <StatusBar hidden />
      <CircularAdjustableSlider 
        maximumValue={25}
        radius={100}
        initialValue={15}
      />
    </View>
  );
};
export default App;