import React from "react";
import { List, Button, Empty } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";

export default function TravelSelectDrawer({
  travels,
  title,
  dateRange,
  selectedTravels,
  setSelectedTravels,
}) {
  return (
    <div className="flex h-full w-full">
      {/* 왼쪽: 여행지 리스트 */}
      <div className="w-1/2 bg-[#FDFCF9] border-r border-gray-200 flex flex-col">
        <TitleDateDisplay title={title} dateRange={dateRange} />
        <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg pl-4">
          📍 여행지 선택
        </h3>

        <div className="flex-1 overflow-y-auto custom-scroll pb-4 pr-4 pl-4">
          <List
            dataSource={travels}
            renderItem={(item) => (
              <List.Item
                onClick={() =>
                  setSelectedTravels((prev) =>
                    prev.some((v) => v.id === item.id)
                      ? prev.filter((v) => v.id !== item.id)
                      : [...prev, item]
                  )
                }
                className="cursor-pointer"
              >
                <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-[#2F3E46] mb-0">{item.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{item.desc}</p>
                      <div className="flex items-center text-xs text-gray-400 gap-1">
                        <i className="bi bi-heart-fill text-red-500"></i>
                        <span>{item.likes}</span>
                      </div>
                    </div>
                  </div>
                  {selectedTravels.some((v) => v.id === item.id) ? (
                    <i className="bi bi-dash-square-fill text-red-500 text-xl"></i>
                  ) : (
                    <i className="bi bi-plus-square-fill text-blue-500 text-xl"></i>
                  )}
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* 오른쪽: 선택 요약 */}
      <div className="w-1/2 bg-[#FFFFFF] p-5 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#2F3E46]">📍 여행지 일정 요약</h3>
            <p className="text-sm text-gray-500 mt-1">
              총 {selectedTravels.length}개의 여행지
            </p>
          </div>
          <Button
            type="link"
            className="text-red-500 hover:text-red-600 font-semibold"
            onClick={() => setSelectedTravels([])}
          >
            설정 초기화
          </Button>
        </div>

        <p className="text-gray-500 text-sm mb-6 border-b pb-4">
          여행지는 최소 1개 이상 선택해야 합니다.
        </p>

        <div className="flex-1 overflow-y-auto custom-scroll pb-4 pr-4 mt-4">
          <List
            dataSource={selectedTravels}
            locale={{
              emptyText: <Empty description="선택된 여행지가 없습니다." />,
            }}
            renderItem={(item) => (
              <List.Item>
                <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm hover:bg-[#F9FAF9] transition">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-[#2F3E46] mb-0">{item.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{item.desc}</p>
                    </div>
                  </div>
                  <i
                    className="bi bi-dash-square-fill text-red-500 text-xl cursor-pointer"
                    onClick={() =>
                      setSelectedTravels((prev) => prev.filter((v) => v.id !== item.id))
                    }
                  ></i>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
}
