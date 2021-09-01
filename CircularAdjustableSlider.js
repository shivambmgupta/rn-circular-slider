import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
    memo
} from "react";
import {
    PanResponder,
    Dimensions,
    Animated,
    Easing
} from "react-native";
import Svg, {
    Path,
    Circle,
    Text
} from "react-native-svg";
import PropTypes from 'prop-types';
import withinTen from "./validations";

const parseValToAngle = (val, max) => Math.round(val * 360 / max);
const parseAngleToVal = (angle, max) => Math.round(angle * max / 360);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const CircularAdjustableSlider = ({
    blobRadius,
    radius,
    blobWidth,
    color,
    opacity,
    strokeWidth,
    initialValue,
    maximumValue,
    duration,
    geometricXCenter,
    geometricYCenter
}) => {

    const polarToCartesian = useCallback(
        (angle) => {
            let r = radius;
            let hC = radius + blobRadius;
            let a = ((angle - 90) * Math.PI) / 180.0;
            let x = hC + r * Math.cos(a);
            let y = hC + r * Math.sin(a);
            return { x, y };
        },
        [radius, blobRadius]
    );

    const cartesianToPolar = useCallback(
        (x, y) => {
            let hC = radius + blobRadius;
            if (x === 0) {
                return y > hC ? 0 : 180;
            } else if (y === 0) {
                return x > hC ? 90 : 270;
            } else {
                return (
                    Math.round((Math.atan((y - hC) / (x - hC)) * 180) / Math.PI) +
                    (x > hC ? 90 : 270)
                );
            }
        },
        [radius, blobRadius]
    );

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (e, gs) => true,
            onStartShouldSetPanResponderCapture: (e, gs) => true,
            onMoveShouldSetPanResponder: (e, gs) => true,
            onMoveShouldSetPanResponderCapture: (e, gs) => true,
            onPanResponderMove: (e, gs) => {
                let xOrigin = geometricXCenter - (radius + blobRadius);
                let yOrigin = geometricYCenter - (radius + blobRadius);
                let a = cartesianToPolar(gs.moveX - xOrigin, gs.moveY - yOrigin);
                setAngle(a);
                setVal(parseAngleToVal(a, maximumValue));
            },
        })
    ).current;

    const [angle, setAngle] = useState(parseValToAngle(initialValue, maximumValue));
    const [val, setVal] = useState(initialValue);
    const [width, _] = useState((radius + blobRadius) * 2);

    const animatedValue = React.useRef(new Animated.Value(0)).current;
    const pathRef = React.useRef();

    const animation = (toValue) => {
        return Animated.timing(animatedValue, {
            delay: 0,
            toValue,
            duration,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
        }).start();
    };

    useEffect(() => {
        animation(val);
        animatedValue.addListener(event => {
            const newVal = Math.round(event.value);
            setVal(newVal);
            setAngle(parseValToAngle(newVal, maximumValue));
        });
        return () => {
            animatedValue.removeAllListeners();
        };
    }, []);

    const startCoord = polarToCartesian(0);
    let endCoord = polarToCartesian(angle);

    return (
        <Svg width={width} height={width}>
            <Circle
                r={radius}
                cx={width / 2}
                cy={width / 2}
                stroke={color}
                opacity={opacity}
                strokeWidth={strokeWidth}
                fill="none"
            />
            <AnimatedPath
                ref={pathRef}
                stroke={color}
                strokeWidth={blobWidth}
                fill="none"
                d={`M${startCoord.x} ${startCoord.y} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${endCoord.x} ${endCoord.y}`}
            />
            <AnimatedText
                x={(radius - blobRadius)}
                y={radius + 2 * blobRadius}
                fontSize={radius / 2}
                fill={color}
                style={{ fontWeight: "bold" }}
            >
                {val.toString()}
            </AnimatedText>
            <Circle
                r={blobRadius}
                cx={endCoord.x}
                cy={endCoord.y}
                fill={color}
                {...panResponder.panHandlers}
            />
        </Svg>
    );
};

CircularAdjustableSlider.propTypes = {
    blobRadius: PropTypes.number,
    radius: PropTypes.number,
    blobWidth: PropTypes.number,
    color: PropTypes.string,
    opacity: withinTen,
    strokeWidth: PropTypes.number,
    initialValue: PropTypes.number,
    maximumValue: PropTypes.number,
    duration: PropTypes.number,
    geometricXCenter: PropTypes.number,
    geometricYCenter: PropTypes.number
};

CircularAdjustableSlider.defaultProps = {
    blobRadius: 15,
    radius: 100,
    blobWidth: 5,
    color: "cyan",
    opacity: 0.2,
    strokeWidth: 7,
    initialValue: 0,
    maximumValue: 25,
    duration: 2000,
    geometricXCenter: Dimensions.get("window").width / 2,
    geometricYCenter: Dimensions.get("window").height / 2
};

export default memo(CircularAdjustableSlider);
