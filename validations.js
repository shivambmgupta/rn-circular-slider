const withinTen = (props, propName, componentName) => {
    if (!props[propName]) return null;
    if (typeof props[propName] === 'number')
        return (props[propName] >= 0 && props[propName] <= 10)
            ? null
            : new Error(`Invalid range ${propName}`);
    return new Error(`Invalid type ${propName}`)
}

export default withinTen;
