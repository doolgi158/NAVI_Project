import { useEffect, useState } from "react";
import { getOne,getList } from "../../api/naviApi";

const initState = {
    dtoList:[],
    pageNumList:[], 
    pageRequestDTO: null,
    prev: false,
    next: false,
    totalCount: 0, 
    prevPage: 0,
    nextPage: 0,
    totalPage: 0, 
    current: 0 
};

const ListComponent = () => {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10); // 실제 DB에서 가져올 크기로 설정

    //serverData
    const [serverData, setServerData] = useState(initState);
    const [isLoading, setIsLoading] = useState(false); 

    useEffect(() => {
        setIsLoading(true); // 로딩 시작

        // 실제 서버 API 호출 
        getList("travel", { page, size })
            .then(data => {
                console.log("서버에서 로딩된 데이터:", data);
                setServerData(data);
                setIsLoading(false); // 로딩 종료
            })
            .catch(error => {
                console.error("데이터 로딩 중 오류 발생:", error);
                setIsLoading(false);
            });
        
    }, [page, size]); // page와 size가 변경될 때마다 데이터 로딩

    return(
           <div>
        {/* 3. 목록 및 상세 정보 레이아웃 */}
                <Row justify="center">
                    <Col xs={24} lg={20}> 
                        <Row gutter={[24, 24]}> 
                            
                            {/* A. 좌측 목록 영역 */}
                            <Col xs={24} md={10}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {serverData.travelList.map( travel => (
                                        <Card
                                            key={travel.travelId}
                                            bodyStyle={{ padding: 12, display: 'flex', gap: '12px' }} // ⚠️ flex 스타일 적용
                                            hoverable
                                            onClick={() => handleItemClick(travel.travelId)}
                                        >
                                            {/* 1. 좌측 이미지 영역 */}
                                            <Image 
                                                src={travel.thumbnailPath} 
                                                preview={false}
                                                width={80} // 이미지 너비 설정
                                                height={80} // 이미지 높이 설정
                                                style={{ borderRadius: '8px', objectFit: 'cover' }}
                                            />

                                            {/* 2. 우측 텍스트/메타 정보 영역 */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <List.Item
                                                    style={{ borderBottom: 'none', padding: 0 , marginLeft:'20px'}}
                                                >
                                                    <List.Item.Meta
                                                        title={<Text strong style={{ fontSize: '16px' }}>{travel.title}</Text>}
                                                        description={<Text type="secondary" style={{ fontSize: '12px'}}>{travel.region1Name}&{travel.region2Name}</Text>}
                                                    />
                                                    <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f', fontSize: 14, whiteSpace: 'nowrap' }}>
                                                        <HeartFilled style={{ marginRight: 4 }} /> 
                                                        {travel.likes.toLocaleString()}
                                                    </div>
                                                </List.Item>
                                            </div>
                                        </Card>
                                    ))}
                                </Space>
                            </Col>

                            B. 우측 상세 정보/지도 영역
                            <Col xs={24} md={14}>
                                <Card
                                    title={activeItem.title || "여행지 상세 정보"}
                                    style={{ minHeight: 1135, backgroundColor: '#fafafa' }} 
                                >
                                    {/* 지도 목업 */}
                                    <div style={{ color: '#8c8c8c', padding: 96, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        선택된 (<Text strong>{activeItem.title}</Text>)의 지도 및 상세 내용이 표시됩니다.
                                        <p style={{ marginTop: 8 }}>위치: {activeItem.location}</p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
    )

}

export default ListComponent;
