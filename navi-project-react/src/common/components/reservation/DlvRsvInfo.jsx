const DlvRsvInfo = ({ data, formData }) => (
  <div>
    <h4>짐배송 정보</h4>
    <p>픽업지: {formData?.pickupAddress}</p>
    <p>배송지: {formData?.dropoffAddress}</p>
  </div>
);
export default DlvRsvInfo;
