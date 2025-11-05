"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/use-composed-ref@1.4.0_@types+react@19.2.2_react@18.3.1";
exports.ids = ["vendor-chunks/use-composed-ref@1.4.0_@types+react@19.2.2_react@18.3.1"];
exports.modules = {

/***/ "(ssr)/../../node_modules/.pnpm/use-composed-ref@1.4.0_@types+react@19.2.2_react@18.3.1/node_modules/use-composed-ref/dist/use-composed-ref.esm.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/use-composed-ref@1.4.0_@types+react@19.2.2_react@18.3.1/node_modules/use-composed-ref/dist/use-composed-ref.esm.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ useComposedRef)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/../../node_modules/.pnpm/next@14.2.33_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n\n\n// basically Exclude<React.ClassAttributes<T>[\"ref\"], string>\n\nvar updateRef = function updateRef(ref, value) {\n  if (typeof ref === 'function') {\n    ref(value);\n    return;\n  }\n  ref.current = value;\n};\nvar useComposedRef = function useComposedRef(libRef, userRef) {\n  var prevUserRef = react__WEBPACK_IMPORTED_MODULE_0___default().useRef();\n  return react__WEBPACK_IMPORTED_MODULE_0___default().useCallback(function (instance) {\n    libRef.current = instance;\n    if (prevUserRef.current) {\n      updateRef(prevUserRef.current, null);\n    }\n    prevUserRef.current = userRef;\n    if (!userRef) {\n      return;\n    }\n    updateRef(userRef, instance);\n  }, [userRef]);\n};\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3VzZS1jb21wb3NlZC1yZWZAMS40LjBfQHR5cGVzK3JlYWN0QDE5LjIuMl9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3VzZS1jb21wb3NlZC1yZWYvZGlzdC91c2UtY29tcG9zZWQtcmVmLmVzbS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEI7O0FBRTFCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbURBQVk7QUFDaEMsU0FBUyx3REFBaUI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVxQyIsInNvdXJjZXMiOlsid2VicGFjazovL0ByZXBvZ3JhcGgvd2ViLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS91c2UtY29tcG9zZWQtcmVmQDEuNC4wX0B0eXBlcytyZWFjdEAxOS4yLjJfcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy91c2UtY29tcG9zZWQtcmVmL2Rpc3QvdXNlLWNvbXBvc2VkLXJlZi5lc20uanM/NTliMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG4vLyBiYXNpY2FsbHkgRXhjbHVkZTxSZWFjdC5DbGFzc0F0dHJpYnV0ZXM8VD5bXCJyZWZcIl0sIHN0cmluZz5cblxudmFyIHVwZGF0ZVJlZiA9IGZ1bmN0aW9uIHVwZGF0ZVJlZihyZWYsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgcmVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVmKHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbn07XG52YXIgdXNlQ29tcG9zZWRSZWYgPSBmdW5jdGlvbiB1c2VDb21wb3NlZFJlZihsaWJSZWYsIHVzZXJSZWYpIHtcbiAgdmFyIHByZXZVc2VyUmVmID0gUmVhY3QudXNlUmVmKCk7XG4gIHJldHVybiBSZWFjdC51c2VDYWxsYmFjayhmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICBsaWJSZWYuY3VycmVudCA9IGluc3RhbmNlO1xuICAgIGlmIChwcmV2VXNlclJlZi5jdXJyZW50KSB7XG4gICAgICB1cGRhdGVSZWYocHJldlVzZXJSZWYuY3VycmVudCwgbnVsbCk7XG4gICAgfVxuICAgIHByZXZVc2VyUmVmLmN1cnJlbnQgPSB1c2VyUmVmO1xuICAgIGlmICghdXNlclJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB1cGRhdGVSZWYodXNlclJlZiwgaW5zdGFuY2UpO1xuICB9LCBbdXNlclJlZl0pO1xufTtcblxuZXhwb3J0IHsgdXNlQ29tcG9zZWRSZWYgYXMgZGVmYXVsdCB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/.pnpm/use-composed-ref@1.4.0_@types+react@19.2.2_react@18.3.1/node_modules/use-composed-ref/dist/use-composed-ref.esm.js\n");

/***/ })

};
;