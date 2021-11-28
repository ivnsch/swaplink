import Modal from "./Modal";

const DisclaimerModal = ({ setShowModal }) => {
  return (
    <Modal title={"Disclaimer"} onCloseClick={() => setShowModal(false)}>
      <p>
        The capitalised terms used in this disclaimer shall have the following
        meanings: “Provider” means the provider of the Software; “User” means a
        person o an entity authorised to access and use the Software; “Software”
        means the software products offered by the Provider.
      </p>

      <ol>
        <li>
          To the extent permitted by the applicable law and the applicable
          licenses, the Provider hereby expressly disclaims all warranties,
          express or implied, for the Software. Unless agreed otherwise between
          the User and the Provider in writing, the Provider offers the Software
          on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
          either express or implied, including, without limitation, any
          warranties or condi-tions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY,
          or FITNESS FOR A PARTICULAR PURPOSE. The entire risk arising out of
          use or performance of the Soft-ware remains with the User.
        </li>
        <li>
          In no event shall the Provider be liable for any damages whatsoever
          (including, without limitation, damages for loss of business profits,
          business interruption, loss of business in-formation, or any other
          pecuniary loss) arising out of the use of or inability to use the
          Software, even if the Provider has been advised of the possibility of
          such damages.
        </li>
        <li>
          The Provider shall not be liable for any use of the Software that has
          not been permitted under the applicable licenses, laws, and
          regulations, including, without limitation, the use of the Software
          for committing cyber offences.{" "}
        </li>
        <li>The Software may be subject to the licensing rights.</li>
        <li>
          The User is solely responsible for determining the appropriateness of
          the Software and assumes any risks associated with User’s exercise of
          permissions under the applicable licenses.
        </li>
        <li>
          The User acknowledges that the Provider may use third-party suppliers
          to provide software, hardware, storage, networking, and other
          technological services pertaining to the Software. The acts and
          omissions of third-party suppliers may be outside of the Provider’s
          reasonable control. To the maximum extent permitted by law, the
          Provider excludes any liability for any loss or damage resulting from
          the acts and omissions of such third-party suppliers.{" "}
        </li>
        <li>
          The Provider may make improvements and/or changes in the Software at
          any time without notice.
        </li>
        <li>
          Third-party software or services are not covered by this disclaimer.
          The User shall en-sure User’s compliance with any terms set forth by
          the respective third parties at its own risk, cost and expense.
        </li>
        <li>
          If any provision or part of a provision of this disclaimer shall be,
          or be found by any court of competent jurisdiction or public authority
          to be, invalid or unenforceable, such invalidity or unenforceability
          shall not affect the other provisions or parts of such provi-sions of
          this disclaimer, all of which shall remain in full force and effect.
        </li>
        <li>
          The User hereby agrees to indemnify, defend, save, and hold harmless
          the Provider, its members, officers, directors, and other agents from
          and against all claims, liabilities, causes of action, damages,
          judgments, attorneys’ fees, court costs, and expenses which arise out
          of or are related to the Software, violation of the rights of a third
          party, or failure to perform as required.
        </li>
        <li>
          All rights reserved. All trademarks mentioned herein belong to their
          respective owners.
        </li>
        <li>
          This disclaimer does not substitute professional or legal advice. The
          provider of this disclaimer expressly disclaims all liability in
          respect to (i) actions taken or not taken by the User on the basis of
          this disclaimer and (ii) the relationship between the provider of this
          disclaimer and the Provider. Under no circumstances will the provider
          of the disclaimer be held liable for any direct, indirect, special,
          incidental, or consequential damages resulting from this disclaimer or
          the provision, use, misuse, or inability to use the Software. The User
          acknowledges that the Software and this disclaimer are used at User’s
          own risk and the Provider is solely responsible for the Software.
        </li>
      </ol>
    </Modal>
  );
};

export default DisclaimerModal;
