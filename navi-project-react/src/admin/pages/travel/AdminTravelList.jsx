import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTravelList, deleteTravel } from '../../../Common/api/travelApi';

import { Table, Button, Space, Popconfirm, Tag, message, Spin, Typography, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminTravelList = () => {
    const navigate = useNavigate();
    const [travelData, setTravelData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });
    const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState(''); 
    const size = 10; // 페이지당 항목 수

    // 목록 데이터 불러오기 (검색어 파라미터 추가)
    const loadTravels = async (pageToLoad, keyword = searchKeyword) => {
        const safeKeyword = keyword || ''; 
        
        setLoading(true);
        setError(null);
        try {
            // 💡 fetchTravelList 함수 호출 시 검색어(keyword)를 함께 전달합니다.
            // (travelApi.js에서 이 검색어를 쿼리 파라미터로 처리해야 합니다.)
            const response = await fetchTravelList(pageToLoad, size, keyword); 
            setTravelData({
                content: response.data.content,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                number: response.data.number, 
            });
            setPage(pageToLoad);
            setSearchKeyword(keyword); // 현재 로드된 검색어를 상태에 업데이트 (페이지 이동 시 사용)
        } catch (err) {
            console.error('Failed to fetch travel list:', err);
            setError('여행지 목록을 불러오는 데 실패했습니다.');
            message.error('여행지 목록 로딩 실패: ' + (err.message || '서버 오류'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 컴포넌트 마운트 시 초기 목록 로드 (페이지 0, 검색어 없음)
        loadTravels(0, '');
    }, []);
    

    const handleSearch = (value) => {
        // 검색어를 변경하고 첫 페이지(0)부터 다시 로드
        loadTravels(0, value);
    };

    const handlePageChange = (pageNumber) => {
        // Antd는 1부터 시작하므로 0부터 시작하는 API에 맞게 -1 처리
        loadTravels(pageNumber); 
    };

    // 삭제 처리 
    const handleDelete = async (travelId) => {
        if (!window.confirm(`ID ${travelId}번 여행지를 정말로 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteTravel(travelId);
            message.success(`여행지 ID ${travelId} 삭제 완료.`);
            
            const newPage = (travelData.content.length === 1 && page > 0) ? page - 1 : page;
            // 삭제 후 현재 검색 상태를 유지하며 목록 리로드
            loadTravels(newPage); 

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
        },
        {
            title: '제목', dataIndex: 'title', key: 'title', ellipsis: true,width:300, 
        },
        {
            title: '카테고리', dataIndex: 'categoryName', key: 'categoryName', width: 100,
        },
        {
            title: '지역', dataIndex: 'region2Name', key: 'region2Name', width: 80,
        },
        {
            title: '상태', dataIndex: 'state', key: 'state', width: 80,
            render: (state) => (
                <Tag color={state === 1 ? 'green' : 'volcano'}>
                    {state === 1 ? '공개' : '비공개'}
                </Tag>
            ),
        },
        {
            title: '등록/수정일', dataIndex: 'updatedAt', key: 'updatedAt', width: 120,
            render: (text, record) => record.updatedAt || '-', 
        },
        {
            title: '관리', key: 'action', width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => navigate(`/adm/travel/edit/${record.travelId}`)}>
                        수정
                    </Button>
                    <Popconfirm
                        title="정말로 삭제하시겠습니까?"
                        onConfirm={() => handleDelete(record.travelId)}
                        okText="삭제" cancelText="취소"
                    >
                        <Button icon={<DeleteOutlined />} danger>
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
            
            {/* 검색 및 등록 버튼 영역 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                
                {/* 검색 입력 필드 (제목 검색으로 가정) */}
                <Input.Search
                    placeholder="제목으로 검색"
                    enterButton="검색"
                    size="large"
                    onSearch={handleSearch} // Enter 또는 검색 버튼 클릭 시 loadTravels(0, value) 호출
                    // 상태와 입력 값 연결 (optional: 실시간 검색 반영을 원치 않으면 이 상태 관리 코드를 제거해도 무방합니다.)
                    // value={searchKeyword} 
                    // onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ maxWidth: 700 }}
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
                dataSource={travelData.content.map(item => ({ ...item, key: item.travelId }))}
                loading={loading}
                pagination={{
                    current: page + 1, 
                    pageSize: size,
                    total: travelData.totalElements,
                    onChange: handlePageChange, 
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
                }}
                locale={{  emptyText: loading ? "데이터 로딩 중..." : "검색 결과 또는 데이터가 없습니다." }}
                rowKey="travelId" 
                bordered 
            />
        </div>
    );
};

export default AdminTravelList;