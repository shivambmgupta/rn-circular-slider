import React, { memo, useRef, useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet
} from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import Animated, { 
    Value,
    Easing,
    block,
    cond,
    not,
    clockRunning,
    startClock,
    timing,
    stopClock,
    Clock,
    interpolate,
    useCode,
    call,
    set
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import withinTen from './validations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(TextInput);

const runTiming = (clock, value, dest, duration) => {
    const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTine: new Value(0)
    };

    const config = {
        toValue: new Value(0),
        duration,
        easing: Easing.inOut(Easing.ease),
    };

    return block([
        cond(not(clockRunning(clock)),
        [
            set(config.toValue, dest),
            set(state.frameTine, 0)
        ]),
        block([
            cond(not(clockRunning(clock)),
            [
                set(state.finished, 0),
                set(state.time, 0),
                set(state.position, value),
                startClock(clock)
            ]),
            timing(clock, state, config),
            cond(state.finished, stopClock(clock)),
            state.position
        ])
    ]);
}

const CircularSlider = ({
    radius,
    strokeWidth,
    color,
    opacity,
    duration,
    progress
}) => {
    const [value, _] = useState(progress % 100);
    const viewBoxDimension = 2 * (radius + strokeWidth);
    const circumference = Math.round(2 * Math.PI * radius);
    const inputRef = useRef();

    const animate = runTiming(new Clock(), 0, 1, duration);
    const strokeDashoffset = interpolate(animate, {
        inputRange: [0, 1],
        outputRange: [circumference, Math.round(circumference * (1 - (value * 0.01)))]
    });

    const text = interpolate(animate, {
        inputRange: [0, 1],
        outputRange: [0, Math.round(value)]
    });

    useCode(() => [
        call([text], ([text]) => {
            text = Math.round(text)?.toString();
            inputRef?.current?.setNativeProps({ text });
        })
    ], [text]);

    return (
        <View>
            <Svg
                width={viewBoxDimension}
                height={viewBoxDimension}
                viewBox={`0 0 ${viewBoxDimension} ${viewBoxDimension}`}
            >
                <G rotation="-90" origin={`${viewBoxDimension/2}, ${viewBoxDimension/2}`}>
                    <Circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        strokeWidth={strokeWidth}
                        stroke={color}
                        fill="transparent"
                        strokeOpacity={opacity}
                    />
                    <AnimatedCircle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        strokeWidth={strokeWidth}
                        stroke={color}
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </G>
            </Svg>
            <AnimatedText
                ref={inputRef}
                underlineColorAndroid="transparent"
                editable={false}
                defaultValue="0"
                style={[
                    StyleSheet.absoluteFillObject,
                    { fontSize: radius / 2, color: color, textAlign: 'center', fontWeight: 'bold' }
                ]}
            />
        </View>
    );
};

CircularSlider.propTypes = {
    radius: PropTypes.number,
    strokeWidth: PropTypes.number,
    color: PropTypes.string,
    opacity: withinTen,
    duration: PropTypes.number,
    progress: PropTypes.number /* value on a scale of 100 */
};

CircularSlider.defaultProps = {
    radius: 80,
    strokeWidth: 10,
    color: 'cyan',
    opacity: 0.2,
    duration: 200,
    progress: 25
};

export default memo(CircularSlider);
