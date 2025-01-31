import React, { useEffect, useState } from "react";
import {
  Canvas,
  Group,
  useImage,
  Image,
  Text,
  useFont,
  Circle,
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
  useDerivedValue,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { getRandomInt } from "@/util/get";

type Circle = {
  cx: number;
  cy: number;
  r: number;
};

type Rect = {
  rx: number;
  ry: number;
  rw: number;
  rh: number;
};

const GRAVITY = 18;
const JUMP = -5;

const App = () => {
  // Constants
  const { width, height } = useWindowDimensions();
  const pipeWidth = 104;
  const pipeHeight = 640;
  const pipeOpening = 250;
  const birdWidth = 64;
  const birdHeight = 48;
  const birdRadius = 24;
  const birdX = width / 4 + birdWidth / 2;
  const groundHeight = width / 3;

  // Assets
  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 32);
  const bg = useImage(require("@/assets/sprites/background-day.png"));
  const intro = useImage(require("@/assets/sprites/message.png"));
  const outro = useImage(require("@/assets/sprites/gameover.png"));
  const birdUpFlap = useImage(
    require("@/assets/sprites/yellowbird-upflap.png")
  );
  const pipe = useImage(require("@/assets/sprites/pipe-green.png"));
  const ground = useImage(require("@/assets/sprites/base.png"));

  // Dynamic Values
  const gameStart = useSharedValue(false);
  const messageHeight = useDerivedValue(() =>
    gameStart.value ? 0 : height / 2
  );
  const gameOver = useSharedValue(false);
  const outroHeight = useDerivedValue(() => (!gameOver.value ? 0 : height / 2));

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
    x: birdX,
    y: birdY.value + birdHeight / 2,
  }));

  const pipeXOffset = useSharedValue(width);
  const pipeYOffset = useSharedValue(getRandomInt(150, height - 450));
  const pipe1Y = useDerivedValue(() => pipeYOffset.value - pipeOpening / 2);
  const pipe1Origin = useDerivedValue(() => ({
    x: pipeXOffset.value,
    y: pipe1Y.value,
  }));
  const pipe2Y = useDerivedValue(() => pipeYOffset.value + pipeOpening / 2);
  const pipe2Origin = useDerivedValue(() => ({
    x: pipeXOffset.value,
    y: pipe2Y.value,
  }));
  const pipes = useDerivedValue(() => [
    {
      rx: pipeXOffset.value,
      ry: pipe1Y.value - pipeHeight,
      rh: pipeHeight,
      rw: pipeWidth,
    },
    {
      rx: pipeXOffset.value,
      ry: pipe2Y.value,
      rh: pipeHeight,
      rw: pipeWidth,
    },
  ]);

  // Animations
  const animateGround = () => {
    groundX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(-width, { duration: 2000, easing: Easing.linear })
      ),
      -1
    );
  };

  const animatePipes = () => {
    pipeXOffset.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 0 }),
        withTiming(-pipeWidth, { duration: 2000, easing: Easing.linear })
      ),
      -1
    );
  };

  // Worklets
  const startGame = () => {
    "worklet";
    gameStart.value = true;
    birdYVelocity.value = JUMP;
    runOnJS(animatePipes)();
  };

  const resetGame = () => {
    "worklet";
    gameStart.value = false;
    gameOver.value = false;
    score.value = 0;
    birdY.value = height / 2.4;
    birdYVelocity.value = 6;
    runOnJS(animateGround)();
    pipeXOffset.value = width;
  };

  // https://www.jeffreythompson.org/collision-detection/circle-rect.php
  const isCircleCollidingWithRect = (circle: Circle, rect: Rect) => {
    "worklet";
    const { cx, cy, r } = circle;
    const { rx, ry, rw, rh } = rect;

    // temporary variables to set edges for testing
    let testX = cx;
    let testY = cy;

    // which edge is closest?
    if (cx < rx) testX = rx; // test left edge
    else if (cx > rx + rw) testX = rx + rw; // right edge
    if (cy < ry) testY = ry; // top edge
    else if (cy > ry + rh) testY = ry + rh; // bottom edge

    // get distance from closest edges
    const distX = cx - testX;
    const distY = cy - testY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // if the distance is less than the radius, collision!
    if (distance <= r) {
      return true;
    }
    return false;
  };

  // On Mount
  useEffect(() => {
    animateGround();
    // animateBirdBop();
  }, []);

  // Handle Taps
  const touch = Gesture.Tap()
    .onTouchesDown(() => {
      if (!gameStart.value) {
        startGame();
      } else if (gameOver.value) {
        resetGame();
      } else {
        birdYVelocity.value = JUMP;
      }
    })
    .onEnd(() => {});

  // Pipe 1 X Change
  useAnimatedReaction(
    () => pipeXOffset.value,
    (currPos, prevPos) => {
      // Increment Score
      if (prevPos && currPos < birdX && prevPos >= birdX) {
        score.value += 1;
      }

      // Refresh YOffset
      if (currPos === -pipeWidth) {
        pipeYOffset.value =
          Math.random() * (height * 0.65 - height * 0.25 + 1) + height * 0.25;
      }
    }
  );

  // Bird Y Change
  useAnimatedReaction(
    () => birdY.value,
    (currentValue, previousValue) => {
      // - Hits the ground
      if (currentValue > height - groundHeight) {
        gameOver.value = true;
      }
      // - Hits the Pipe
      const collision = pipes.value.some((rect) =>
        isCircleCollidingWithRect(
          {
            cx: birdX,
            cy: birdOrigin.value.y,
            r: birdRadius,
          },
          rect
        )
      );
      if (collision) {
        gameOver.value = true;
      }
    }
  );

  // Game Start
  useAnimatedReaction(
    () => gameStart.value,
    (currentValue, previousValue) => {
      if (currentValue && !previousValue) {
        runOnJS(animatePipes)();
      }
    }
  );

  // Game Over
  useAnimatedReaction(
    () => gameOver.value,
    (currentValue, previousValue) => {
      // Stop Animations
      if (currentValue && !previousValue) {
        cancelAnimation(groundX);
        cancelAnimation(pipeXOffset);
      }

      if (!currentValue && previousValue) {
        runOnJS(animateGround)();
      }
    }
  );

  // Bird Physics
  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (dt === null) return;

    if (!gameStart.value) return;
    if (gameOver.value) return;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000;
    birdY.value = birdY.value + birdYVelocity.value;
  });

  return (
    <SafeAreaView>
      <GestureDetector gesture={touch}>
        <Canvas style={{ width, height }}>
          {/* Background */}
          <Image image={bg} height={height} width={width} fit={"cover"} />

          {/* Score */}
          <Text text={scoreText} font={font} x={width / 2} y={40} />

          {/* Intro */}
          <Image
            image={intro}
            height={messageHeight}
            width={width}
            y={height * 0.12}
          />

          {/* Pipes */}
          <Group>
            <Image
              image={pipe}
              height={pipeHeight}
              width={pipeWidth}
              x={pipeXOffset}
              y={pipe1Y}
              origin={pipe1Origin}
              transform={[{ rotate: Math.PI }, { scaleX: -1 }]}
            />

            <Image
              image={pipe}
              height={pipeHeight}
              width={pipeWidth}
              x={pipeXOffset}
              y={pipe2Y}
              origin={pipe2Origin}
            />
          </Group>

          {/* Ground */}
          <Image
            image={ground}
            height={groundHeight}
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
            {/* Bird Hitbox */}
            {/* <Circle cx={birdX} cy={birdYOrigin} r={birdRadius} color="yellow" /> */}
          </Group>

          {/* Game Over */}
          <Image
            image={outro}
            width={width * 0.8}
            height={outroHeight}
            x={width * 0.1}
          />
        </Canvas>
      </GestureDetector>
    </SafeAreaView>
  );
};
export default App;
