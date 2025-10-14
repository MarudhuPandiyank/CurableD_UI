import React, { useState, useEffect, useRef } from "react";
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

  // Our synthetic "Select All" option
  const selectAllOption: ClinicOption = {
    campId: -1,
    campIdPrefix: "ALL",
    campName: "Select All",
  };

  // --- API: Fetch camps (with optional search) ---
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

      setCampOptions(response.data || []);
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

  // --- Utils ---
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`; // yyyy-MM-dd in local time
  };

  const isAllSelected = (vals: number[], options: ClinicOption[]) =>
    vals.filter((v) => v !== -1).length === options.length &&
    options.length > 0;

  // Keep the "Select All" tick in sync if options list changes after selection
  useEffect(() => {
    setSelectedCamps((prev) => {
      const withoutAll = prev.filter((v) => v !== -1);
      if (isAllSelected(withoutAll, campOptions)) {
        return [-1, ...withoutAll];
      }
      return withoutAll;
    });
  }, [campOptions]);

  // --- MultiSelect change handler (with Select All tick logic) ---
  const handleCampChange = (e: MultiSelectChangeEvent) => {
    let values = (e.value as number[]) ?? [];

    // If user clicked our "Select All" (-1), toggle everything
    if (values.includes(selectAllOption.campId)) {
      if (isAllSelected(selectedCamps, campOptions)) {
        // Was all-selected → clear
        setSelectedCamps([]);
      } else {
        // Select all real options + include -1 so the row shows checked
        setSelectedCamps([-1, ...campOptions.map((c) => c.campId)]);
      }
      return;
    }

    // Normal option clicked
    values = values.filter((v) => v !== -1);

    if (isAllSelected(values, campOptions)) {
      setSelectedCamps([-1, ...values]); // add -1 to show the tick
    } else {
      setSelectedCamps(values); // ensure -1 is absent
    }
  };

  // --- Download ---
  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !downloadBy) {
      setErrorMsg("Please fill all fields before downloading.");
      return;
    }

    if (startDate > endDate) {
      setErrorMsg("Start date cannot be after end date.");
      return;
    }

    setErrorMsg("");

    try {
      const userId = localStorage.getItem("userId");
      const roleId = localStorage.getItem("roleId");
      const hospitalId = localStorage.getItem("hospitalId");

      // If none chosen, send all campIds; otherwise drop -1 marker
      const idsToSend =
        selectedCamps.length > 0
          ? selectedCamps.filter((id) => id !== -1)
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
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const currentDate = new Date().toISOString().split("T")[0];

      link.href = url;
      link.setAttribute("download", `${downloadBy}_Report_${currentDate}.csv`);
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
            <img
              src="./assets/Calendar.png"
              className="clinic-id-icon"
              alt="calendar icon"
            />
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
            <img
              src="./assets/Calendar.png"
              className="clinic-id-icon"
              alt="calendar icon"
            />
          </div>
        </label>

        <label className="report-label">
          Report Type<span className="report-required">*</span>:
          <select
            value={downloadBy}
            onChange={(e) => setDownloadBy(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Outreachclinic">Outreach Clinic</option>
            <option value="Patientregistration">Patient Registration</option>
            <option value="Screening">Screening</option>
            <option value="Clinical_Evaluation">Clinical Evaluation</option>
            <option value="SavedPatient">Saved Patient</option>
          </select>
        </label>

        {/* MultiSelect with custom "Select All" row */}
        <label className="report-label">
          Outreach Clinic Name:
          <div className="input-with-icon">
            <MultiSelect
              value={selectedCamps}
              options={[selectAllOption, ...campOptions]}
              onChange={handleCampChange}
              optionLabel="campName"
              optionValue="campId"
              filter
              filterBy="campName"
              onFilter={(e: MultiSelectFilterEvent) => handleFilter(e.filter)}
              placeholder={loading ? "Loading camps..." : "Select Camps"}
              className="multi-select-dropdown"
              showSelectAll={false}      // hide built-in checkbox
              resetFilterOnHide={true}   // clear search when dropdown closes
            />
          </div>
        </label>

        {errorMsg && (
          <center>
            <p
              className="submit-button1"
              style={{
                backgroundColor: "transparent",
                color: "red",
                border: "none",
                boxShadow: "none",
                cursor: "default",
              }}
            >
              {errorMsg}
            </p>
          </center>
        )}

        <center>
          <button type="submit" className="submit-button1">
            Download
          </button>
          <br />
          <br /> <br />
          <br />
        </center>
      </form>

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img
            src="/assets/Curable logo - rectangle with black text.png"
            alt="Curable Logo"
            className="footer-logo"
          />
        </div>
      </footer>
    </div>
  );
};

export default Reports;
