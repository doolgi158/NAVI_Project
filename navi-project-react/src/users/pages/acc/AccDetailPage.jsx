import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useParams } from 'react-router-dom';
=======
import { useParams, useNavigate } from 'react-router-dom';
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
import MainLayout from '../../layout/MainLayout';
import { Button } from 'antd'; 

const AccDetailPage = () => {
    const { accNo } = useParams(); 
<<<<<<< HEAD
=======
    const navigate = useNavigate(); 
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accNo) {
            const fetchDetail = async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                    const result = { 
                        accNo, 
                        name: `숙소 번호 ${accNo}의 상세 이름`, 
                        description: '제주 시내 중심가에 위치한 모던하고 아늑한 호텔입니다. 깨끗하고 넓은 객실에서 편안한 휴식을 즐기실 수 있으며, 주변 관광지와 맛집 접근성이 뛰어납니다.', 
                        price: 200000,
                        rooms: [
                            { id: 101, type: '스탠다드 더블 (2인 기준)', price: 150000, max: 2, image: 'https://images.unsplash.com/photo-1596701042732-e42100806140?fit=crop&w=400&q=80' },
                            { id: 102, type: '디럭스 트윈 (4인 기준)', price: 200000, max: 4, image: 'https://images.unsplash.com/photo-1542314831-2895690b2061?fit=crop&w=400&q=80' },
                            { id: 103, type: '스위트 룸 (4인 기준)', price: 350000, max: 4, image: 'https://images.unsplash.com/photo-1540541338287-c1518f7a77e5?fit=crop&w=400&q=80' },
                        ]
                    };
<<<<<<< HEAD
                    
=======
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                    setAccommodation(result);
                } catch (error) {
                    console.error("숙소 상세 정보 로딩 오류:", error);
                } finally {
                    setLoading(false);
                }
            };
<<<<<<< HEAD

=======
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
            fetchDetail();
        }
    }, [accNo]);

<<<<<<< HEAD
=======
    // ✅ navigate 수정 — rooms 세그먼트 제거
    const handleReserve = (room) => {
        navigate(`/accommodations/${accNo}/${room.id}/reserve`, {
            state: { room },
        });
    };

>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
    if (loading) {
        return <MainLayout><div className="text-center p-20">Loading...</div></MainLayout>;
    }

    if (!accommodation) {
        return <MainLayout><div className="text-center p-20 text-red-500">숙소를 찾을 수 없습니다.</div></MainLayout>;
    }
    
    return (
        <MainLayout>
            <div className="min-h-screen bg-[#fffde8] flex flex-col items-center pt-10 px-4">
<<<<<<< HEAD
                
                <div className="w-full max-w-7xl mb-10"> 
                    
=======
                <div className="w-full max-w-7xl mb-10"> 
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                    <div className="bg-white shadow-md rounded-2xl p-8">
                        <h1 className="text-4xl font-extrabold mb-8 text-gray-800">
                            {accommodation.name} 
                            <span className="text-xl font-normal text-gray-500 ml-3">
                                (No. {accommodation.accNo})
                            </span>
                        </h1>
<<<<<<< HEAD
                        
                        {/* ⭐ 사진 공간: h-96 -> h-72로 변경 */}
=======

>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="h-72 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                사진 갤러리 1
                            </div>
                            <div className="h-72 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                사진 갤러리 2
                            </div>
                        </div>
<<<<<<< HEAD
                        
=======

>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                        <div className="p-6 mb-8 border-b border-gray-200">
                            <h2 className="text-2xl font-bold mb-3 text-gray-700">숙소 소개</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {accommodation.description}
                            </p>
                        </div>
<<<<<<< HEAD
                        
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">객실 정보 및 예약</h2>
                        
=======

                        <h2 className="text-2xl font-bold mb-4 text-gray-700">객실 정보 및 예약</h2>

>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                        <div className="space-y-4">
                            {accommodation.rooms.map((room) => (
                                <div 
                                    key={room.id}
                                    className="flex border bg-white shadow-sm rounded-xl overflow-hidden"
                                >
                                    <div className="w-40 h-32 flex-shrink-0">
                                        <img 
                                            alt={room.type} 
                                            src={room.image} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    
                                    <div className="flex-grow p-4 flex items-center">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1 text-gray-800">{room.type}</h3>
                                            <p className="text-sm text-gray-500">최대 인원 {room.max}명 | 객실 번호: {room.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-shrink-0 w-48 flex flex-col justify-center items-center p-4 bg-gray-50 border-l">
                                        <p className="text-sm text-gray-600">1박 요금</p>
                                        <p className="text-2xl font-extrabold text-blue-600 mb-2">
                                            {room.price.toLocaleString()}원
                                        </p>
<<<<<<< HEAD
                                        <Button type="primary" size="large">
=======
                                        <Button 
                                            type="primary" 
                                            size="large"
                                            onClick={() => handleReserve(room)}
                                        >
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                                            예약하기
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
<<<<<<< HEAD

                    </div>
                    
=======
                    </div>
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
                </div>
            </div>
        </MainLayout>
    );
};

<<<<<<< HEAD
export default AccDetailPage;
=======
export default AccDetailPage;
>>>>>>> 72d6a045916dd3028cf790a94dbb3c6b1a2b5036
