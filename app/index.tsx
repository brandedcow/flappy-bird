import React, { useEffect, useState } from "react";
import {
  Canvas,
  Group,
  useImage,
  Image,
  scale,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Easing,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  useFrameCallback,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const GRAVITY = 9.8;

const App = () => {
  const { width, height } = useWindowDimensions();

  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const bird = useImage(require("@/assets/sprites/yellowbird-upflap.png"));
  const pipe = useImage(require("@/assets/sprites/pipe-green.png"));
  const ground = useImage(require("@/assets/sprites/base.png"));

  const pipeWidth = 104;
  const pipeHeight = 640;
  const pipeOffset = height / 1.6;
  const pipeOpening = 250;

  const x = useSharedValue(width);

  const groundX = useSharedValue(0);
  const birdY = useSharedValue(height / 2.4);
  const birdYVelocity = useSharedValue(0);

  const touch = Gesture.Tap()
    .onTouchesDown(() => {})
    .onEnd(() => {});

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (dt === null) return;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000;
    birdY.value = birdY.value + birdYVelocity.value;
  });

  // Animate Ground
  useEffect(() => {
    groundX.value = withRepeat(
      withSequence(
        withTiming(-width, { duration: 2000, easing: Easing.linear })
      ),
      -1
    );
  }, []);

  return (
    <SafeAreaView>
      <GestureDetector gesture={touch}>
        <Canvas style={{ width, height, backgroundColor: "red" }}>
          {/* Background */}
          <Image image={bg} height={height} width={width} fit={"cover"} />

          {/* Pipes */}
          <Group>
            <Image
              image={pipe}
              height={pipeHeight}
              width={pipeWidth}
              x={x}
              y={-height + pipeOffset}
              transform={[{ rotate: Math.PI }, { scaleX: -1 }]}
              origin={{ x: width / 2, y: 0 }}
            />

            <Image
              image={pipe}
              height={pipeHeight}
              width={pipeWidth}
              x={x}
              y={height - pipeOffset + pipeOpening}
            />
          </Group>

          {/* Ground */}
          <Image
            image={ground}
            height={width / 3}
            width={width}
            x={groundX}
            y={height - width / 3}
          />
          <Image
            image={ground}
            height={width / 3}
            width={width}
            x={groundX}
            y={height - width / 3}
            transform={[{ translateX: width }]}
          />

          {/* Bird */}
          <Image image={bird} width={64} height={48} y={birdY} x={width / 4} />
        </Canvas>
      </GestureDetector>
    </SafeAreaView>
  );
};
export default App;
