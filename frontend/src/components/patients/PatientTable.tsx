import type { Patient } from "@/app/lib/patient-data";

interface PatientTableProps {
  patients: Patient[];
}

function PatientTypeBadge({
  type,
}: {
  type: Patient["patientType"];
}) {
  const styles: Record<string, string> = {
    Outpatient: "bg-info-soft text-info",
    Inpatient: "bg-primary-soft text-primary",
    Emergency: "bg-warning-soft text-warning",
  };

  return (
    <span
      className={`inline-flex rounded-badge px-2.5 py-1 text-caption font-medium ${
        styles[type] ?? "bg-surface-muted text-muted"
      }`}
    >
      {type}
    </span>
  );
}

export default function PatientTable({
  patients,
}: PatientTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left">
          <thead className="bg-surface-muted">
            <tr className="h-table-head text-caption font-medium text-muted">
              <th className="px-5">Hospital number</th>
              <th className="px-4">Patient name</th>
              <th className="px-4">Date of birth / Sex</th>
              <th className="px-4">Patient type</th>
              <th className="px-4">Clinic / Ward</th>
              <th className="px-4">Registered</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="h-table-row border-b border-line text-body last:border-0 hover:bg-page/60"
              >
                <td className="whitespace-nowrap px-5 font-medium text-primary">
                  {patient.hospitalNumber}
                </td>

                <td className="whitespace-nowrap px-4 font-medium text-ink">
                  {patient.firstName} {patient.lastName}
                </td>

                <td className="whitespace-nowrap px-4 text-muted">
                  {patient.dateOfBirth} / {patient.sexAtBirth}
                </td>

                <td className="whitespace-nowrap px-4">
                  <PatientTypeBadge type={patient.patientType} />
                </td>

                <td className="whitespace-nowrap px-4 text-muted">
                  {patient.clinicOrWard}
                </td>

                <td className="whitespace-nowrap px-4 text-muted">
                  {patient.registrationDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile patient cards */}
      <div className="divide-y divide-line lg:hidden">
        {patients.map((patient) => (
          <article key={patient.id} className="space-y-3 px-4 py-4">
            <div>
              <div>
                <p className="font-medium text-ink">
                  {patient.firstName} {patient.lastName}
                </p>

                <p className="mt-1 text-caption text-primary">
                  {patient.hospitalNumber}
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-caption">
              <div>
                <p className="text-muted">Date of birth / Sex</p>
                <p className="mt-1 text-ink">
                  {patient.dateOfBirth} / {patient.sexAtBirth}
                </p>
              </div>

              <div>
                <p className="text-muted">Patient type</p>
                <div className="mt-1">
                  <PatientTypeBadge type={patient.patientType} />
                </div>
              </div>

              <div>
                <p className="text-muted">Clinic / Ward</p>
                <p className="mt-1 text-ink">{patient.clinicOrWard}</p>
              </div>

              <div>
                <p className="text-muted">Registered</p>
                <p className="mt-1 text-ink">
                  {patient.registrationDate}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}