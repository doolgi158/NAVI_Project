import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { Card, List, Button, message } from "antd";
import api from "../../../common/api/naviApi";
import { useNavigate } from "react-router-dom";

const MyPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/travelplan/my");
        setPlans(res.data || []);
      } catch {
        message.error("여행 계획을 불러오지 못했습니다.");
      }
    })();
  }, []);

  return (
    <MainLayout>
      <div className="p-8 min-h-screen bg-white">
        <Card title="내 여행 계획 목록">
          <List
            bordered
            dataSource={plans}
            renderItem={(plan) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() =>
                      navigate("/travel/plan/step4", { state: { ...plan } })
                    }
                  >
                    수정
                  </Button>,
                ]}
              >
                <div>
                  <strong>{plan.title || "나의 여행"}</strong> <br />
                  {plan.startDate} ~ {plan.endDate} <br />
                  일정 수: {plan.days?.length || 0}
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default MyPlanPage;
