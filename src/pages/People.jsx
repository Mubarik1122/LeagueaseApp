import { Routes, Route } from "react-router-dom";
import { Users } from "lucide-react";

import ListUsers from "./people/ListUsers";
import Registrations from "./people/Registrations";
import DataProtection from "./people/DataProtection";
import MergePeople from "./people/MergePeople";
import ActiveDates from "./people/ActiveDates";
import Suspensions from "./people/Suspensions";
import AgeConflicts from "./people/AgeConflicts";
import SpreadsheetUpload from "./people/SpreadsheetUpload";
import TransferPlayers from "./people/TransferPlayers";
import TransferReport from "./people/TransferReport";
import PersonDownload from "./people/PersonDownload";
import PeopleWithoutRoles from "./people/PeopleWithoutRoles";

export default function People() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-white to-slate-50/80 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366]/10 to-[#00ADE5]/10">
              <Users className="h-6 w-6 text-[#003366]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Users
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage league users, roles and registrations
              </p>
            </div>
          </div>
        </div>
      </div>

      <Routes>
        <Route index element={<ListUsers />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="data-protection" element={<DataProtection />} />
        <Route path="merge-people" element={<MergePeople />} />
        <Route path="active-dates" element={<ActiveDates />} />
        <Route path="suspensions" element={<Suspensions />} />
        <Route path="age-conflicts" element={<AgeConflicts />} />
        <Route path="spreadsheet-upload" element={<SpreadsheetUpload />} />
        <Route path="transfer-players" element={<TransferPlayers />} />
        <Route path="transfer-report" element={<TransferReport />} />
        <Route path="person-download" element={<PersonDownload />} />
        <Route path="people-without-roles" element={<PeopleWithoutRoles />} />
      </Routes>
    </div>
  );
}
