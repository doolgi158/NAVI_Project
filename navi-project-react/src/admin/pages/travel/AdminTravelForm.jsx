import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveAdminTravel, fetchAdminTravelDetail  } from '../../../common/api/adminTravelApi';
// Ant Design 컴포넌트 import
import { Form, Input, InputNumber, Checkbox, Button, Alert, Card, Row, Col, message, Radio } from 'antd'; 

// ✅ 모든 Input 컴포넌트에 적용할 스타일 정의
const inputStyle = { height: '50px' };

// 카테고리 코드 옵션 정의
const categoryCodeOptions = [
    { label: '관광지 (c1)', value: 'c1' },
    { label: '쇼핑 (c2)', value: 'c2' },
    { label: '음식점 (c4)', value: 'c4' },
];

// ⭐️⭐️⭐️ 1. contentsCd 값에 따른 categoryName 매핑 객체 정의 ⭐️⭐️⭐️
const categoryMap = {
    'c1': '관광지',
    'c2': '쇼핑',
    'c4': '음식점',
};


// 폼 초기 상태
const initialFormData = {
    travelId: null,
    contentId: '',
    contentsCd: 'c1', 
    title: '',
    introduction: '',
    address: '',
    roadAddress: '',
    phoneNo: '',
    tag: '',
    longitude: 0.0,
    latitude: 0.0,
    region1Name: '',
    region2Name: '',
    // 초기 categoryName은 초기 contentsCd('c1')에 맞춰 '관광지'로 설정
    categoryName: categoryMap['c1'], 
    imagePath: '',
    thumbnailPath: '',
    state: true, // Checkbox 바인딩을 위해 boolean으로 변경
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
    const [formData, setFormData] = useState(initialFormData); 
    
    const isEditMode = !!travelId;

    // ⭐️⭐️⭐️ 2. 폼 데이터 변경 핸들러 수정: contentsCd 변경 시 categoryName 자동 설정 ⭐️⭐️⭐️
    const handleChange = useCallback((name, value) => {
        setFormData(prev => {
            const newFormData = {
                ...prev,
                [name]: value,
            };
            
            // contentsCd가 변경되었을 때만 categoryName을 업데이트
            if (name === 'contentsCd') {
                newFormData.categoryName = categoryMap[value] || '';
            }
            
            return newFormData;
        });
    }, []);
    
    // Checkbox 변경 핸들러
    const handleCheckboxChange = useCallback((e) => {
        handleChange(e.target.name, e.target.checked);
    }, [handleChange]);

    // Input/Textarea/RadioGroup 변경 핸들러
    const handleInputChange = useCallback((e) => {
        handleChange(e.target.name, e.target.value);
    }, [handleChange]);

    // InputNumber 변경 핸들러
    const handleNumberChange = useCallback((name, value) => {
        // null, undefined, NaN이 아닐 경우에만 값 설정
        const safeValue = (value === null || isNaN(value)) ? 0.0 : value;
        handleChange(name, safeValue);
    }, [handleChange]);
    
    // 1. 수정 모드일 때 기존 데이터 불러오기 및 폼 채우기
    useEffect(() => {
        if (travelId) {
            setLoading(true);
            fetchAdminTravelDetail (travelId)
                .then(response => {
                    const data = response.data;
                    
                    // setFieldsValue 대신 setFormData 사용
                    setFormData({
                        ...data,
                        state: data.state === 1, // 숫자(1/0)를 boolean으로 변환
                        homepage: data.homepage || '', 
                        parking: data.parking || '',
                        fee: data.fee || '',
                        
                        // ⭐️ hours 필드명 통일: 백엔드 DTO와 일치하도록 수정 ⭐️
                        hours: data.hours || '', 
                        
                        // Number 필드도 불러와서 설정
                        longitude: data.longitude || 0.0,
                        latitude: data.latitude || 0.0,
                    });

                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch detail:', err);
                    setError('여행지 데이터를 불러오는 데 실패했습니다.');
                    setLoading(false);
                });
        } else {
            // 새 등록 모드일 때 초기화
            setFormData(initialFormData);
        }
    }, [travelId]); // travelId만 의존성 배열에 유지

    // 2. 폼 제출 핸들러 (등록/수정 처리)
    const handleSubmit = async (e) => {
        e.preventDefault(); // 기본 폼 제출 방지
        setLoading(true);
        setError(null);

        // ⭐ 수동 유효성 검사 (필수 필드: title, contentsCd)
        if (!formData.title || !formData.contentsCd) {
            const msg = '제목과 카테고리 코드는 필수 입력 항목입니다.';
            setError(msg);
            message.error(msg);
            setLoading(false);
            return;
        }

        // ⭐️⭐️⭐️ 3. 전송 데이터에 categoryName 포함 (handleChange에서 이미 업데이트됨) ⭐️⭐️⭐️
        const dataToSend = {
            ...formData,
            travelId: isEditMode ? travelId : null,
            state: formData.state ? 1 : 0, // boolean을 숫자(1/0)로 변환
            
            // number 타입 필드가 null이거나 undefined일 경우 0.0으로 처리
            longitude: formData.longitude == null ? 0.0 : formData.longitude,
            latitude: formData.latitude == null ? 0.0 : formData.latitude,
            
            // hours 필드명 통일 (백엔드 DTO 기준: hours)
            hours: formData.hours || '', 
            
            // 기타 문자열 필드 방어 (모든 필드를 formData에서 직접 가져오므로 사실상 필요 없으나, 안전을 위해 유지)
            contentId: formData.contentId || '', 
            homepage: formData.homepage || '', 
            parking: formData.parking || '',
            fee: formData.fee || '',
        };

        try {
            await saveAdminTravel(dataToSend);
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
    
    return (
        <Card 
            title={isEditMode ? `여행지 수정: ${formData.title || travelId}` : '새 여행지 등록'}
            extra={
                <Button onClick={() => navigate('/adm/travel')} disabled={loading}>
                    목록으로
                </Button>
            }
            style={{ margin: '20px' }}
        >
            {error && <Alert message="오류" description={error} type="error" showIcon closable style={{ marginBottom: 20 }} />}
            
            {/* Ant Design Form 컴포넌트를 사용하지만, form={form} prop 없이 수동 바인딩 */}
            <Form
                layout="vertical"
                onSubmitCapture={handleSubmit} // 폼 제출 이벤트를 handleSubmit으로 연결
                disabled={loading} 
            >
                {/* 1. 기본 정보 */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="제목"
                            required
                            validateStatus={formData.title ? '' : 'error'} // 수동 검사 표시
                            help={!formData.title && '제목을 입력해주세요.'}
                        >
                            <Input 
                                style={inputStyle} 
                                name="title"
                                value={formData.title} 
                                onChange={handleInputChange} 
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="카테고리 코드 (contentsCd)"
                            required
                            validateStatus={formData.contentsCd ? '' : 'error'}
                            help={!formData.contentsCd && '카테고리 코드를 선택해주세요.'}
                        >
                            <Radio.Group 
                                options={categoryCodeOptions}
                                optionType="button" 
                                buttonStyle="solid" 
                                size="large"
                                name="contentsCd"
                                value={formData.contentsCd}
                                onChange={handleInputChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                
                {/* 2. 공개 상태 */}
                <Form.Item 
                    label="공개 상태"
                    help="(체크 시 공개 상태로 설정됩니다.)"
                >
                    <Checkbox
                        name="state"
                        checked={formData.state}
                        onChange={handleCheckboxChange}
                    >
                        공개 상태로 설정
                    </Checkbox>
                </Form.Item>

                {/* 3. 소개 */}
                <Form.Item label="소개">
                    <Input.TextArea 
                        rows={4} 
                        name="introduction"
                        value={formData.introduction}
                        onChange={handleInputChange}
                    />
                </Form.Item>

                {/* 3-1. 태그 필드 */}
                <Form.Item label="태그">
                    <Input 
                        style={inputStyle} 
                        name="tag"
                        value={formData.tag}
                        onChange={handleInputChange}
                    />
                </Form.Item>
                
                {/* 4. 상세 정보 */}
                <Card title="상세 정보" size="small" style={{ marginBottom: 20}}>
                    <Row gutter={16}>
                        {/* 4-1. 좌측 컬럼: 위치 및 좌표 정보 */}
                        <Col span={12}> 
                            {isEditMode && (
                                <Form.Item label="API 콘텐츠 ID">
                                    <Input 
                                        disabled={true} 
                                        style={inputStyle} 
                                        placeholder="API 연동 시 사용되며 수정 불가" 
                                        name="contentId"
                                        value={formData.contentId}
                                    />
                                </Form.Item>
                            )}
                            <Form.Item label="주소">
                                <Input style={inputStyle} name="address" value={formData.address} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="도로명 주소">
                                <Input style={inputStyle} name="roadAddress" value={formData.roadAddress} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="지역1(시/도)">
                                <Input style={inputStyle} name="region1Name" value={formData.region1Name} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="지역2(시/군/구)">
                                <Input style={inputStyle} name="region2Name" value={formData.region2Name} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="경도 (Longitude)">
                                <InputNumber 
                                    style={{ ...inputStyle, width: '100%' }} 
                                    step={0.000001}
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={(value) => handleNumberChange('longitude', value)}
                                />
                            </Form.Item>
                            <Form.Item label="위도 (Latitude)">
                                <InputNumber 
                                    style={{ ...inputStyle, width: '100%' }} 
                                    step={0.000001} 
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={(value) => handleNumberChange('latitude', value)}
                                />
                            </Form.Item> 
                            
                        </Col>
                        
                        {/* 4-2. 우측 컬럼: 상세/연락 및 이미지 정보 */}
                        <Col span={12}> 
                            <Form.Item label="전화번호">
                                <Input style={inputStyle} name="phoneNo" value={formData.phoneNo} onChange={handleInputChange} />
                            </Form.Item>
                            
                            <Form.Item label="홈페이지">
                                <Input style={inputStyle} placeholder="http:// 또는 https://" name="homepage" value={formData.homepage} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="주차 시설">
                                <Input style={inputStyle} placeholder="가능 / 불가능 / 상세 설명" name="parking" value={formData.parking} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="이용 요금">
                                <Input style={inputStyle} placeholder="무료 / 성인 5,000원 등" name="fee" value={formData.fee} onChange={handleInputChange} />
                            </Form.Item>
                            {/* hours 필드명 수정 (백엔드 DTO와 일치) */}
                            <Form.Item label="이용 시간"> 
                                <Input style={inputStyle} placeholder="09:00 ~ 18:00 (연중무휴)" name="hours" value={formData.hours} onChange={handleInputChange} />
                            </Form.Item>
                            
                            <Form.Item label="대표 이미지 경로">
                                <Input style={inputStyle} name="imagePath" value={formData.imagePath} onChange={handleInputChange} />
                            </Form.Item>
                            <Form.Item label="썸네일 경로">
                                <Input style={inputStyle} name="thumbnailPath" value={formData.thumbnailPath} onChange={handleInputChange} />
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
                        disabled={loading}
                    >
                        목록으로
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AdminTravelForm;