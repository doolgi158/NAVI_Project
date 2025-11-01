import React from "react";
import { Modal, Button } from "antd";
import FilterPanel from "@/common/components/travel/FilterPanel";
import { useTravelListFilter } from "@/common/hooks/useTravelListFilter";

export default function TravelFilterModal({ open, onClose, onApply }) {
    const {
        regionTags,
        selectedRegions,
        isRegionPanelOpen,
        toggleRegionPanel,
        handleRegionSelect,
        handleSelectAllRegions,
        handleDeselectAllRegions,
        filterQuery,
    } = useTravelListFilter();

    const [activeCategory, setActiveCategory] = React.useState("전체");

    const handleApply = () => {
        onApply({
            category: activeCategory,
            regionQuery: filterQuery, // { region2Name: ['애월','성산'] }
        });
        onClose();
    };

    return (
        <Modal
            title="여행지 필터 설정"
            open={open}
            onCancel={onClose}
            width={700}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    취소
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    className="bg-[#0A3D91] border-none"
                    onClick={handleApply}
                >
                    적용
                </Button>,
            ]}
        >
            <FilterPanel
                regionTags={regionTags}
                selectedRegions={selectedRegions}
                isRegionPanelOpen={true} // 항상 열림
                handleRegionSelect={handleRegionSelect}
                handleSelectAllRegions={handleSelectAllRegions}
                handleDeselectAllRegions={handleDeselectAllRegions}
                categories={["전체", "관광지", "음식점", "쇼핑"]}
                activeCategory={activeCategory}
                handleCategoryChange={setActiveCategory}
            />
        </Modal>
    );
}
