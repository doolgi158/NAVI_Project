import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveOrUpdateTravel, fetchTravelDetail } from '../../../Common/api/travelApi';
// Ant Design 컴포넌트 import
import { Form, Input, InputNumber, Checkbox, Button, Spin, Alert, Card, Row, Col, message, Radio } from 'antd';

// ✅ 모든 Input 컴포넌트에 적용할 스타일 정의
const inputStyle = { height: '50px' };

// 카테고리 코드 옵션 정의
const categoryCodeOptions = [
    { label: '관광지 (c1)', value: 'c1' },
    { label: '쇼핑 (c2)', value: 'c2' },
    { label: '음식점 (c4)', value: 'c4' },
];

// 폼 초기 상태
const initialFormData = {
    travelId: null,
    contentId: '',
    contentsCd: 'c1', // 초기값: 'c1' (관광지)로 설정
    title: '',
    introduction: '',
    address: '',
    roadAddress: '',
    phoneNo: '',
    tag: '',
    longitude: 0.0,
    latitude: 0.0,
    categoryName: '',
    region1Name: '',
    region2Name: '',
    imagePath: '',
    thumbnailPath: '',
    state: 1, // 1: 공개, 0: 비공개
    homepage: '',
    parking: '',
    fee: '',
    hours: '',
};


const AdminTravelForm = () => {
    const { travelId } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm(); 

    const isEditMode = !!travelId;

    // 1. 수정 모드일 때 기존 데이터 불러오기 및 폼 채우기
    useEffect(() => {
        if (travelId) {
            setLoading(true);
            fetchTravelDetail(travelId)
                .then(response => {
                    const data = response.data;
                    
                    // 폼 데이터 설정: state는 Checkbox를 위해 boolean으로 변환
                    form.setFieldsValue({
                        ...data,
                        state: data.state === 1, // 1 -> true, 0 -> false
                        // 신규 필드가 API 응답에 없을 경우를 대비하여 빈 문자열로 초기화
                        homepage: data.homepage || '', 
                        parking: data.parking || '',
                        fee: data.fee || '',
                        hours: data.hours || '',
                    });

                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch detail:', err);
                    setError('여행지 데이터를 불러오는 데 실패했습니다.');
                    setLoading(false);
                });
        } else {
            form.resetFields();
            // 등록 모드일 때 초기값 설정 (contentsCd 초기값도 포함)
            form.setFieldsValue({ ...initialFormData, state: true }); 
        }
    }, [travelId, form]);

    // 2. 폼 제출 핸들러 (등록/수정 처리)
    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        const dataToSend = {
            ...values,
            travelId: isEditMode ? travelId : null,
            state: values.state ? 1 : 0, 
            contentId: isEditMode ? values.contentId : null, // Oracle DB NOT NULL 오류 방지
        };

        try {
            await saveOrUpdateTravel(dataToSend);
            message.success(isEditMode ? '여행지 정보가 성공적으로 수정되었습니다.' : '새 여행지가 성공적으로 등록되었습니다.');
            navigate('/adm/travel'); 
        } catch (err) {
            console.error('Save/Update failed:', err);
            const errorMessage = err.response?.data || err.message || '알 수 없는 오류가 발생했습니다.';
            setError(`작업 실패: ${errorMessage}`);
            message.error(`작업 실패: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Spin tip="데이터 로딩 중..." size="large" />
            </div>
        );
    }
    
    return (
        <Card 
            title={isEditMode ? `여행지 수정: ${form.getFieldValue('title') || travelId}` : '새 여행지 등록'}
            extra={
                <Button onClick={() => navigate('/adm/travel')}>
                    목록으로
                </Button>
            }
            style={{ margin: '20px' }}
        >
            {error && <Alert message="오류" description={error} type="error" showIcon closable style={{ marginBottom: 20 }} />}

            <Form
                form={form}
                layout="vertical"
                initialValues={{ ...initialFormData, state: true }} 
                onFinish={onFinish}
                onFinishFailed={(errorInfo) => {
                    console.error('Failed:', errorInfo);
                    message.error('필수 항목을 모두 입력해주세요.');
                }}
                disabled={loading}
            >
                {/* 1. 기본 정보 */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="제목"
                            name="title"
                            rules={[{ required: true, message: '제목을 입력해주세요.' }]}
                        >
                            <Input style={inputStyle} /> 
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="카테고리 코드 (contentsCd)"
                            name="contentsCd"
                            rules={[{ required: true, message: '카테고리 코드를 선택해주세요.' }]}
                        >
                            <Radio.Group 
                                options={categoryCodeOptions}
                                optionType="button" 
                                buttonStyle="solid" 
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                
                {/* 2. 공개 상태 */}
                <Form.Item name="state" valuePropName="checked">
                    <Checkbox>공개 상태 (체크 시 공개)</Checkbox>
                </Form.Item>

                {/* 3. 소개 */}
                <Form.Item label="소개" name="introduction">
                    {/* TextArea는 rows로 높이 조절 */}
                    <Input.TextArea rows={4} /> 
                </Form.Item>

                {/* 3-1. 태그 필드 (소개 밑으로 이동) */}
                <Form.Item label="태그" name="tag">
                    <Input style={inputStyle} /> 
                </Form.Item>
                
                {/* 4. 상세 정보 - 2열로 배치 */}
                <Card title="상세 정보" size="small" style={{ marginBottom: 20}}>
                    {/* gutter 16은 그대로 유지, Col span을 12에서 10으로 변경하여 여백 확보 */}
                    <Row gutter={16}>
                        {/* 좌측 컬럼: 위치/이미지 정보 */}
                        <Col span={12}> {/* ✅ span 12로 유지하여 공간 활용 */}
                            {isEditMode && (
                                <Form.Item label="API 콘텐츠 ID" name="contentId">
                                    <Input disabled={true} style={inputStyle} placeholder="API 연동 시 사용되며 수정 불가" /> 
                                </Form.Item>
                            )}
                            <Form.Item label="주소" name="address">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                            <Form.Item label="도로명 주소" name="roadAddress">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                            <Form.Item label="지역1(시/도)" name="region1Name">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                            <Form.Item label="지역2(시/군/구)" name="region2Name">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                            <Form.Item label="경도 (Longitude)" name="longitude">
                                {/* InputNumber의 Input 요소에도 style 적용 */}
                                <InputNumber style={{ ...inputStyle, width: '100%' }} step={0.000001} /> 
                            </Form.Item>
                            <Form.Item label="위도 (Latitude)" name="latitude">
                                <InputNumber style={{ ...inputStyle, width: '100%' }} step={0.000001} /> 
                            </Form.Item>
                            
                            <Form.Item label="대표 이미지 경로" name="imagePath">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                            <Form.Item label="썸네일 경로" name="thumbnailPath">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                        </Col>
                        
                        {/* 우측 컬럼: 상세/연락 정보 */}
                        <Col span={12}> 
                            <Form.Item label="카테고리 이름" name="categoryName">
                                <Input style={inputStyle} />
                            </Form.Item>
                            
                            <Form.Item label="전화번호" name="phoneNo">
                                <Input style={inputStyle} /> 
                            </Form.Item>
                            
                            {/* -------------------- ✅ 신규 필드 -------------------- */}
                            <Form.Item label="홈페이지" name="homepage">
                                <Input style={inputStyle} placeholder="http:// 또는 https://" /> 
                            </Form.Item>
                            <Form.Item label="주차 시설" name="parking">
                                <Input style={inputStyle} placeholder="가능 / 불가능 / 상세 설명" />
                            </Form.Item>
                            <Form.Item label="이용 요금" name="fee">
                                <Input style={inputStyle} placeholder="무료 / 성인 5,000원 등" /> 
                            </Form.Item>
                            <Form.Item label="이용 시간" name="hours">
                                <Input style={inputStyle} placeholder="09:00 ~ 18:00 (연중무휴)" /> 
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
                
                {/* 5. 제출 버튼 */}
                <Form.Item style={{ textAlign: 'right' }}>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                    >
                        {isEditMode ? '수정 완료' : '등록'}
                    </Button>
                    <Button 
                        onClick={() => navigate('/adm/travel')} 
                        style={{ marginLeft: 8 }}
                    >
                        목록으로
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AdminTravelForm;