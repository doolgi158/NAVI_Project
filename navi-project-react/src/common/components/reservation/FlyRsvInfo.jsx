const FlyRsvInfo = ({ data, formData }) => (
  <div>
    <h4>항공 일정</h4>
    <p>출발: {data?.departure} → 도착: {data?.arrival}</p>
    <p>탑승일: {formData?.flightDate}</p>
  </div>
);
export default FlyRsvInfo;
