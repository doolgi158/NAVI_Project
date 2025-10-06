import { useEffect, useState } from "react";
import { getOne } from "../../api/naviApi";

//단일 항목 조회
const tno = travel.travelId;
const travelData = await getOne("travel", tno);
//호출주소  http://localhost:8080/api/travel/....

//목록조회 (pageParam 사용)
const pageParam = {page:1, size:10};
const travelList = await getList("travel",pageParam);
// 호출되는 주소: http://localhost:8080/api/travel/list?page=1&size=10

const initState = {
    travelId:0,
    contentId:0,
    title:'',
    region1Name:'',
    region2Name:'',
    thumbnailPath:'',
    state: true
};

const DetailComponent = ({travelId}) => {
    const [travel, setTravel] = useState(initState);
    const {moveToList} = useCustomMove();

    useEffect(()=>{
        getOne(travelId).then(data =>{
            setTravel(data)
        })
    },[travelId]);

    return(
        <div>
            {makeDiv('TravelId', travel.travelId)}
            {makeDiv('ContentId', travel.contentId)}
            {makeDiv('Title', travel.title)}
            {makeDiv('Region1Name', travel.region1Name)}
            {makeDiv('Region2Name', travel.region2Name)}
            {makeDiv('ThumbnailPath', travel.thumbnailPath)}
            {makeDiv('State', travel.state ? 1 : 0)} 

            
        </div>
    )
}

export default DetailComponent