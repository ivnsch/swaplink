export function AccountViewData(props) {
  console.log(props);
  let viewData = props.viewData;
  return (
    <div>
      {/* <div>Address: {viewData.address}</div> */}
      <div>Status: {viewData.status}</div>
      <div>Holdings: {viewData.holdings}</div>
      <div>Rewards: {viewData.rewards}</div>
      <div>Pending rewards: {viewData.pending_rewards}</div>
    </div>
  );
}
