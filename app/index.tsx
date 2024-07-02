import React, { useEffect, useState } from "react";
import {
  Canvas,
  Group,
  useImage,
  Image,
  scale,
  Text,
  useFont,
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
  useAnimatedReaction,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useGameState } from "@/store/useGameState";

const GRAVITY = 18;
const JUMP = -5;

const App = () => {
  const { isStarted, startGame, endGame } = useGameState();
  const { width, height } = useWindowDimensions();

  // Constants
  const pipeWidth = 104;
  const pipeHeight = 640;
  const pipeOffset = height / 1.6;
  const pipeOpening = 250;
  const birdWidth = 64;
  const birdHeight = 48;

  // Asests
  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 32);
  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const intro = useImage(require("@/assets/sprites/message.png"));
  const birdUpFlap = useImage(
    require("@/assets/sprites/yellowbird-upflap.png")
  );
  const pipe = useImage(require("@/assets/sprites/pipe-green.png"));
  const ground = useImage(require("@/assets/sprites/base.png"));

  // Dynamic Values
  const score = useSharedValue(0);
  const scoreText = useDerivedValue(() => score.value.toString());

  const groundX = useSharedValue(0);

  const birdY = useSharedValue(height / 2.4);
  const birdYVelocity = useSharedValue(6);
  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [JUMP, -JUMP, 6, 8, GRAVITY],
          [-0.7, -0.5, 0, 1, Math.PI / 2],
          Extrapolation.CLAMP
        ),
      },
    ];
  });
  const birdOrigin = useDerivedValue(() => ({
    x: width / 4 + birdWidth / 2,
    y: birdY.value + birdHeight / 2,
  }));

  const pipe1X = useSharedValue(width);

  // Gesture
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

  // Hooks
  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (dt === null) return;

    if (!isStarted) return;
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

  // Animate Pipes
  useEffect(() => {
    if (isStarted) {
      pipe1X.value = withRepeat(
        withSequence(
          withTiming(-pipeWidth, { duration: 2000, easing: Easing.linear }),
          withTiming(width, { duration: 0 })
        ),
        -1
      );
    }
  }, [isStarted]);

  useAnimatedReaction(
    () => pipe1X.value,
    (currentValue, previousValue) => {
      if (
        // currentValue !== previousValue &&
        previousValue !== null &&
        currentValue <= width / 4 &&
        previousValue > width / 4
      ) {
        score.value += 1;
      }
    }
  );

  return (
    <SafeAreaView>
      <GestureDetector gesture={touch}>
        <Canvas style={{ width, height }}>
          {/* Background */}
          <Image image={bg} height={height} width={width} fit={"cover"} />

          {/* Score */}
          <Text text={scoreText} font={font} x={width / 2} y={40} />

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
              x={pipe1X}
              y={-height + pipeOffset}
              transform={[{ rotate: Math.PI }, { scaleX: -1 }]}
              origin={{ x: width / 2, y: 0 }}
            />

            <Image
              image={pipe}
              height={pipeHeight}
              width={pipeWidth}
              x={pipe1X}
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
