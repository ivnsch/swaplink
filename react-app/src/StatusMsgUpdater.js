import { toFriendlyError } from "./friendlyErrors";

export default class StatusMsgUpdater {
  constructor(setStatusMsg) {
    this.setStatusMsg = setStatusMsg;
  }

  success(msg) {
    msg = msg + "";
    console.log(msg);
    this.setStatusMsg({ displayMsg: msg, type: "success" });
  }
  error(msg) {
    msg = msg + "";
    var displayMsg = msg;
    try {
      const friendlyMsg = toFriendlyError(msg);
      if (friendlyMsg) {
        msg = friendlyMsg + "\nOriginal error: " + msg;
        displayMsg = friendlyMsg;
      }
    } catch (e) {
      msg += "\n+Error mapping to friendly error: " + (e + "");
    }
    console.error(msg);
    this.setStatusMsg({ displayMsg: displayMsg, copyMsg: msg, type: "error" });
  }
  clear() {
    this.setStatusMsg(null);
  }
}
