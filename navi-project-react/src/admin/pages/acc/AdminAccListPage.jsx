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

const AdminAccListPage = () => {
  const { type, filter, keyword } = useOutletContext();
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

  /* === 숙소 목록 조회 === */
  const fetchList = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const sourceType = type === "SELF" ? 0 : type === "API" ? 1 : null;

      const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations`, {
        params: { keyword, sourceType, activeFilter: filter, page, size },
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
      console.error("❌ 숙소 데이터 로드 실패:", err);
      message.error("숙소 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, filter, keyword]);

  /* === 숙소 삭제 === */
  const handleDelete = (accNo, title) => {
    Modal.confirm({
      title: "숙소 삭제 확인",
      content: (
        <span>
          정말 <strong style={{ color: "#cf1322" }}>“{title}”</strong> 숙소를 삭제하시겠습니까?
        </span>
      ),
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");

          await axios.delete(`${API_SERVER_HOST}/api/adm/accommodations/${accNo}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          message.success("✅ 숙소가 삭제되었습니다.");
          fetchList(pagination.current, pagination.pageSize);
        } catch (err) {
          console.error("삭제 실패:", err);

          // ✅ 서버에서 전달한 메시지 출력
          if (err.response && err.response.data && err.response.data.message) {
            message.error(err.response.data.message);
          } else {
            message.error("❌ 숙소 삭제 중 오류가 발생했습니다.");
          }
        }
      },
    });
  };



  /* === 숙소 상세 보기 === */
  const handleShowDetail = async (record) => {
    setDetailData(record);
    setDetailVisible(true);

    try {
      const res = await axios.get(`${API_SERVER_HOST}/api/images`, {
        params: { targetType: "ACC", targetId: record.accId },
      });
      setImages(res.data?.data || []);
    } catch (err) {
      console.error("이미지 조회 실패:", err);
      message.error("이미지 정보를 불러오지 못했습니다.");
      setImages([]);
    }
  };

  /* === 이미지 보기 모달 === */
  const handleShowImages = async (accId) => {
    try {
      const res = await axios.get(`${API_SERVER_HOST}/api/images`, {
        params: { targetType: "ACC", targetId: accId },
      });
      const imgs = res.data?.data || [];
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

  const columns = [
    { title: "번호", dataIndex: "accNo", align: "center", width: 80, fixed: "left" },
    { title: "숙소 ID", dataIndex: "accId", align: "center", width: 120 },
    { title: "숙소명", dataIndex: "title", align: "center", width: 180 },
    { title: "주소", dataIndex: "address", align: "left", width: 250, ellipsis: true },
    { title: "전화번호", dataIndex: "tel", align: "center", width: 130 },
    {
      title: "운영",
      dataIndex: "active",
      align: "center",
      width: 100,
      render: (v) =>
        v ? <Tag color="blue">운영중</Tag> : <Tag color="default">중단</Tag>,
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
            onClick={() => navigate(`/adm/accommodations/edit/${record.accNo}`)}
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.accNo, record.title)}
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
              {type === "API" ? "TourAPI 숙소 목록" : "자체 등록 숙소 목록"}
            </Title>
          </Space>
        }
        extra={
          <Space>
            {type === "SELF" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/adm/accommodations/new")}
              >
                숙소 등록
              </Button>
            )}
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
            rowKey="accNo"
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
              showTotal: (t) => `총 ${t.toLocaleString()} 개 숙소`,
            }}
          />
        )}
      </Card>

      {/* 상세보기 모달 */}
      <Modal
        title="숙소 상세 정보"
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
              <Descriptions.Item label="숙소명">{detailData.title}</Descriptions.Item>
              <Descriptions.Item label="유형">{detailData.category}</Descriptions.Item>
              <Descriptions.Item label="주소" span={2}>
                {detailData.address}
              </Descriptions.Item>
              <Descriptions.Item label="위도">{detailData.mapy}</Descriptions.Item>
              <Descriptions.Item label="경도">{detailData.mapx}</Descriptions.Item>
              <Descriptions.Item label="체크인">{detailData.checkInTime}</Descriptions.Item>
              <Descriptions.Item label="체크아웃">{detailData.checkOutTime}</Descriptions.Item>
              <Descriptions.Item label="취사 가능">
                {detailData.hasCooking ? "가능" : "불가"}
              </Descriptions.Item>
              <Descriptions.Item label="주차 가능">
                {detailData.hasParking ? "가능" : "불가"}
              </Descriptions.Item>
              <Descriptions.Item label="운영 여부">
                {detailData.active ? "운영중" : "중단"}
              </Descriptions.Item>
              <Descriptions.Item label="전화번호">{detailData.tel}</Descriptions.Item>
              <Descriptions.Item label="숙소 설명" span={2}>
                {detailData.overview || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* ✅ 이미지 보기 버튼 */}
            <div className="text-right">
              <Button
                icon={<PictureOutlined />}
                type="default"
                disabled={!images.length}
                onClick={() => handleShowImages(detailData.accId)}
              >
                이미지 보기
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* 이미지 모달 */}
      <Modal
        title="숙소 이미지"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        {images.length > 0 ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 380,
              overflow: "hidden",
            }}
          >
            <Carousel
              ref={carouselRef}
              dots
              autoplay={false}
              style={{ height: "100%" }}
            >
              {images.map((img, idx) => (
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
                    src={`${API_SERVER_HOST}${img.path}`}
                    alt={`이미지 ${idx + 1}`}
                    preview={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                </div>
              ))}
            </Carousel>

            {/* 🔹 좌우 이동 버튼 */}
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
                zIndex: 10, // ✅ 버튼이 이미지 위로
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

export default AdminAccListPage;
