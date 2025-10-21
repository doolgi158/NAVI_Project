import { Layout, Typography, Input, Button, Table, Space, Modal, Form, InputNumber, Switch, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setRoomSearchState } from "@/common/slice/roomSlice";

const { Title } = Typography;
const { Content } = Layout;

const RoomAdminPage = () => {
    const dispatch = useDispatch();
    const savedState = useSelector((state) => state.room);

    const [searchName, setSearchName] = useState(savedState.searchName || "");
    const [selectedAccNo, setSelectedAccNo] = useState(savedState.selectedAccNo);
    const [expandedRowKeys, setExpandedRowKeys] = useState(savedState.expandedRowKeys);
    const [accommodations, setAccommodations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // 페이지 복귀 시 자동 복원
    useEffect(() => {
        if (savedState.selectedAccNo) {
            fetchRooms(savedState.selectedAccNo);
        }
    }, []);

    // 숙소 검색
    const fetchAccommodations = async () => {
        if (!searchName.trim()) return message.warning("숙소 이름을 입력해주세요.");
        setLoading(true);
        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations/search`, {
                params: { name: searchName },
            });
            console.log("🏨 API 응답 데이터:", res.data);
            if (res.data.status === 200 && res.data.data) {
                setAccommodations(res.data.data);
                message.success(`${res.data.data.length}개의 숙소를 찾았습니다.`);
            } else {
                message.error("숙소를 찾을 수 없습니다.");
            }
        } catch {
            message.error("숙소 검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 숙소 선택 → 객실 목록
    const fetchRooms = async (accNo) => {
        if (!accNo) return;
        setSelectedAccNo(accNo);
        setLoading(true);
        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/adm/rooms/byAcc/${accNo}`);
            if (res.data.status === 200 && res.data.data) {
                setRooms(res.data.data);
            } else {
                message.error("객실을 불러오지 못했습니다.");
            }
        } catch {
            message.error("객실 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 객실 추가
    const handleAddRoom = () => {
        if (!selectedAccNo) {
            message.warning("객실을 추가할 숙소를 먼저 선택해주세요.");
            return;
        }

        dispatch(setRoomSearchState({
            searchName,
            selectedAccNo,
            expandedRowKeys
        }));

        navigate(`/adm/rooms/new/${selectedAccNo}`);
    };

    // 객실 수정
    const handleEditRoom = (room) => {
        dispatch(setRoomSearchState({
            searchName,
            selectedAccNo,
            expandedRowKeys
        }));

        console.log("searchName: ", searchName);
        console.log("selectedAccNo: ", selectedAccNo);
        console.log("expandedRowKeys: ", expandedRowKeys);

        navigate(`/adm/rooms/edit/${room.roomNo}`);
    };

    // 객실 삭제
    const handleDeleteRoom = async (roomNo) => {
        Modal.confirm({
            title: "객실 삭제",
            content: "정말 삭제하시겠습니까?",
            okType: "danger",
            onOk: async () => {
                try {
                    await axios.delete(`${API_SERVER_HOST}/api/adm/rooms/${roomNo}`);
                    message.success("삭제되었습니다.");
                    fetchRooms(selectedAccNo);
                } catch {
                    message.error("삭제 중 오류가 발생했습니다.");
                }
            },
        });
    };

    const handleSubmit = async () => {
        const values = form.getFieldsValue();

        // 선택된 숙소가 없을 경우 방어 코드
        if (!selectedAccNo) {
            message.warning("객실을 추가할 숙소를 먼저 선택해주세요.");
            return;
        }

        // 백엔드에서 Long 타입으로 받기 때문에 숫자 형태로 변환
        values.accNo = Number(selectedAccNo);

        console.log("🧾 전송 payload:", values);

        try {
            if (editingRoom) {
                await axios.put(`${API_SERVER_HOST}/api/adm/rooms/edit/${editingRoom.roomNo}`, values);
                message.success("수정 완료");
            } else {
                await axios.post(`${API_SERVER_HOST}/api/adm/rooms/new`, values);
                message.success("등록 완료");
            }
            setIsModalOpen(false);
            fetchRooms(selectedAccNo);
        } catch {
            message.error("저장 실패");
        }
    };

    // 페이지 이동 전 상태 저장
    useEffect(() => {
        dispatch(setRoomSearchState({
            searchName,
            selectedAccNo,
            expandedRowKeys
        }));
    }, [searchName, selectedAccNo, expandedRowKeys]);

    // 숙소 테이블 컬럼
    const accColumns = [
        { title: "숙소명", dataIndex: "title" },
        { title: "숙소 유형", dataIndex: "category" },
        { title: "주소", dataIndex: "address" },
        { title: "전화번호", dataIndex: "tel" },
    ];

    // 객실 테이블 컬럼
    const roomColumns = [
        { title: "객실명", dataIndex: "roomName" },
        { title: "면적", dataIndex: "roomSize" },
        { title: "기준 인원", dataIndex: "baseCnt" },
        { title: "최대 인원", dataIndex: "maxCnt" },
        { title: "평일 요금", dataIndex: "weekdayFee" },
        { title: "주말 요금", dataIndex: "weekendFee" },
        { title: "Wi-Fi", dataIndex: "hasWifi", render: (v) => (v ? "O" : "X") },
        {
            title: "관리",
            render: (_, r) => (
                <Space>
                    <Button onClick={() => handleEditRoom(r)}>수정</Button>
                    <Button danger onClick={() => handleDeleteRoom(r.roomNo)}>삭제</Button>
                </Space>
            ),
        },
    ];

    // 행 클릭 이벤트
    const handleRowClick = (record) => {
        const accKey = record.accNo;
        console.log(record);
        if (!accKey) return;

        if (expandedRowKeys.includes(accKey)) {
            // 이미 열려 있으면 닫기
            setExpandedRowKeys([]);
            setSelectedAccNo(null);
        } else {
            // 새 행 열기
            setExpandedRowKeys([accKey]);
            fetchRooms(accKey);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AdminSiderLayout />
            <Layout className="bg-gray-50">
                <Content className="p-6">
                    <Title level={3}>객실 관리</Title>

                    <Space className="mb-4">
                        <Input
                            placeholder="숙소 이름 입력"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button type="primary" onClick={fetchAccommodations}>
                            검색
                        </Button>
                    </Space>

                    <Table
                        columns={accColumns}
                        dataSource={accommodations}
                        rowKey={(r) => r.accNo || r.accId}
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                        expandable={{
                            expandedRowRender: (record) =>
                                selectedAccNo === (record.accNo || record.accId) && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between mb-3">
                                            <h3 className="font-semibold">객실 목록</h3>
                                            <Button type="primary" onClick={handleAddRoom}>
                                                객실 추가
                                            </Button>
                                        </div>
                                        <Table
                                            columns={roomColumns}
                                            dataSource={rooms}
                                            rowKey="roomNo"
                                            pagination={false}
                                            size="small"
                                            bordered
                                        />
                                    </div>
                                ),
                            expandIcon: () => null,
                            expandedRowKeys,
                            onExpand: (expanded, record) => handleRowClick(record),
                        }}
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                            style: { cursor: "pointer" },
                        })}
                    />

                    {/* 객실 등록/수정 모달 */}
                    <Modal
                        open={isModalOpen}
                        title={editingRoom ? "객실 수정" : "객실 등록"}
                        okText="저장"
                        cancelText="취소"
                        onOk={handleSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item label="객실명" name="roomName" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="면적" name="roomSize">
                                <InputNumber style={{ width: "100%" }} />
                            </Form.Item>
                            <Form.Item label="기준 인원" name="baseCnt">
                                <InputNumber min={1} />
                            </Form.Item>
                            <Form.Item label="최대 인원" name="maxCnt">
                                <InputNumber min={1} />
                            </Form.Item>
                            <Form.Item label="평일 요금" name="weekdayFee">
                                <InputNumber min={0} />
                            </Form.Item>
                            <Form.Item label="주말 요금" name="weekendFee">
                                <InputNumber min={0} />
                            </Form.Item>
                            <Form.Item label="Wi-Fi" name="hasWifi" valuePropName="checked">
                                <Switch checkedChildren="있음" unCheckedChildren="없음" />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
};

export default RoomAdminPage;