import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Button,
  Tooltip,
  Modal,
} from "antd";
import {
  SearchOutlined,
  RollbackOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axios from "axios";
import RefundModal from "../../../common/components/payment/RefundModal";

const { Text } = Typography;
const API_SERVER_HOST = "http://localhost:8080";

const AdminPaymentListPage = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [detailsCache, setDetailsCache] = useState({});
  const [refundModal, setRefundModal] = useState({ open: false, merchantId: null, details: [] });

  /** ✅ 전체 결제 목록 조회 */
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_SERVER_HOST}/api/adm/payment/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data || []);
    } catch (err) {
      console.error("❌ 결제 목록 불러오기 실패:", err);
      message.error("결제 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 상세 조회 */
  const fetchPaymentDetails = async (merchantId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${API_SERVER_HOST}/api/adm/payment/details/${merchantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetailsCache((prev) => ({
        ...prev,
        [merchantId]: res.data || [],
      }));
    } catch (err) {
      console.error("❌ 상세 불러오기 실패:", err);
      message.error("결제 상세를 불러오지 못했습니다.");
    }
  };

  /** ✅ 전체 환불 요청 */
  const handleFullRefund = (merchantId) => {
    Modal.confirm({
      title: "전체 환불 확인",
      content: "정말 전체 환불을 진행하시겠습니까?",
      okText: "예, 환불합니다",
      cancelText: "취소",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.post(
            `${API_SERVER_HOST}/api/adm/payment/refund/detail`,
            null,
            {
              params: { merchantId, reason: "관리자 전체 환불" },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          message.success("전체 환불이 완료되었습니다.");
          fetchPaymentDetails(merchantId);
        } catch (err) {
          console.error("❌ 전체 환불 실패:", err);
          message.error("환불 처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  /** ✅ 상단 마스터 테이블 컬럼 */
  const columns = [
    {
      title: "결제번호",
      dataIndex: "merchantId",
      render: (id) => <Text strong>{id}</Text>,
    },
    {
      title: "유형",
      dataIndex: "rsvType",
      render: (type) => (
        <Tag
          color={
            type === "ACC" ? "blue" : type === "FLY" ? "cyan" : "green"
          }
        >
          {type === "ACC" ? "숙소" : type === "FLY" ? "항공" : "짐배송"}
        </Tag>
      ),
    },
    {
      title: "총 금액",
      dataIndex: "totalAmount",
      align: "right",
      render: (v) => `₩${v?.toLocaleString()}`,
    },
    {
      title: "상태",
      dataIndex: "paymentStatus",
      render: (s) => {
        const color =
          s === "PAID"
            ? "green"
            : s === "REFUNDED"
            ? "red"
            : s === "FAILED"
            ? "volcano"
            : "default";
        const text =
          s === "PAID"
            ? "결제완료"
            : s === "REFUNDED"
            ? "환불완료"
            : s === "FAILED"
            ? "결제실패"
            : "대기중";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "관리",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Tooltip title="상세 보기">
          <Button
            icon={<SearchOutlined />}
            style={{
              backgroundColor: "#FFF4C2", // 버터 옐로우
              borderColor: "#F8E473",
            }}
            onClick={() => handleExpand(record)}
          />
        </Tooltip>
      ),
    },
  ];

  /** ✅ 상세 테이블 + 하단 환불 버튼 */
  const expandedRowRender = (record) => {
    const details = detailsCache[record.merchantId] || [];

    return (
      <>
        <Table
          columns={[
            {
              title: "예약 ID",
              dataIndex: "reserveId",
              render: (id) => <Text code>{id}</Text>,
            },
            {
              title: "금액",
              dataIndex: "amount",
              align: "right",
              render: (v) => `₩${v?.toLocaleString()}`,
            },
            {
              title: "상태",
              dataIndex: "paymentStatus",
              render: (s) => {
                const color =
                  s === "PAID"
                    ? "green"
                    : s === "REFUNDED"
                    ? "red"
                    : "default";
                return (
                  <Tag color={color}>
                    {s === "PAID"
                      ? "결제완료"
                      : s === "REFUNDED"
                      ? "환불완료"
                      : s}
                  </Tag>
                );
              },
            },
          ]}
          dataSource={details}
          rowKey={(r) => r.reserveId}
          pagination={false}
          size="small"
        />

        {/* 하단 버튼 */}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Space>
            <Button
              danger
              type="primary"
              icon={<RollbackOutlined />}
              onClick={() => handleFullRefund(record.merchantId)}
            >
              전체 환불
            </Button>
            <Button
              icon={<RollbackOutlined />}
              style={{
                backgroundColor: "#FFF4C2",
                borderColor: "#F8E473",
              }}
              onClick={() =>
                setRefundModal({
                  open: true,
                  merchantId: record.merchantId,
                  details,
                })
              }
            >
              부분 환불
            </Button>
          </Space>
        </div>
      </>
    );
  };

  /** ✅ 확장 토글 */
  const handleExpand = async (record) => {
    const isExpanded = expandedRowKeys.includes(record.merchantId);
    if (isExpanded) setExpandedRowKeys([]);
    else {
      await fetchPaymentDetails(record.merchantId);
      setExpandedRowKeys([record.merchantId]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          columns={columns}
          dataSource={payments}
          rowKey={(r) => r.merchantId}
          loading={loading}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => handleExpand(record),
          }}
        />
      </Card>

      {/* 부분 환불 모달 */}
      <RefundModal
        open={refundModal.open}
        merchantId={refundModal.merchantId}
        details={refundModal.details}
        onClose={() => setRefundModal({ open: false, merchantId: null, details: [] })}
        onSuccess={() =>
          fetchPaymentDetails(refundModal.merchantId).then(() =>
            setRefundModal({ open: false, merchantId: null, details: [] })
          )
        }
      />
    </>
  );
};

export default AdminPaymentListPage;
