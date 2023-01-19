var _jsxFileName = "/home/bharath/Desktop/task/front/src/main.jsx";
import { ChakraProvider } from "/node_modules/.vite/deps/@chakra-ui_react.js?v=bbb479ea";
import { configureStore } from "/node_modules/.vite/deps/@reduxjs_toolkit.js?v=bbb479ea";
import __vite__cjsImport2_react from "/node_modules/.vite/deps/react.js?v=bbb479ea"; const React = __vite__cjsImport2_react.__esModule ? __vite__cjsImport2_react.default : __vite__cjsImport2_react;
import __vite__cjsImport3_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=bbb479ea"; const ReactDOM = __vite__cjsImport3_reactDom_client.__esModule ? __vite__cjsImport3_reactDom_client.default : __vite__cjsImport3_reactDom_client;
import { Provider } from "/node_modules/.vite/deps/react-redux.js?v=bbb479ea";
import { BrowserRouter } from "/node_modules/.vite/deps/react-router-dom.js?v=bbb479ea";
import App from "/src/App.jsx?t=1674118663334";
import "/src/index.css";
import { api } from "/src/store/api.js?t=1674118663334";
import slice from "/src/store/store.js?t=1674113951999";
import { jsxDEV as _jsxDEV } from "/@id/__x00__react/jsx-dev-runtime";
const store = configureStore({
  reducer: {
    auth: slice.reducer,
    api: api.reducer
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(api.middleware);
  },
  devTools: "development" === "development"
});
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ _jsxDEV(React.StrictMode, {
  children: /* @__PURE__ */ _jsxDEV(ChakraProvider, {
    children: /* @__PURE__ */ _jsxDEV(BrowserRouter, {
      children: /* @__PURE__ */ _jsxDEV(Provider, {
        store,
        children: /* @__PURE__ */ _jsxDEV(App, {}, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 28,
          columnNumber: 9
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 27,
        columnNumber: 7
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 5
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 25,
    columnNumber: 5
  }, this)
}, void 0, false, {
  fileName: _jsxFileName,
  lineNumber: 24,
  columnNumber: 3
}, this));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLFNBQVNBLHNCQUFzQjtBQUMvQixTQUFTQyxzQkFBc0I7QUFDL0IsT0FBT0MsV0FBVztBQUNsQixPQUFPQyxjQUFjO0FBQ3JCLFNBQVNDLGdCQUFnQjtBQUN6QixTQUFTQyxxQkFBcUI7QUFDOUIsT0FBT0MsU0FBUztBQUNoQixPQUFPO0FBQ1AsU0FBU0MsV0FBVztBQUNwQixPQUFPQyxXQUFXO0FBQWU7QUFFakMsTUFBTUMsUUFBUVIsZUFBZTtBQUFBLEVBQzNCUyxTQUFRO0FBQUEsSUFDTkMsTUFBTUgsTUFBTUU7QUFBQUEsSUFDWkgsS0FBS0EsSUFBSUc7QUFBQUEsRUFDWDtBQUFBLEVBQ0FFLFlBQWFDLDBCQUF3QjtBQUNuQyxXQUFPQSxxQkFBb0IsRUFBR0MsT0FBT1AsSUFBSUssVUFBVTtBQUFBLEVBQ3JEO0FBQUEsRUFDQUcsVUFBVUMsUUFBUUMsSUFBSUMsYUFBYTtBQUNyQyxDQUFDO0FBRURmLFNBQVNnQixXQUFXQyxTQUFTQyxlQUFlLE1BQU0sQ0FBQyxFQUFFQyxPQUNuRCx3QkFBQyxNQUFNLFlBQVU7QUFBQSxZQUNmLHdCQUFDLGdCQUFjO0FBQUEsY0FDZix3QkFBQyxlQUFhO0FBQUEsZ0JBQ1osd0JBQUMsVUFBUTtBQUFBLFFBQUM7QUFBQSxRQUFhLFVBQ3JCLHdCQUFDLEtBQUc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQ0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBQ0c7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNDO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFDQSIsIm5hbWVzIjpbIkNoYWtyYVByb3ZpZGVyIiwiY29uZmlndXJlU3RvcmUiLCJSZWFjdCIsIlJlYWN0RE9NIiwiUHJvdmlkZXIiLCJCcm93c2VyUm91dGVyIiwiQXBwIiwiYXBpIiwic2xpY2UiLCJzdG9yZSIsInJlZHVjZXIiLCJhdXRoIiwibWlkZGxld2FyZSIsImdldERlZmF1bHRNaWRkbGV3YXJlIiwiY29uY2F0IiwiZGV2VG9vbHMiLCJwcm9jZXNzIiwiZW52IiwiTk9ERV9FTlYiLCJjcmVhdGVSb290IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInJlbmRlciJdLCJzb3VyY2VzIjpbIi9ob21lL2JoYXJhdGgvRGVza3RvcC90YXNrL2Zyb250L3NyYy9tYWluLmpzeCJdLCJmaWxlIjoiL2hvbWUvYmhhcmF0aC9EZXNrdG9wL3Rhc2svZnJvbnQvc3JjL21haW4uanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hha3JhUHJvdmlkZXIgfSBmcm9tICdAY2hha3JhLXVpL3JlYWN0J1xuaW1wb3J0IHsgY29uZmlndXJlU3RvcmUgfSBmcm9tICdAcmVkdXhqcy90b29sa2l0J1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnXG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4J1xuaW1wb3J0IHsgQnJvd3NlclJvdXRlciB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgQXBwIGZyb20gJy4vQXBwJ1xuaW1wb3J0ICcuL2luZGV4LmNzcydcbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vc3RvcmUvYXBpJ1xuaW1wb3J0IHNsaWNlIGZyb20gJy4vc3RvcmUvc3RvcmUnXG5cbmNvbnN0IHN0b3JlID0gY29uZmlndXJlU3RvcmUoe1xuICByZWR1Y2VyOntcbiAgICBhdXRoOiBzbGljZS5yZWR1Y2VyLFxuICAgIGFwaTogYXBpLnJlZHVjZXJcbiAgfSxcbiAgbWlkZGxld2FyZTogKGdldERlZmF1bHRNaWRkbGV3YXJlKSA9PntcbiAgICByZXR1cm4gZ2V0RGVmYXVsdE1pZGRsZXdhcmUoKS5jb25jYXQoYXBpLm1pZGRsZXdhcmUpXG4gIH0sXG4gIGRldlRvb2xzOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50J1xufSlcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxSZWFjdC5TdHJpY3RNb2RlPlxuICAgIDxDaGFrcmFQcm92aWRlcj5cbiAgICA8QnJvd3NlclJvdXRlcj5cbiAgICAgIDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuICAgICAgICA8QXBwIC8+XG4gICAgICA8L1Byb3ZpZGVyPlxuICAgIDwvQnJvd3NlclJvdXRlcj5cbiAgICA8L0NoYWtyYVByb3ZpZGVyPlxuICA8L1JlYWN0LlN0cmljdE1vZGU+XG4pXG4iXX0=