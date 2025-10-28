import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Tag,
  Modal,
  Descriptions,
  Image,
  Carousel,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PictureOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import axios from "axios";

const { Title } = Typography;

const AdminRoomListPage = () => {
  const { keyword } = useOutletContext(); // 검색값
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [detailData, setDetailData] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();
  const carouselRef = useRef(null);

  /* === 객실 목록 조회 === */
  const fetchList = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${API_SERVER_HOST}/api/adm/rooms`, {
        params: { keyword, page, size },
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = res?.data?.data || {};
      setRows(result.data || []);
      setPagination({
        current: page,
        pageSize: size,
        total: result.total || 0,
      });
    } catch (err) {
      console.error("❌ 객실 데이터 로드 실패:", err);
      message.error("객실 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  /* === 객실 삭제 === */
  const handleDelete = (roomNo, roomName) => {
    Modal.confirm({
      title: "객실 삭제 확인",
      content: (
        <span>
          정말 <strong style={{ color: "#cf1322" }}>“{roomName}”</strong> 객실을 삭제하시겠습니까?
        </span>
      ),
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`${API_SERVER_HOST}/api/adm/rooms/${roomNo}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("✅ 객실이 삭제되었습니다.");
          fetchList(pagination.current, pagination.pageSize);
        } catch (err) {
          console.error("삭제 실패:", err);
          message.error("❌ 객실 삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  /* === 객실 상세 보기 === */
  const handleShowDetail = async (record) => {
    setDetailData(record);
    setDetailVisible(true);

    try {
      const res = await axios.get(`${API_SERVER_HOST}/api/images`, {
        params: { targetType: "ROOM", targetId: record.roomId },
      });
      setImages(res.data?.data || []);
    } catch (err) {
      console.error("이미지 조회 실패:", err);
      setImages([]);
    }
  };

  /* === 이미지 보기 === */
  const handleShowImages = async (roomId, mainImage) => {
    try {
      const res = await axios.get(`${API_SERVER_HOST}/api/images`, {
        params: { targetType: "ROOM", targetId: roomId },
      });
      let imgs = res.data?.data || [];

      if (imgs.length === 0 && mainImage) {
        imgs = [{ path: mainImage }];
      }

      if (imgs.length === 0) {
        message.info("이미지가 없습니다.");
        return;
      }

      setImages(imgs);
      setImageModalVisible(true);
    } catch (err) {
      console.error("이미지 조회 실패:", err);
      message.error("이미지를 불러오지 못했습니다.");
    }
  };

  /* ✅ 모달 열릴 때 Carousel 초기화 */
  useEffect(() => {
    if (imageModalVisible && carouselRef.current) {
      setTimeout(() => carouselRef.current.goTo(0), 150);
    }
  }, [imageModalVisible]);

  const columns = [
    { title: "번호", dataIndex: "roomNo", align: "center", width: 80, fixed: "left" },
    { title: "객실 ID", dataIndex: "roomId", align: "center", width: 120 },
    { title: "객실명", dataIndex: "roomName", align: "center", width: 180 },
    { title: "숙소명", dataIndex: "accTitle", align: "center", width: 200 },
    { title: "기준 인원", dataIndex: "baseCnt", align: "center", width: 100 },
    { title: "최대 인원", dataIndex: "maxCnt", align: "center", width: 100 },
    { title: "평일 요금", dataIndex: "weekdayFee", align: "center", width: 120 },
    { title: "주말 요금", dataIndex: "weekendFee", align: "center", width: 120 },
    {
      title: "Wi-Fi",
      dataIndex: "hasWifi",
      align: "center",
      width: 100,
      render: (v) => (v ? <Tag color="blue">있음</Tag> : <Tag color="default">없음</Tag>),
    },
    {
      title: "관리",
      align: "center",
      width: 240,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleShowDetail(record)}>
            상세보기
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/adm/rooms/edit/${record.roomNo}`)}
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.roomNo, record.roomName)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ paddingTop: 8 }}>
      <Card
        style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        title={
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>
              객실 목록
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/adm/rooms/new")}
            >
              객실 등록
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
              새로고침
            </Button>
          </Space>
        }
      >
        {loading ? (
          <Spin tip="데이터 불러오는 중..." style={{ display: "block", marginTop: 50 }} />
        ) : (
          <Table
            rowKey="roomNo"
            columns={columns}
            dataSource={rows}
            bordered
            scroll={{ x: 1500 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              onChange: (p, s) => fetchList(p, s),
              onShowSizeChange: (p, s) => fetchList(p, s),
              showTotal: (t) => `총 ${t.toLocaleString()} 개 객실`,
            }}
          />
        )}
      </Card>

      {/* 상세보기 모달 */}
      <Modal
        title="객실 상세 정보"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {detailData && (
          <>
            <Descriptions
              bordered
              column={2}
              size="middle"
              labelStyle={{
                width: "170px",
                fontWeight: "600",
                backgroundColor: "#fafafa",
              }}
              style={{ tableLayout: "auto", marginBottom: 16 }}
            >
              <Descriptions.Item label="객실명">{detailData.roomName}</Descriptions.Item>
              <Descriptions.Item label="숙소명">{detailData.accTitle}</Descriptions.Item>
              <Descriptions.Item label="면적">{detailData.roomSize}㎡</Descriptions.Item>
              <Descriptions.Item label="Wi-Fi">
                {detailData.hasWifi ? "있음" : "없음"}
              </Descriptions.Item>
              <Descriptions.Item label="기준 인원">
                {detailData.baseCnt}명
              </Descriptions.Item>
              <Descriptions.Item label="최대 인원">
                {detailData.maxCnt}명
              </Descriptions.Item>
              <Descriptions.Item label="평일 요금">
                {detailData.weekdayFee?.toLocaleString()}원
              </Descriptions.Item>
              <Descriptions.Item label="주말 요금">
                {detailData.weekendFee?.toLocaleString()}원
              </Descriptions.Item>
              <Descriptions.Item label="등록일">
                {detailData.createdAt || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="수정일">
                {detailData.updatedAt || "-"}
              </Descriptions.Item>
            </Descriptions>

            <div className="text-right">
              <Button
                icon={<PictureOutlined />}
                type="default"
                onClick={() =>
                  handleShowImages(detailData.roomId, detailData.mainImage)
                }
              >
                이미지 보기
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* 이미지 모달 */}
      <Modal
        title="객실 이미지"
        open={imageModalVisible}
        onCancel={() => {
          setImageModalVisible(false);
          setTimeout(() => setImages([]), 300);
        }}
        footer={null}
        width={600}
        centered
      >
        {images.length > 0 ? (
          <div style={{ position: "relative", width: "100%", height: 380, overflow: "hidden" }}>
            <Carousel ref={carouselRef} dots autoplay={false} style={{ height: "100%" }}>
              {images.map((img, idx) => {
                const src = `${API_SERVER_HOST}${img.path}`;
                return (
                  <div
                    key={idx}
                    style={{
                      height: 360,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f8f8f8",
                      borderRadius: 10,
                    }}
                  >
                    <Image
                      src={src}
                      alt={`이미지 ${idx + 1}`}
                      crossOrigin="anonymous"
                      preview={false}
                      onError={(e) =>
                        console.error("❌ 이미지 로드 실패:", e.target.src)
                      }
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: 10,
                      }}
                    />
                  </div>
                );
              })}
            </Carousel>

            {/* 좌우 이동 버튼 */}
            <Button
              type="text"
              shape="circle"
              icon={<LeftOutlined />}
              onClick={() => carouselRef.current.prev()}
              style={{
                position: "absolute",
                top: "50%",
                left: 10,
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.8)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            />
            <Button
              type="text"
              shape="circle"
              icon={<RightOutlined />}
              onClick={() => carouselRef.current.next()}
              style={{
                position: "absolute",
                top: "50%",
                right: 10,
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.8)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">이미지가 없습니다.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminRoomListPage;
