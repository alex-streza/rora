import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { userPositionAtom } from '~/app/_components/map/user-position';

export const useSpaceData = () => {
  const [kpi, setKpi] = useState(0);
  const [cloudCoverage, setCloudCoverage] = useState<number>();
  const [solarWindSpeed, setSolarWindSpeed] = useState(0);
  const [loading, setLoading] = useState({
    kpi: true,
    cloudCoverage: true,
    solarWindSpeed: true,
  });
  const position = useAtomValue(userPositionAtom);

  useEffect(() => {
    const fetchKpIndex = async () => {
      setLoading((prev) => ({ ...prev, kpi: true }));
      try {
        const response = await fetch(
          "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
        );
        const data = await response.json();
        const latestData = data[data.length - 1];
        const latestKpIndex = parseFloat(latestData[1]);
        setKpi(latestKpIndex);
      } catch (err) {
        console.error("Error fetching Kp index:", err);
      }
      setLoading((prev) => ({ ...prev, kpi: false }));
    };

    fetchKpIndex();
  }, []);

  useEffect(() => {
    const fetchCloudCoverage = async () => {
      if (!position || cloudCoverage) return;

      setLoading((prev) => ({ ...prev, cloudCoverage: true }));

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current=cloud_cover&hourly=cloud_cover&forecast_days=1`
        );
        const data = await response.json();
        const currentCloudCoverage = data.current.cloud_cover;
        setCloudCoverage(currentCloudCoverage);
      } catch (err) {
        console.error("Error fetching cloud coverage:", err);
      }
      setLoading((prev) => ({ ...prev, cloudCoverage: false }));
    };

    if (position) {
      fetchCloudCoverage();
    }
  }, [position]);

  useEffect(() => {
    const fetchSolarWindSpeed = async () => {
      setLoading((prev) => ({ ...prev, solarWindSpeed: true }));
      try {
        const response = await fetch(
          "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json"
        );
        const data = await response.json();
        const latestData = data[data.length - 1];
        const latestSolarWindSpeed = parseFloat(latestData[2]);
        setSolarWindSpeed(latestSolarWindSpeed);
      } catch (err) {
        console.error("Error fetching solar wind speed:", err);
      }
      setLoading((prev) => ({ ...prev, solarWindSpeed: false }));
    };

    fetchSolarWindSpeed();
  }, []);

  return { kpi, cloudCoverage, solarWindSpeed, loading };
};
