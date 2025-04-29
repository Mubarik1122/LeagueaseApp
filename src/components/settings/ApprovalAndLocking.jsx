import React, { useState } from "react";

const ApprovalAndLocking = () => {
  const [lockMatchStats, setLockMatchStats] = useState(false);
  const [approvalOption, setApprovalOption] = useState("manualApproveAutoLock");
  const [enableLiveResults, setEnableLiveResults] = useState(false);

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">
        Approval and Locking
      </h2>

      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="text-red-500 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            When a result is reported (scoreline and statistics) leagues have
            control over whether the result appears automatically, or has to be
            approved first, and whether the scoreline and statistics can be
            locked, preventing team administrators from further updating them.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Locking Match Statistics
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={lockMatchStats}
              onChange={(e) => setLockMatchStats(e.target.checked)}
            />
            <span className="text-gray-700">
              Allow match statistics to be locked - locking prevents further
              updating by Team Administrators.
            </span>
          </label>
        </div>
      </div>

      <hr className="my-6" />

      <div className="mb-4">
        <h3 className="text-gray-600 font-medium mb-4">
          Approval and Locking Scorelines (Match Statistics may be locked
          separately)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Options:
        </div>
        <div className="md:col-span-3 space-y-2">
          <label className="flex items-start">
            <input
              type="radio"
              name="approvalOption"
              value="manualApproveAutoLock"
              className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={approvalOption === "manualApproveAutoLock"}
              onChange={() => setApprovalOption("manualApproveAutoLock")}
            />
            <span className="text-gray-700">
              Manually approve scores, which also auto-locks scores
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="approvalOption"
              value="manualApproveSeparateLock"
              className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={approvalOption === "manualApproveSeparateLock"}
              onChange={() => setApprovalOption("manualApproveSeparateLock")}
            />
            <span className="text-gray-700">
              Manually approve scores, scores are locked separately
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="approvalOption"
              value="autoApproveNoLock"
              className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={approvalOption === "autoApproveNoLock"}
              onChange={() => setApprovalOption("autoApproveNoLock")}
            />
            <span className="text-gray-700">
              Auto-approve scores for immediate publishing / scores cannot be
              locked
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="approvalOption"
              value="autoApproveCanLock"
              className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={approvalOption === "autoApproveCanLock"}
              onChange={() => setApprovalOption("autoApproveCanLock")}
            />
            <span className="text-gray-700">
              Auto-approve scores for immediate publishing / scores can be
              locked
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Live Results
        </div>
        <div className="md:col-span-3">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
                checked={enableLiveResults}
                onChange={(e) => setEnableLiveResults(e.target.checked)}
              />
              <span className="text-gray-700">Enable Live Results</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-6">
              Display live results on your site
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          className="px-4 py-2 bg-[#00ADE5] text-white rounded hover:bg-[#009acb] transition"
          type="button"
        >
          Update
        </button>
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          type="button"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ApprovalAndLocking;
