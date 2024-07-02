import React, { useEffect } from "react";
import { Canvas, Group, useImage, Image } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Easing,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
} from "react-native-reanimated";

const App = () => {
  const { width, height } = useWindowDimensions();

  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const bird = useImage(require("@/assets/sprites/yellowbird-upflap.png"));
  const pipe = useImage(require("@/assets/sprites/pipe-green.png"));
  const ground = useImage(require("@/assets/sprites/base.png"));

  const pipeOffset = height / 1.6;
  const pipeOpening = 250;

  const x = useSharedValue(width - 50);

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(-104, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1
    );
  }, []);

  return (
    <SafeAreaView>
      <Canvas style={{ width, height, backgroundColor: "red" }}>
        <Image image={bg} height={height} width={width} fit={"cover"} />

        <Group>
          <Image
            image={pipe}
            height={640}
            width={104}
            x={x}
            y={-height + pipeOffset}
            transform={[{ rotate: Math.PI }, { scaleX: -1 }]}
            origin={{ x: width / 2, y: 0 }}
          />

          <Image
            image={pipe}
            height={640}
            width={104}
            x={x}
            y={height - pipeOffset + pipeOpening}
          />
        </Group>

        <Image
          image={ground}
          height={width / 3}
          width={width}
          y={height - width / 3}
        />

        <Image
          image={bird}
          width={64}
          height={48}
          y={height / 2}
          x={width / 4}
        />
      </Canvas>
    </SafeAreaView>
  );
};
export default App;
