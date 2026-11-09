"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { apiRequest, apiRequestAll } from "@/app/lib/api";
import { PlusIcon } from "@/components/ui/icons";

interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

interface CatalogueTest {
  id: number;
  name: string;
  code: string;
  description: string | null;
  department_id: number;
  sample_type: string;
  is_active: boolean;
}

type CatalogueTab = "departments" | "tests";

interface DepartmentForm {
  name: string;
  code: string;
  description: string;
}

interface TestForm {
  name: string;
  code: string;
  description: string;
  department_id: string;
  sample_type: string;
}

const EMPTY_DEPARTMENT_FORM: DepartmentForm = {
  name: "",
  code: "",
  description: "",
};

const EMPTY_TEST_FORM: TestForm = {
  name: "",
  code: "",
  description: "",
  department_id: "",
  sample_type: "",
};

const fieldClassName =
  "h-field w-full rounded-control border border-line bg-surface px-3 text-body text-ink outline-none transition-colors focus:border-primary";
const labelClassName = "mb-1.5 block text-label font-medium text-ink";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-badge px-2.5 py-1 text-caption font-medium ${
        active
          ? "bg-primary-soft text-primary"
          : "bg-surface-muted text-muted"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function CatalogueSetup() {
  const [activeTab, setActiveTab] = useState<CatalogueTab>("departments");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tests, setTests] = useState<CatalogueTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departmentForm, setDepartmentForm] =
    useState<DepartmentForm>(EMPTY_DEPARTMENT_FORM);
  const [testForm, setTestForm] = useState<TestForm>(EMPTY_TEST_FORM);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(
    null,
  );
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCatalogue() {
      try {
        setLoading(true);
        setLoadError("");
        const [departmentData, testData] = await Promise.all([
          apiRequest("/departments/") as Promise<Department[]>,
          apiRequestAll<CatalogueTest>("/tests/?active_only=false"),
        ]);
        if (active) {
          setDepartments(departmentData);
          setTests(testData);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            getErrorMessage(error, "Unable to load laboratory setup data."),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCatalogue();
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const filteredTests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tests.filter((test) => {
      const departmentName =
        departments.find((department) => department.id === test.department_id)
          ?.name ?? "";
      const matchesDepartment =
        !departmentFilter ||
        test.department_id === Number(departmentFilter);
      const matchesSearch =
        !term ||
        [test.name, test.code, test.sample_type, departmentName].some((value) =>
          value.toLowerCase().includes(term),
        );
      return matchesDepartment && matchesSearch;
    });
  }, [tests, departments, departmentFilter, search]);

  function clearMessages() {
    setFormError("");
    setOperationError("");
    setSuccessMessage("");
  }

  function cancelDepartmentForm() {
    setShowDepartmentForm(false);
    setEditingDepartmentId(null);
    setDepartmentForm(EMPTY_DEPARTMENT_FORM);
    setFormError("");
  }

  function cancelTestForm() {
    setShowTestForm(false);
    setEditingTestId(null);
    setTestForm(EMPTY_TEST_FORM);
    setFormError("");
  }

  function startDepartmentEdit(department: Department) {
    clearMessages();
    setDepartmentForm({
      name: department.name,
      code: department.code,
      description: department.description ?? "",
    });
    setEditingDepartmentId(department.id);
    setShowDepartmentForm(true);
  }

  function startTestEdit(test: CatalogueTest) {
    clearMessages();
    setTestForm({
      name: test.name,
      code: test.code,
      description: test.description ?? "",
      department_id: String(test.department_id),
      sample_type: test.sample_type,
    });
    setEditingTestId(test.id);
    setShowTestForm(true);
  }

  async function saveDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    if (!departmentForm.name.trim() || !departmentForm.code.trim()) {
      setFormError("Department name and code are required.");
      return;
    }

    const payload = {
      name: departmentForm.name.trim(),
      code: departmentForm.code.trim(),
      description: departmentForm.description.trim() || null,
    };

    try {
      setSaving(true);
      await apiRequest(
        editingDepartmentId === null
          ? "/departments/"
          : `/departments/${editingDepartmentId}`,
        {
          method: editingDepartmentId === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      cancelDepartmentForm();
      setSuccessMessage(
        editingDepartmentId === null
          ? "Department added."
          : "Department updated.",
      );
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save the department."));
    } finally {
      setSaving(false);
    }
  }

  async function saveTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    if (
      !testForm.name.trim() ||
      !testForm.code.trim() ||
      !testForm.department_id ||
      !testForm.sample_type.trim()
    ) {
      setFormError(
        "Test name, code, department, and sample type are required.",
      );
      return;
    }

    const payload = {
      name: testForm.name.trim(),
      code: testForm.code.trim(),
      description: testForm.description.trim() || null,
      department_id: Number(testForm.department_id),
      sample_type: testForm.sample_type.trim(),
    };

    try {
      setSaving(true);
      await apiRequest(
        editingTestId === null ? "/tests/" : `/tests/${editingTestId}`,
        {
          method: editingTestId === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      cancelTestForm();
      setSuccessMessage(
        editingTestId === null ? "Test added." : "Test updated.",
      );
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save the test."));
    } finally {
      setSaving(false);
    }
  }

  async function updateDepartmentStatus(department: Department) {
    clearMessages();
    setSaving(true);
    try {
      await apiRequest(`/departments/${department.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !department.is_active }),
      });
      setSuccessMessage(
        `${department.name} ${department.is_active ? "deactivated" : "activated"}.`,
      );
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setOperationError(
        getErrorMessage(error, "Unable to update department status."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateTestStatus(test: CatalogueTest) {
    clearMessages();
    setSaving(true);
    try {
      await apiRequest(`/tests/${test.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !test.is_active }),
      });
      setSuccessMessage(
        `${test.name} ${test.is_active ? "deactivated" : "activated"}.`,
      );
      setLoadAttempt((attempt) => attempt + 1);
    } catch (error) {
      setOperationError(getErrorMessage(error, "Unable to update test status."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-micro font-medium uppercase tracking-wider text-muted">
            Laboratory / Settings
          </p>
          <h1 className="text-title font-semibold tracking-tight text-ink">
            Laboratory setup
          </h1>
          <p className="mt-2 text-body text-muted">
            Manage departments and the laboratory test catalogue.
          </p>
        </div>
        <p className="text-caption text-muted">
          Changes are saved to the LabTrack backend.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Laboratory setup sections"
        className="flex gap-2 border-b border-line"
      >
        {(
          [
            ["departments", "Departments"],
            ["tests", "Test catalogue"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            id={`${tab}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            onClick={() => {
              setActiveTab(tab);
              clearMessages();
              setSearch("");
              setDepartmentFilter("");
            }}
            className={`-mb-px border-b-2 px-4 py-3 text-label font-medium transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(successMessage || operationError) && (
        <div
          role={operationError ? "alert" : "status"}
          className={`rounded-control border px-4 py-3 text-body ${
            operationError
              ? "border-danger/30 bg-danger-soft text-danger"
              : "border-primary/20 bg-primary-soft text-primary"
          }`}
        >
          {operationError || successMessage}
        </div>
      )}

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-danger/30 bg-danger-soft px-4 py-3">
          <p role="alert" className="text-body text-danger">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="text-label font-medium text-danger underline"
          >
            Retry
          </button>
        </div>
      )}

      {activeTab === "departments" ? (
        <section
          id="departments-panel"
          role="tabpanel"
          aria-labelledby="departments-tab"
          className="space-y-4"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-body font-semibold text-ink">
                Laboratory departments
              </h2>
              <p className="mt-1 text-caption text-muted">
                {departments.length} departments configured
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                clearMessages();
                setDepartmentForm(EMPTY_DEPARTMENT_FORM);
                setEditingDepartmentId(null);
                setShowDepartmentForm(true);
              }}
              className="inline-flex h-control items-center justify-center gap-2 rounded-control bg-primary px-4 text-label font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <PlusIcon size={16} />
              Add department
            </button>
          </div>

          {showDepartmentForm && (
            <form
              onSubmit={saveDepartment}
              className="space-y-4 rounded-card border border-line bg-surface p-4 sm:p-5"
            >
              <div>
                <h3 className="text-body font-semibold text-ink">
                  {editingDepartmentId === null
                    ? "Add department"
                    : "Edit department"}
                </h3>
                <p className="mt-1 text-caption text-muted">
                  Enter the department details used by the test catalogue.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClassName}>Name *</span>
                  <input
                    required
                    maxLength={100}
                    value={departmentForm.name}
                    onChange={(event) =>
                      setDepartmentForm({
                        ...departmentForm,
                        name: event.target.value,
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label>
                  <span className={labelClassName}>Code *</span>
                  <input
                    required
                    maxLength={20}
                    value={departmentForm.code}
                    onChange={(event) =>
                      setDepartmentForm({
                        ...departmentForm,
                        code: event.target.value,
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className={labelClassName}>Description</span>
                  <textarea
                    rows={3}
                    maxLength={255}
                    value={departmentForm.description}
                    onChange={(event) =>
                      setDepartmentForm({
                        ...departmentForm,
                        description: event.target.value,
                      })
                    }
                    className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-body text-ink outline-none transition-colors focus:border-primary"
                  />
                </label>
              </div>
              {formError && (
                <p role="alert" className="text-label text-danger">
                  {formError}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelDepartmentForm}
                  className="h-control rounded-control border border-line px-4 text-label font-medium text-ink hover:bg-page disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-control rounded-control bg-primary px-4 text-label font-medium text-white hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save department"}
                </button>
              </div>
            </form>
          )}

          <section className="overflow-hidden rounded-card border border-line bg-surface">
            {loading ? (
              <p role="status" className="px-5 py-14 text-center text-body text-muted">
                Loading departments...
              </p>
            ) : departments.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-body font-medium text-ink">
                  No departments found.
                </p>
                <p className="mt-1 text-caption text-muted">
                  Add a department to begin building the catalogue.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-left">
                    <thead className="bg-surface-muted">
                      <tr className="h-table-head text-caption font-medium text-muted">
                        <th className="px-5">Department</th>
                        <th className="px-4">Code</th>
                        <th className="px-4">Description</th>
                        <th className="px-4">Status</th>
                        <th className="px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((department) => (
                        <tr
                          key={department.id}
                          className="border-b border-line last:border-0"
                        >
                          <td className="px-5 py-4 font-medium text-ink">
                            {department.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-muted">
                            {department.code}
                          </td>
                          <td className="max-w-xs px-4 py-4 text-muted">
                            {department.description || "—"}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge active={department.is_active} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => startDepartmentEdit(department)}
                                className="text-label font-medium text-primary hover:underline disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  void updateDepartmentStatus(department)
                                }
                                className="text-label font-medium text-ink hover:underline disabled:opacity-50"
                              >
                                {department.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-line sm:hidden">
                  {departments.map((department) => (
                    <li key={department.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">
                            {department.name}
                          </p>
                          <p className="mt-1 text-caption text-muted">
                            {department.code}
                          </p>
                        </div>
                        <StatusBadge active={department.is_active} />
                      </div>
                      <p className="text-caption text-muted">
                        {department.description || "No description"}
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => startDepartmentEdit(department)}
                          className="text-label font-medium text-primary disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void updateDepartmentStatus(department)}
                          className="text-label font-medium text-ink disabled:opacity-50"
                        >
                          {department.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </section>
      ) : (
        <section
          id="tests-panel"
          role="tabpanel"
          aria-labelledby="tests-tab"
          className="space-y-4"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-body font-semibold text-ink">Test catalogue</h2>
              <p className="mt-1 text-caption text-muted">
                {filteredTests.length} tests shown
              </p>
            </div>
            <button
              type="button"
              disabled={saving || departments.length === 0}
              onClick={() => {
                clearMessages();
                setTestForm({
                  ...EMPTY_TEST_FORM,
                  department_id: departments[0]
                    ? String(departments[0].id)
                    : "",
                });
                setEditingTestId(null);
                setShowTestForm(true);
              }}
              className="inline-flex h-control items-center justify-center gap-2 rounded-control bg-primary px-4 text-label font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <PlusIcon size={16} />
              Add test
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={labelClassName}>Search tests</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, code, department or sample type..."
                className={fieldClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Department</span>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className={fieldClassName}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                    {!department.is_active ? " (inactive)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showTestForm && (
            <form
              onSubmit={saveTest}
              className="space-y-4 rounded-card border border-line bg-surface p-4 sm:p-5"
            >
              <div>
                <h3 className="text-body font-semibold text-ink">
                  {editingTestId === null ? "Add catalogue test" : "Edit test"}
                </h3>
                <p className="mt-1 text-caption text-muted">
                  Set the test details and owning department.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClassName}>Test name *</span>
                  <input
                    required
                    maxLength={150}
                    value={testForm.name}
                    onChange={(event) =>
                      setTestForm({ ...testForm, name: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label>
                  <span className={labelClassName}>Code *</span>
                  <input
                    required
                    maxLength={30}
                    value={testForm.code}
                    onChange={(event) =>
                      setTestForm({ ...testForm, code: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label>
                  <span className={labelClassName}>Department *</span>
                  <select
                    required
                    value={testForm.department_id}
                    onChange={(event) =>
                      setTestForm({
                        ...testForm,
                        department_id: event.target.value,
                      })
                    }
                    className={fieldClassName}
                  >
                    <option value="" disabled>
                      Select a department
                    </option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                        {!department.is_active ? " (inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={labelClassName}>Sample type *</span>
                  <input
                    required
                    maxLength={100}
                    value={testForm.sample_type}
                    onChange={(event) =>
                      setTestForm({
                        ...testForm,
                        sample_type: event.target.value,
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className={labelClassName}>Description</span>
                  <textarea
                    rows={3}
                    value={testForm.description}
                    onChange={(event) =>
                      setTestForm({
                        ...testForm,
                        description: event.target.value,
                      })
                    }
                    className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-body text-ink outline-none transition-colors focus:border-primary"
                  />
                </label>
              </div>
              {departments.length === 0 && (
                <p className="text-label text-warning">
                  Add a department before creating a test.
                </p>
              )}
              {formError && (
                <p role="alert" className="text-label text-danger">
                  {formError}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelTestForm}
                  className="h-control rounded-control border border-line px-4 text-label font-medium text-ink hover:bg-page disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || departments.length === 0}
                  className="h-control rounded-control bg-primary px-4 text-label font-medium text-white hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save test"}
                </button>
              </div>
            </form>
          )}

          <section className="overflow-hidden rounded-card border border-line bg-surface">
            {loading ? (
              <p role="status" className="px-5 py-14 text-center text-body text-muted">
                Loading test catalogue...
              </p>
            ) : filteredTests.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-body font-medium text-ink">
                  {tests.length === 0
                    ? "No catalogue tests found."
                    : "No tests match your search."}
                </p>
                <p className="mt-1 text-caption text-muted">
                  {tests.length === 0
                    ? "Add a test to make it available for requests."
                    : "Try another search or department filter."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-left">
                    <thead className="bg-surface-muted">
                      <tr className="h-table-head text-caption font-medium text-muted">
                        <th className="px-5">Test</th>
                        <th className="px-4">Code</th>
                        <th className="px-4">Department</th>
                        <th className="px-4">Sample type</th>
                        <th className="px-4">Status</th>
                        <th className="px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTests.map((test) => (
                        <tr
                          key={test.id}
                          className="border-b border-line last:border-0"
                        >
                          <td className="px-5 py-4 font-medium text-ink">
                            {test.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-muted">
                            {test.code}
                          </td>
                          <td className="px-4 py-4 text-muted">
                            {departments.find(
                              (department) =>
                                department.id === test.department_id,
                            )?.name ?? "Unknown department"}
                          </td>
                          <td className="px-4 py-4 text-muted">
                            {test.sample_type}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge active={test.is_active} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => startTestEdit(test)}
                                className="text-label font-medium text-primary hover:underline disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => void updateTestStatus(test)}
                                className="text-label font-medium text-ink hover:underline disabled:opacity-50"
                              >
                                {test.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-line sm:hidden">
                  {filteredTests.map((test) => (
                    <li key={test.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{test.name}</p>
                          <p className="mt-1 text-caption text-muted">
                            {test.code} ·{" "}
                            {departments.find(
                              (department) =>
                                department.id === test.department_id,
                            )?.name ?? "Unknown department"}
                          </p>
                        </div>
                        <StatusBadge active={test.is_active} />
                      </div>
                      <p className="text-caption text-muted">
                        Sample type: {test.sample_type}
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => startTestEdit(test)}
                          className="text-label font-medium text-primary disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void updateTestStatus(test)}
                          className="text-label font-medium text-ink disabled:opacity-50"
                        >
                          {test.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </section>
      )}
    </div>
  );
}
