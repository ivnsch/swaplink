import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";

const CopyPasteText = ({ text, copyText: copyTextOpt }) => {
  const [isCopied, setIsCopied] = useState(false);
  const copyText = copyTextOpt ?? text;

  const onCopy = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <CopyToClipboard text={copyText} onCopy={onCopy}>
      <div className="copyable">
        {text}
        <span class="copy">{isCopied ? "copied!" : <MdContentCopy />}</span>
      </div>
    </CopyToClipboard>
  );
};

export default CopyPasteText;
