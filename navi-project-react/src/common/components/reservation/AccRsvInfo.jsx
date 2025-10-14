const AccRsvInfo = ({ data, formData }) => (
  <div>
    <h4>숙박 일정</h4>
    <p>{formData?.checkIn} ~ {formData?.checkOut}</p>
    <p>객실: {data?.roomName}</p>
    <p>인원: {formData?.guestCount}명</p>
  </div>
);
export default AccRsvInfo;
