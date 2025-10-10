import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTravelList, deleteTravel } from '../../../common/api/travelApi';

import { Table, Button, Space, Popconfirm, Tag, message, Spin, Typography, Input, Image } from 'antd'; // Image 컴포넌트 추가
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Link } = Typography; // Link 컴포넌트 추가

const AdminTravelList = () => {
    const navigate = useNavigate();
    const [travelData, setTravelData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });
    const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState(''); // 현재 로드된 목록의 검색 키워드
    const [inputKeyword, setInputKeyword] = useState(''); // Input 필드에 입력된 키워드 (선택 사항이지만 검색어 표시를 위해 추가)
    const size = 10; // 페이지당 항목 수

    // 목록 데이터 불러오기 (검색어 파라미터 추가)
    const loadTravels = async (pageToLoad, keyword = searchKeyword) => {
        const safeKeyword = keyword || ''; 
        
        setLoading(true);
        setError(null);
        try {
            const response = await fetchTravelList(pageToLoad, size, safeKeyword); 

            // 💡 API 응답 형식이 깨진 경우를 대비하여 방어 코드 추가
            if (!response.data || !Array.isArray(response.data.content)) {
                console.error("API 응답이 유효한 배열을 포함하지 않습니다.", response.data);
                throw new Error("유효하지 않은 데이터 형식입니다.");
            }
            
            setTravelData({
                content: response.data.content,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                number: response.data.number, 
            });
            setPage(pageToLoad);
            setSearchKeyword(safeKeyword); 
            setInputKeyword(safeKeyword); 
        } catch (err) {
            console.error('Failed to fetch travel list:', err);
            setError('여행지 목록을 불러오는 데 실패했습니다.');
            message.error('여행지 목록 로딩 실패: ' + (err.message || '서버 오류'));

            // 💡 오류 발생 시 travelData를 초기 상태로 재설정하여 안전하게 만듦
            setTravelData({ content: [], totalPages: 0, totalElements: 0, number: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTravels(0, '');
    }, []);
    

    const handleSearch = (value) => {
        loadTravels(0, value); 
    };

    const handlePageChange = (pageNumber) => {
        loadTravels(pageNumber - 1, searchKeyword); 
    };

    // 상세 페이지 이동 핸들러
    const handleTitleClick = (travelId) => {
        // 경로 수정: /travel/detail/ 로 연결
        navigate(`/travel/detail/${travelId}`);
    };

    // 삭제 처리 
    const handleDelete = async (travelId) => {
        try {
            await deleteTravel(travelId);
            message.success(`여행지 ID ${travelId} 삭제 완료.`);
            
            const newPage = (travelData.content.length === 1 && page > 0) ? page - 1 : page;
            
            loadTravels(newPage, searchKeyword); 

        } catch (err) {
            console.error('Delete failed:', err);
            const errorMessage = err.response?.data?.message || err.message;
            setError(`삭제 실패: ${errorMessage}`);
            message.error(`삭제 실패: ${errorMessage}`);
        }
    };
    
    // 테이블 컬럼 정의
    const columns = [
        {
            title: 'ID', dataIndex: 'travelId', key: 'travelId', width: 80,
            sorter: (a, b) => a.travelId - b.travelId,
            align: 'center',
        },
        {
            title: '사진', dataIndex: 'imagePath', key: 'imagePath', width: 80, // 너비 조정
            align: 'center',
            // ⭐️ render 함수를 사용하여 이미지 URL을 <img> 태그로 변환 ⭐️
            render: (imagePath) => (
                imagePath ? (
                    <Image 
                        src={imagePath} 
                        alt="여행지 이미지" 
                        style={{ width: 80, height: 60, objectFit: 'cover' }} // 이미지 크기 및 비율 유지 설정
                        preview={{ // 클릭 시 이미지 크게 보기 기능 (Ant Design Image 컴포넌트 기능)
                            maskClassName: 'custom-mask-class', // 마스크 클래스 추가 
                        }}
                    />
                ) : (
                    <span>No Image</span> // 이미지가 없을 경우 대체 텍스트
                )
            ),
        },
        {
            title: '제목', dataIndex: 'title', key: 'title', ellipsis: true,width:200, 
            align: 'center',
            // ⭐️ 제목을 Link로 렌더링하여 클릭 시 상세 페이지로 이동 ⭐️
            render: (text, record) => (
                <Link 
                    onClick={() => handleTitleClick(record.travelId)}
                    style={{ cursor: 'pointer' }}
                >
                    {text}
                </Link>
            ),
        },
        {
            title: '카테고리', dataIndex: 'categoryName', key: 'categoryName', width: 80,
            align: 'center',
        },
        {
            title: '지역', dataIndex: 'region2Name', key: 'region2Name', width: 80,
            align: 'center',
        },
        {
            title: '상태', dataIndex: 'state', key: 'state', width: 50,
            align: 'center',
            render: (state) => (
                <Tag color={state === 1 ? 'green' : 'volcano'}>
                    {state === 1 ? '공개' : '비공개'}
                </Tag>
            ),
        },
        {
            title: '등록/수정일', dataIndex: 'updatedAt', key: 'updatedAt', width: 120,
            align: 'center',
            render: (updatedAt) => {
        if (!updatedAt) return '-';
        
        const date = new Date(updatedAt);
        
        // 날짜 구성 요소 추출 및 두 자리로 패딩 (01, 02...)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다.
        const day = String(date.getDate()).padStart(2, '0');
        
        // 시간 구성 요소 추출 및 두 자리로 패딩
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        
        // 최종 형식: YYYY-MM-DD HH:mm
        return `${year}-${month}-${day} ${hour}:${minute}`;
            }, 
        },
        {
            title: '관리', key: 'action', 
            width: 150, 
            align: 'center',
            // ⭐️⭐️⭐️ 컬럼을 오른쪽으로 고정하여 스크롤 시에도 보이도록 설정 ⭐️⭐️⭐️
            fixed: 'right', 
            render: (_, record) => (
                <Space size="small"> {/* 버튼 간격을 줄여 한 줄에 보이도록 'small'로 변경 */}
                    <Button icon={<EditOutlined />} size="middum" onClick={() => navigate(`/adm/travel/edit/${record.travelId}`)}>
                        수정
                    </Button>
                    <Popconfirm
                        title="정말로 삭제하시겠습니까?"
                        onConfirm={() => handleDelete(record.travelId)}
                        okText="삭제" cancelText="취소"
                    >
                        <Button icon={<DeleteOutlined />} danger size="middum">
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#fff' }}>
            <Title level={3} style={{ marginBottom: '24px' }}>
                여행지 관리 목록
            </Title>
            
            {/* 검색 및 등록 버튼 영역 (이전 수정 반영) */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', // 세로 중앙 정렬 유지
                marginBottom: '16px', 
                gap: '16px' 
            }}>
                
                <Input.Search
                    placeholder="제목으로 검색"
                    enterButton="검색"
                    size="large"
                    onSearch={handleSearch} 
                    value={inputKeyword} 
                    onChange={(e) => setInputKeyword(e.target.value)}
                    // flex: 1을 추가하여 남은 공간을 모두 차지하도록 설정
                    style={{ flex: 1, maxWidth: 700 }} 
                />

                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => navigate('/adm/travel/register')}
                >
                    새 여행지 등록
                </Button>
            </div>
            
            <Title level={5} style={{ margin: '0 0 16px 0' }}>
                {searchKeyword ? `'${searchKeyword}' 검색 결과: ` : ''} 총 {travelData.totalElements}개 항목
            </Title>
            
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>오류: {error}</div>}

            <Table
                columns={columns}
                // ⭐️⭐️⭐️ 테이블에 가로 스크롤 속성 추가 ⭐️⭐️⭐️
                scroll={{ x: 1200 }} 
                // ⭐️ 오류 방지 수정: travelData.content가 undefined일 경우 빈 배열([])을 사용
                dataSource={(travelData.content || []).map(item => ({ ...item, key: item.travelId }))}
                loading={loading}
                pagination={{
                    current: page + 1, 
                    pageSize: size,
                    total: travelData.totalElements,
                    onChange: handlePageChange, 
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
                }}
                locale={{  emptyText: loading ? "데이터 로딩 중..." : "검색 결과 또는 데이터가 없습니다." }}
                rowKey="travelId" 
                bordered 
            />
        </div>
    );
};

export default AdminTravelList;