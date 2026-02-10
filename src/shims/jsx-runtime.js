const React = window.React;
export const Fragment = React.Fragment;

export function jsx(type, props, key) {
    const newProps = { ...props };
    if (key !== undefined && key !== null) {
        newProps.key = key;
    }
    return React.createElement(type, newProps);
}

export const jsxs = jsx;
export const jsxDEV = jsx;
