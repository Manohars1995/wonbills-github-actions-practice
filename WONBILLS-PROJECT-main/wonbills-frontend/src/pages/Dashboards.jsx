import React, { useEffect, useState } from "react";
import Tile from "../components/UI-Components/Dashboards/Tile";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { MdOutlinePayments } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import SEO from "../components/SEO";

import PaymentsYearlyBarChart from "../components/UI-Components/Dashboards/PaymentsYearlyBarChart";
import PaymentStatusPieChart from "../components/UI-Components/Dashboards/PaymentStatusPieChart";
import ItemsByCategoryPieChart from "../components/UI-Components/Dashboards/ItemsByCategoryPieChart";
import ItemsActivityBarChart from "../components/UI-Components/Dashboards/ItemsActivityBarChart";

import DashboardSkeleton from "../components/UI-Elements/Loaders/DashboardSkeleton";
import { getUserChartsData } from "../services/dashboard/dashboard";
import useSkeletonLoader from "../hooks/useLoader";

const Dashboards = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { loading, startLoading, stopLoading } = useSkeletonLoader(600);

  const fetchData = async () => {
    startLoading();
    try {
      const res = await getUserChartsData();
      if (res?.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <DashboardSkeleton />
      </div>
    );
  }

  const {
    paymentData,
    paymentStatusData,
    itemsByCategory,
    itemsActivityData,
    summary
  } = dashboardData;

  return (
    <>
      <SEO
        title="Dashboard"
        noIndex={true}
      />
      <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white p-2 sm:p-4 gap-4">

        {/* ================= TILES ================= */}
        <div
          className="
          grid gap-3 shrink-0
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
        >
          <Tile
            title="Total Requested"
            amount={summary?.requested?.amount}
            tax={summary?.requested?.tax}
            styles="bg-[#A89BFF] text-[#4318FF]"
            bg="bg-[#F4F2FF]"
            border="border-[#D9D3FF]"
            text="text-[#5B4BFF]"
          >
            <MdOutlinePayments />
          </Tile>

          <Tile
            title="Total Received"
            amount={summary?.received?.amount}
            tax={summary?.received?.tax}
            styles="bg-[#D6EFB0] text-[#6EC207]"
            bg="bg-[#F4FBEA]"
            border="border-[#DFF2C2]"
            text="text-[#5E9E14]"
          >
            <FaMoneyBillTransfer />
          </Tile>

          <Tile
            title="Pending"
            amount={summary?.pending?.amount}
            tax={summary?.pending?.tax}
            styles="bg-red-100 text-red-500"
            bg="bg-red-50"
            border="border-red-200"
            text="text-red-600"
          >
            <BsFillPatchQuestionFill />
          </Tile>
        </div>

        {/* ================= CHARTS ================= */}
        {/* This is the ONLY scrollable region */}
        <div className="flex-1 min-h-0 overflow-y-auto slot-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 auto-rows-fr pr-1">

            <div className="bg-white rounded-xl h-[320px] sm:h-[360px] md:h-[380px] overflow-hidden">
              <PaymentsYearlyBarChart data={paymentData} />
            </div>

            <div className="bg-white rounded-xl h-[320px] sm:h-[360px] md:h-[380px] overflow-hidden">
              <PaymentStatusPieChart data={paymentStatusData} />
            </div>

            <div className="bg-white rounded-xl h-[320px] sm:h-[360px] md:h-[380px] overflow-hidden">
              <ItemsByCategoryPieChart data={itemsByCategory} />
            </div>

            <div className="bg-white rounded-xl h-[320px] sm:h-[360px] md:h-[380px] overflow-hidden">
              <ItemsActivityBarChart data={itemsActivityData} />
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboards;
