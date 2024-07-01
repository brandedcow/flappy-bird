import React from "react";
import {
  Canvas,
  Circle,
  Group,
  useImage,
  Image,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const App = () => {
  const { width, height } = useWindowDimensions();

  const bg = useImage(require("@/assets/sprites/background-day.png"));

  const r = width * 0.33;
  return (
    <SafeAreaView>
      <Canvas style={{ width, height, backgroundColor: "red" }}>
        <Image image={bg} height={height} width={width} fit={"cover"} />
      </Canvas>
    </SafeAreaView>
  );
};
export default App;
