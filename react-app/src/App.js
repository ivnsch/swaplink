import "./App.css";
import React, { useState } from "react";
import { GenerateLink } from "./GenerateLink";
import { SubmitLink } from "./SubmitLink";
import { BrowserRouter as Router, Route } from "react-router-dom";

const isIE = /*@cc_on!@*/ false || !!document.documentMode;

function App() {
  if (isIE) {
    return (
      <div style={{ marginLeft: 20, marginRight: 20, marginTop: 20 }}>
        {"Internet Explorer is not supported."}
      </div>
    );
  } else {
    return (
      <Router>
        <div id="wrapper">
          <Route exact path="/" component={GenerateLink} />
          <Route path="/submit/:link" component={SubmitLink} />
        </div>
      </Router>
    );
  }
}

export default App;
