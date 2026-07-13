import AppHeader from "@/components/common/AppHeader/AppHeader";

import HeroSectionSkeleton from "./HeroSectionSkeleton";
import OverviewSectionSkeleton from "./OverviewSectionSkeleton";
import CastSectionSkeleton from "./CastSectionSkeleton";
import SeasonsSectionSkeleton from "./SeasonsSectionSkeleton";
import SidebarSkeleton from "./SidebarSkeleton";

import styles from "@/pages/ServiePage.module.css";

interface ServiePageSkeletonProps {
    childType: string;
    title?: string;
    posterPath?: string;
}

const ServiePageSkeleton = ({ childType, title, posterPath }: ServiePageSkeletonProps) => {
    return (
        <div className={styles.serviePageWrapper}>

            {/* Background */}
            <div className={styles.fullPageBackdrop}>
                <div className="skeletonShimmer" style={{ width: "100%", height: "100%" }} />
                <div className={styles.backdropOverlay} />
            </div>

            <div className={styles.pageContent}>
                <AppHeader />

                <div className="container">
                    <div className={styles.contentGrid}>

                        {/* Left */}
                        <div className={styles.mainContent}>

                            <HeroSectionSkeleton
                                title={title}
                                posterPath={posterPath}
                            />

                            <OverviewSectionSkeleton />

                            <CastSectionSkeleton childType={childType} />

                            {childType === "tv" && (
                                <SeasonsSectionSkeleton />
                            )}

                        </div>

                        {/* Right */}
                        <SidebarSkeleton />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiePageSkeleton;