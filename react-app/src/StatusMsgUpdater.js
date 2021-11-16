export default class StatusMsgUpdater {
  constructor(setStatusMsg) {
    this.setStatusMsg = setStatusMsg;
  }

  success(msg) {
    msg = msg + "";
    console.log(msg);
    this.setStatusMsg({ msg: msg, type: "success" });
  }
  error(msg) {
    msg = msg + "";
    console.error(msg);
    this.setStatusMsg({ msg: msg, type: "error" });
  }
  clear() {
    this.setStatusMsg(null);
  }
}
