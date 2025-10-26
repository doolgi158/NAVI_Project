import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
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
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  RollbackOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import RefundModal from "../../../common/components/payment/RefundModal";

const { Text } = Typography;

const AdminPaymentListPage = () => {
  const { rsvType, filter, keyword } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [detailsCache, setDetailsCache] = useState({});
  const [refundModal, setRefundModal] = useState({
    open: false,
    merchantId: null,
    details: [],
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /* === 색상 맵 정의 === */
  const statusColorMap = {
    READY: "default",
    PAID: "green",
    FAILED: "volcano",
    CANCELLED: "magenta",
    REFUNDED: "red",
    PARTIAL_REFUNDED: "orange",
  };

  const rsvTypeColorMap = {
    ACC: "geekblue",
    FLY: "cyan",
    DLV: "purple",
  };

  /* === 데이터 조회 === */
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_SERVER_HOST}/api/adm/payment/list`, {
        params: {
          rsvType: rsvType !== "ALL" ? rsvType : null,
          paymentStatus: filter !== "ALL" ? filter : null,
          keyword: keyword || null,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data || [];
      setPayments(list);
      setPagination((prev) => ({ ...prev, total: list.length }));
    } catch {
      message.error("결제 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [rsvType, filter, keyword]);

  const fetchPaymentDetails = async (merchantId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${API_SERVER_HOST}/api/adm/payment/details/${merchantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetailsCache((prev) => ({ ...prev, [merchantId]: res.data || [] }));
    } catch {
      message.error("결제 상세를 불러오지 못했습니다.");
    }
  };

  /* === 전체 환불 === */
  const handleFullRefund = (merchantId, rsvType) => {
    Modal.confirm({
      title: "전체 환불 확인",
      content: "정말 전체 환불을 진행하시겠습니까?",
      okText: "예, 환불합니다",
      cancelText: "취소",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          const token = localStorage.getItem("accessToken");

          const refundRequest = {
            merchantId,
            rsvType,
            reason: `[관리자 전체 환불] ${rsvType}`,
          };

          await axios.post(
            `${API_SERVER_HOST}/api/adm/payment/refund/master`,
            refundRequest,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          message.success("전체 환불이 완료되었습니다.");
          fetchPaymentDetails(merchantId);
          setExpandedRowKeys([merchantId]);
        } catch (err) {
          console.error(err);
          message.error("환불 처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const handleExpand = async (record) => {
    const isExpanded = expandedRowKeys.includes(record.merchantId);
    if (isExpanded) setExpandedRowKeys([]);
    else {
      await fetchPaymentDetails(record.merchantId);
      setExpandedRowKeys([record.merchantId]);
    }
  };

  /* === 컬럼 === */
  const columns = [
    { title: "결제번호", dataIndex: "merchantId", align: "center", width: 200, fixed: "left" },
    {
      title: "유형",
      dataIndex: "rsvType",
      align: "center",
      width: 90,
      render: (type) => (
        <Tag color={rsvTypeColorMap[type]}>
          {type === "ACC" ? "숙소" : type === "FLY" ? "항공" : "짐배송"}
        </Tag>
      ),
    },
    {
      title: "상태",
      dataIndex: "paymentStatus",
      align: "center",
      width: 100,
      render: (s) => {
        const labelMap = {
          READY: "결제준비",
          PAID: "결제완료",
          FAILED: "결제실패",
          CANCELLED: "결제취소",
          REFUNDED: "환불완료",
          PARTIAL_REFUNDED: "부분환불",
        };
        return <Tag color={statusColorMap[s]}>{labelMap[s] || s}</Tag>;
      },
    },
    { title: "수단", dataIndex: "paymentMethod", align: "center", width: 120 },
    {
      title: "총 결제금액",
      dataIndex: "totalAmount",
      align: "center",
      width: 120,
      render: (v) => `₩${v?.toLocaleString()}`,
    },
    {
      title: "총 환불금액",
      dataIndex: "totalFeeAmount",
      align: "center",
      width: 120,
      render: (v) =>
        v && v > 0 ? <Text type="danger">₩{v.toLocaleString()}</Text> : "-",
    },
    {
      title: "사유",
      dataIndex: "reason",
      align: "center",
      width: 200,
      render: (v) => (v ? <Text type="secondary">{v}</Text> : "-"),
    },
    {
      title: "생성일",
      dataIndex: "createdAt",
      align: "center",
      width: 160,
      render: (v) => (v ? dayjs(v).format("YYYY.MM.DD HH:mm") : "-"),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      align: "center",
      width: 160,
      render: (v) => (v ? dayjs(v).format("YYYY.MM.DD HH:mm") : "-"),
    },
    {
      title: "관리",
      key: "actions",
      align: "center",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="상세 보기">
          <Button
            icon={<SearchOutlined />}
            style={{ backgroundColor: "#FFF4C2", borderColor: "#F8E473" }}
            onClick={() => handleExpand(record)}
          >상세보기</Button>
        </Tooltip>
      ),
    },
  ];

  /* === 상세 테이블 컬럼 === */
  const detailColumns = [
    { title: "예약 ID", dataIndex: "reserveId", align: "center", width: 140 },
    {
      title: "결제 금액",
      dataIndex: "amount",
      align: "center",
      width: 120,
      render: (v) => `₩${v?.toLocaleString()}`,
    },
    {
      title: "수수료",
      dataIndex: "feeAmount",
      align: "center",
      width: 120,
      render: (v) => (v ? `₩${v.toLocaleString()}` : "-"),
    },
    {
      title: "상태",
      dataIndex: "paymentStatus",
      align: "center",
      width: 100,
      render: (s) => {
        const labelMap = {
          PAID: "결제완료",
          REFUNDED: "환불완료",
          FAILED: "실패",
        };
        return <Tag color={statusColorMap[s]}>{labelMap[s] || s}</Tag>;
      },
    },
    {
      title: "사유",
      dataIndex: "reason",
      align: "center",
      width: 200,
      render: (v) => (v ? <Text type="secondary">{v}</Text> : "-"),
    },
    {
      title: "생성일",
      dataIndex: "createdAt",
      align: "center",
      width: 160,
      render: (v) => (v ? dayjs(v).format("YYYY.MM.DD HH:mm") : "-"),
    },
    {
      title: "수정일",
      dataIndex: "updatedAt",
      align: "center",
      width: 160,
      render: (v) => (v ? dayjs(v).format("YYYY.MM.DD HH:mm") : "-"),
    },
  ];

  return (
    <div style={{ paddingTop: 8 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
        title="결제 내역"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchPayments}>
            새로고침
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={payments}
          rowKey={(r) => r.merchantId}
          loading={loading}
          bordered
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page, size) =>
              setPagination({ ...pagination, current: page, pageSize: size }),
            showTotal: (total) => `총 ${total.toLocaleString()}건`,
          }}
          scroll={{ x: 1300 }}
          expandable={{
            showExpandColumn: false,
            expandedRowKeys,
            onExpand: (expanded, record) => handleExpand(record),
            expandedRowRender: (record) => {
              const details = detailsCache[record.merchantId] || [];
              return (
                <div
                  style={{
                    background: "white",         // 🔹 바깥 배경을 흰색으로
                    borderRadius: 16,
                    padding: 16,
                    margin: "10px 12px 14px",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      background: "#f9f9f9",     // 🔹 내부 영역은 연회색
                      borderRadius: 12,
                      padding: "16px 16px 8px",
                    }}
                  >
                    <Table
                      columns={detailColumns}
                      dataSource={details}
                      rowKey={(r) => r.reserveId}
                      pagination={false}
                      size="small"
                      bordered={false}
                      style={{
                        background: "#f9f9f9",    // 테이블도 내부 색에 맞춤
                      }}
                    />

                    {/* ✅ 버튼 영역 */}
                    <Row justify="end" style={{ marginTop: 14, marginRight: 8 }}>
                      <Space>
                        <Button icon={<EyeOutlined />}>예약 내역</Button>
                        <Button
                          danger
                          type="primary"
                          icon={<RollbackOutlined />}
                          onClick={() =>
                            handleFullRefund(record.merchantId, record.rsvType)
                          }
                        >
                          전체 환불
                        </Button>
                      </Space>
                    </Row>
                  </div>
                </div>
              );
            },
          }}
        />
      </Card>

      <RefundModal
        open={refundModal.open}
        merchantId={refundModal.merchantId}
        details={refundModal.details}
        onClose={() =>
          setRefundModal({ open: false, merchantId: null, details: [] })
        }
        onSuccess={() =>
          fetchPaymentDetails(refundModal.merchantId).then(() =>
            setRefundModal({ open: false, merchantId: null, details: [] })
          )
        }
      />
    </div>
  );
};

export default AdminPaymentListPage;
