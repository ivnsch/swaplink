import "./App.css";
import { GenerateLink } from "./generate_link/GenerateLink";
import { SubmitLink } from "./submit_link/SubmitLink";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Modal from "./Modal";
import React, { useState } from "react";

const isIE = /*@cc_on!@*/ false || !!document.documentMode;

const App = () => {
  const [showLegalModal, setShowLegalModal] = useState(false);

  if (isIE) {
    return (
      <div style={{ marginLeft: 20, marginRight: 20, marginTop: 20 }}>
        {"Internet Explorer is not supported."}
      </div>
    );
  } else {
    return (
      <div>
        <Router>
          <div id="wrapper">
            <Route exact path="/" component={GenerateLink} />
            <Route path="/submit/:link" component={SubmitLink} />
            <div className="footer">
              <a
                href="https://github.com/ivanschuetz/swaplink"
                target="_blank"
                rel="noopener noreferrer"
              >
                {"Github"}
              </a>
              <a
                onClick={() => {
                  setShowLegalModal(!showLegalModal);
                }}
                rel="noopener noreferrer"
              >
                {"Disclaimer"}
              </a>
            </div>
            {showLegalModal && (
              <Modal
                title={"Disclaimer"}
                onCloseClick={() => setShowLegalModal(false)}
              >
                <p>YOLO 🏳️</p>
              </Modal>
            )}
          </div>
        </Router>
      </div>
    );
  }
};

export default App;
