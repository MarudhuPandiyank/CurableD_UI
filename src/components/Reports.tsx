import React, { useState, useEffect, useRef } from "react";  // ⬅ add useRef
import { Calendar } from "primereact/calendar";
import {
  MultiSelect,
  MultiSelectChangeEvent,
  MultiSelectFilterEvent,
} from "primereact/multiselect";
import axios from "axios";
import Header1 from "./Header1";
import config from "../config";
import "./HomePage.css";

interface ClinicOption {
  campId: number;
  campIdPrefix: string;
  campName: string;
}

const Reports: React.FC = () => {
  const [campOptions, setCampOptions] = useState<ClinicOption[]>([]);
  const [selectedCamps, setSelectedCamps] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [downloadBy, setDownloadBy] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");


  const token = localStorage.getItem("token");
const didFetch = useRef(false);
  // Fetch active camps
  const fetchCamps = async (searchInput: string = "") => {
    try {
      const userId = localStorage.getItem("userId");
      const roleId = localStorage.getItem("roleId");
      const hospitalId = localStorage.getItem("hospitalId");
      setLoading(true);

      const response = await axios.post<ClinicOption[]>(
        `${config.appURL}/curable/activecamp`,
        {
          search: searchInput,
          userId: Number(userId),
          roleId: Number(roleId),
          hospitalId: Number(hospitalId),
          stage: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCampOptions(response.data);
    } catch (error) {
      console.error("Error fetching camps:", error);
      alert("Failed to fetch camps. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!didFetch.current) {
      fetchCamps();
      didFetch.current = true;
    }
  }, []);

  const handleFilter = (searchTerm: string) => fetchCamps(searchTerm);

const formatDate = (date: Date | null) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`; // yyyy-MM-dd in local time
};

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();

    if ( !startDate || !endDate || !downloadBy) {
        setErrorMsg("Please fill all fields before downloading.");
    return;
      return;
    }

    if (startDate > endDate) {
      setErrorMsg("Start date cannot be after end date.");
    return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const roleId = localStorage.getItem("roleId");
      const hospitalId = localStorage.getItem("hospitalId");
 // ✅ if no camp selected, take all campIds from campOptions
    const idsToSend =
      selectedCamps.length > 0
        ? selectedCamps
        : campOptions.map((camp) => camp.campId);
      const response = await axios.post(
        `${config.appURL}/curable/camps-report`,
        {
          ids: idsToSend,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          reportType: downloadBy,
          userId: Number(userId),
          roleId: Number(roleId),
          hospitalId: Number(hospitalId),
        },
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.data || (response.data as Blob).size === 0) {
        alert("No data available for selected filters.");
        return;
      }

      const blob = new Blob([response.data as Blob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${downloadBy}Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  return (
    <div className="container2">
      <form className="clinic-form" onSubmit={handleDownload}>
        <Header1 />
        <h1 style={{ color: "darkblue" }}>Reports</h1>


<label className="report-label">
  Start Date<span className="report-required">*</span>:
  <div className="input-with-icon">
    <Calendar
      value={startDate}
      onChange={(e) => setStartDate(e.value as Date | null)}
      placeholder="Select Start Date"
      dateFormat="dd/mm/yy"
      maxDate={endDate || undefined}
    />
    <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
  </div>
</label>

<label className="report-label">
  End Date<span className="report-required">*</span>:
  <div className="input-with-icon">
    <Calendar
      value={endDate}
      onChange={(e) => setEndDate(e.value as Date | null)}
      placeholder="Select End Date"
      dateFormat="dd/mm/yy"
      minDate={startDate || undefined}
    />
    <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
  </div>
</label>

<label className="report-label">
  Report Type<span className="report-required">*</span>:
  <select
    value={downloadBy}
    onChange={(e) => setDownloadBy(e.target.value)}
  >
    <option value="">Select</option>
    <option value="OUTREACH_CLINIC">Outreach Clinic</option>
    <option value="PATIENT_REGISTRATION">Patient Registration</option>
    <option value="SCREENING">Screening</option>
  </select>
</label>

<label className="report-label">
  Outreach Clinic Name:
  <div className="input-with-icon">
    <MultiSelect
      value={selectedCamps}
      options={campOptions}
      onChange={(e: MultiSelectChangeEvent) =>
        setSelectedCamps(e.value as number[])
      }
      optionLabel="campName"
      optionValue="campId"
      filter
      filterBy="campName"
      onFilter={(e: MultiSelectFilterEvent) => handleFilter(e.filter)}
      placeholder={loading ? "Loading camps..." : "Select Camps"}
      className="multi-select-dropdown"
    />
  </div>
</label>

{errorMsg && (
  <center>
    <p className="submit-button1" style={{ backgroundColor: "transparent", color: "red", border: "none", boxShadow: "none", cursor: "default" }}>
      {errorMsg}
    </p>
  </center>
)}

<center>
  <button type="submit" className="submit-button1">
    Download
  </button>
  <br/><br/>  <br/><br/>

</center>
      </form>

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default Reports;
