"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoweredByFooter = PoweredByFooter;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
function PoweredByFooter() {
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.container, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.text, children: "Powered by smartserve.ai" }) }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        paddingVertical: 6,
        alignItems: 'center',
    },
    text: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.3)',
    },
});
//# sourceMappingURL=PoweredByFooter.js.map