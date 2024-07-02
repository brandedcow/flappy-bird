import React, { useEffect } from "react";
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
  runOnJS,
  useDerivedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useGameState } from "@/store/useGameState";

const GRAVITY = 18;
const JUMP = -5;

const App = () => {
  const { isStarted, startGame, endGame } = useGameState();
  const { width, height } = useWindowDimensions();

  const pipeWidth = 104;
  const pipeHeight = 640;
  const pipeOffset = height / 1.6;
  const pipeOpening = 250;
  const birdWidth = 64;
  const birdHeight = 48;

  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const intro = useImage(require("@/assets/sprites/message.png"));
  const birdUpFlap = useImage(
    require("@/assets/sprites/yellowbird-upflap.png")
  );
  const birdMidFlap = useImage(
    require("@/assets/sprites/yellowbird-midflap.png")
  );
  const birdDownFlap = useImage(
    require("@/assets/sprites/yellowbird-downflap.png")
  );
  const bird = [birdUpFlap, birdMidFlap, birdDownFlap];
  const pipe = useImage(require("@/assets/sprites/pipe-green.png"));
  const ground = useImage(require("@/assets/sprites/base.png"));

  const x = useSharedValue(width);

  const groundX = useSharedValue(0);
  const birdFrameIndex = useSharedValue(0);
  const birdY = useSharedValue(height / 2.4);
  const birdYVelocity = useSharedValue(0);
  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [JUMP, -JUMP, 10, GRAVITY],
          [-0.7, -0.4, 0.4, Math.PI / 2],
          Extrapolation.CLAMP
        ),
      },
    ];
  });
  const birdOrigin = useDerivedValue(() => ({
    x: width / 4 + birdWidth / 2,
    y: birdY.value + birdHeight / 2,
  }));

  const touch = Gesture.Tap()
    .onStart(() => {
      if (!isStarted) {
        runOnJS(startGame)();
      }
    })
    .onTouchesDown(() => {
      birdYVelocity.value = JUMP;
    })
    .onEnd(() => {});

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (dt === null) return;

    if (!isStarted) return;
    // birdYVelocity.value = 10;
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
        <Canvas style={{ width, height }}>
          {/* Background */}
          <Image image={bg} height={height} width={width} fit={"cover"} />

          {/* Intro */}
          {!isStarted && (
            <Image
              image={intro}
              height={height * 0.5}
              width={width}
              y={height * 0.12}
            />
          )}

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
          <Group transform={birdTransform} origin={birdOrigin}>
            <Image
              image={birdUpFlap}
              width={birdWidth}
              height={birdHeight}
              x={width / 4}
              y={birdY}
            />
          </Group>
        </Canvas>
      </GestureDetector>
    </SafeAreaView>
  );
};
export default App;
