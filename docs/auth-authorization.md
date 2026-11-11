# LabTrack Authentication and Authorization Policy

## Status and scope

This document defines the proposed Phase 0 authorization contract for LabTrack. It is based on the requirements in [product-decisions.md](./product-decisions.md) and the existing FastAPI routes.

The policy is prospective: **the current application does not enforce these permissions**. All existing workflow routes are presently callable without authentication. This document does not add authentication, change routes, or define database migrations.

The permission matrix covers every endpoint currently declared in the six backend route modules. An endpoint marked “deny” is to return `403 Forbidden` to an authenticated user without the required role. Requests without a valid authenticated session are to return `401 Unauthorized`.

## 1. Canonical roles

Use these four names consistently in APIs, persisted role values, and the user interface:

| Canonical role | Existing product term | Existing frontend term |
|---|---|---|
| `Admin` | Administrator | Admin |
| `Receptionist` | Receptionist | Receptionist |
| `Scientist` | Laboratory Scientist | Scientist |
| `Supervisor` | Laboratory Supervisor | Supervisor |

These are single-role staff accounts in the initial policy. A user’s role is assigned and changed by an Admin; it is not selected by the user at login or trusted from a request body or client-side state.

## 2. Responsibilities and boundaries

### Admin

- Creates, updates, disables, and assigns roles to staff accounts.
- Manages departments and the test catalogue.
- Can read department and test catalogue data needed for administration.
- Does not register or edit patients, samples, test requests, or results, and does not perform clinical workflow actions under the Admin role.
- Does not gain authorization merely because the role is named “Admin.” A separate, audited emergency-access policy would be needed if administrative clinical access is required.

### Receptionist

- Registers and maintains patient records.
- Registers samples and updates sample-level receipt/handling status.
- Creates and reads test requests for a patient’s sample.
- Can read the department and active test catalogue needed to create requests.
- Cannot start laboratory processing, enter or alter results, submit results, or approve/reject requests or results.
- Cannot manage staff accounts or the test catalogue.

### Scientist

- Reads patient, sample, catalogue, test-request, and result information needed for laboratory work.
- Advances eligible test requests into processing, enters results, updates a returned/rejected result, and submits results for supervisor review.
- Cannot approve, return, or reject a result, including a result the Scientist personally entered.
- Cannot register or edit patient records, receive samples, manage departments/tests, or create staff accounts under this role.
- Any future department-assignment restriction must be enforced by the backend; the current data model does not define staff-to-department assignments.

### Supervisor

- Reads patient, sample, catalogue, test-request, and result information to monitor laboratory operations and review work.
- Reviews pending custom test requests.
- Reviews submitted results and approves, returns for correction, or rejects them with a reason.
- Does not create or alter result values on behalf of a Scientist, register patients or samples, manage staff accounts, or manage the catalogue under this role.

## 3. Permission matrix for existing backend endpoints

**Legend:** `R` = read; `C` = create; `U` = update/advance; `P` = process; `S` = submit; `A` = approve; `Rj` = reject; `Ret` = return for correction. A dash means not permitted. Each “collection” GET includes its current query filters and pagination.

All listed permissions require authentication. The backend must enforce the matrix even if the frontend hides links or buttons.

| Existing endpoint | Admin | Receptionist | Scientist | Supervisor | Notes |
|---|---:|---:|---:|---:|---|
| `POST /patients/` | — | C | — | — | Register a patient. |
| `GET /patients/` | — | R | R | R | Search/list patient records. |
| `GET /patients/{patient_id}` | — | R | R | R | Read a patient record. |
| `PATCH /patients/{patient_id}` | — | U | — | — | Update patient demographics/registration details. |
| `POST /samples/` | — | C | — | — | Register a sample. The authenticated Receptionist is its receiving/registration actor. |
| `GET /samples/` | — | R | R | R | Search/list samples. |
| `GET /samples/{sample_id}` | — | R | R | R | Read a sample. |
| `PATCH /samples/{sample_id}` | — | U | — | — | Update permitted receipt/handling states only; do not allow arbitrary transitions. |
| `POST /departments/` | C | — | — | — | Create a department. |
| `GET /departments/` | R | R | R | R | Read the catalogue/department data needed for each role’s work. |
| `GET /departments/{department_id}` | R | R | R | R | Read department details. |
| `PATCH /departments/{department_id}` | U | — | — | — | Update department configuration, including active state. |
| `POST /tests/` | C | — | — | — | Create a catalogue test. |
| `GET /tests/` | R | R | R | R | Read tests; normal operational use should exclude inactive tests where appropriate. |
| `GET /tests/{test_id}` | R | R | R | R | Read a test. |
| `PATCH /tests/{test_id}` | U | — | — | — | Update catalogue test configuration, including active state. |
| `POST /test-requests/` | — | C | — | — | Create catalogue or custom requests for a sample. Custom requests remain pending supervisor review. |
| `GET /test-requests/` | — | R | R | R | List requests; scientists use this for processing and supervisors for oversight/review. |
| `GET /test-requests/{request_id}` | — | R | R | R | Read one request. |
| `PATCH /test-requests/{request_id}/status` | — | — | U/P | — | Scientist may advance only `Requested → Processing` or `Processing → Awaiting Review`, subject to any future assignment rules. Other transitions must use their dedicated decision workflow. |
| `PATCH /test-requests/{request_id}/review` | — | — | — | A/Rj | Supervisor only; pending custom requests only. Rejection must record a reason. |
| `POST /results/` | — | — | C/P | — | Create a draft result only for an eligible request in processing; actor comes from the authenticated identity. |
| `GET /results/` | — | — | R | R | Read results needed for processing/review. |
| `GET /results/{result_id}` | — | — | R | R | Read one result. |
| `PATCH /results/{result_id}/submit` | — | — | S | — | Submitting Scientist only; draft result moves to review. |
| `PATCH /results/{result_id}/review` | — | — | — | A/Ret/Rj | Supervisor only; approve, return, or reject with a reason for non-approval. Must enforce reviewer/author separation. |
| `PATCH /results/{result_id}/correct` | — | — | U | — | Scientist may correct only an eligible result returned/rejected for correction; preserve review and correction history. |

### Operations not yet represented by an endpoint

- Staff account creation, role assignment, and deactivation are Admin-only operations, but no staff-management endpoint currently exists.
- There is no explicit result “return for correction” decision in the current `ResultReview` schema; see [Known conflicts and route gaps](#8-known-conflicts-and-route-gaps).
- There is no explicit processing-note endpoint in the current backend, although processing notes appear in the product requirements.
- A `PATCH` permission above applies only to the listed, permitted fields and state transitions. It does not authorize an unrestricted update to every field in a request schema.

## 4. Authorization and workflow rules

1. **Backend is authoritative.** Every endpoint other than explicitly public authentication/bootstrap endpoints requires a valid authenticated user. Frontend navigation visibility is not an access-control boundary.
2. **Role plus operation is required.** A role check must be performed on the server for every read and write. State-changing endpoints must additionally validate the current state and permitted transition.
3. **Least privilege.** Admin manages system configuration and staff, not clinical records by default. Supervisor review authority does not grant result-editing authority. Scientist processing authority does not grant review authority.
4. **Custom test requests.** A Receptionist may create a custom request, which remains pending. Only a Supervisor may approve or reject it. A rejection must retain a reason and actor in the audit history.
5. **Result submission and review are separate duties.** A Scientist may submit a result; only a Supervisor may make the review decision. A Scientist is never authorized to approve, return, or reject any result.
6. **No self-review.** The server must compare the authenticated reviewer’s immutable user ID with the result’s recorded submitting/performing user ID and reject a matching review attempt. The check must not rely on a display name or a client-supplied identity. Review actions must record reviewer identity and timestamp.
7. **Preserve decision history.** Approval, return, rejection, reasons, subsequent corrections, and resubmissions are distinct audit events. A later correction must not overwrite the original result or erase its review decision.
8. **Scope is not implied by role.** If assignment to laboratory departments is introduced, the backend must also verify the staff member’s assignment for processing and review. The current schema has no such assignment relation, so this policy does not claim that department-level scoping is currently possible.

## 5. Staff-account creation and deactivation

- No public self-registration is allowed. Staff accounts are created through a future Admin-only workflow.
- Initial provisioning of the first Admin must use a controlled deployment/operator process, not a public account-creation endpoint.
- An Admin-created account must have a unique normalized login identifier, an assigned canonical role, an active state, and a securely hashed password set through an invitation or another approved credential-setup process. Passwords must never be stored or logged in plaintext.
- The server must validate the requested role; clients cannot elevate their own role or assign a role through an untrusted profile update.
- Account creation, role changes, activation, and deactivation must record the acting Admin, target account, timestamp, and relevant change in an audit history.
- Deactivation is preferred over deletion. It preserves clinical attribution and audit references. A disabled account cannot log in, refresh a session, or use an existing token.
- An Admin must not deactivate their own account through the ordinary account-management flow, and the system must not permit deactivation of the last active Admin. Recovery from loss of all Admin access requires a separately controlled operator procedure.
- Re-enabling a disabled account is also an Admin-controlled, audited action. A re-enabled account should require credential reset or verification according to the eventual account-recovery policy.

## 6. Staff identity and historical attribution

For **new** actions, the backend must derive the acting staff identity from the authenticated session. It must not trust `receiving_staff`, `performed_by`, or equivalent actor fields submitted by the browser. The backend should persist a stable staff user ID for attribution and derive any displayed staff name from that account.

Existing records must not be rewritten to make them appear to have been performed by a newly created account:

- Preserve existing `Sample.receiving_staff` and `Result.performed_by` values as historical text.
- Introduce nullable staff-ID references for new attribution through a later, reviewed migration, leaving legacy rows unlinked unless identity can be verified from authoritative records.
- Do not infer identity by matching names. Multiple staff can share a name, names can change, and existing text may be generic (for example, “Laboratory Scientist”).
- Keep a visible/traceable distinction between verified user-linked actions and legacy actions with unknown or unverified actor identity.
- Do not allow a legacy result with no verified author identity to bypass separation-of-duties checks. Before it is reviewed under the authenticated workflow, require a documented reconciliation/assignment process or an explicit, audited legacy-review policy that guarantees an independent reviewer.
- Preserve the original value and record any reconciliation as a separate audit event; do not silently replace historical attribution.

## 7. Proposed authentication and session lifecycle

This is a proposed lifecycle, not current application behavior.

1. **Login:** The user submits the login identifier and password over HTTPS. The backend normalizes the identifier, verifies the password hash using a password-hashing algorithm, and checks that the account is active. Invalid credentials should return a generic failure that does not reveal whether the account exists. Successful authentication creates a session for that user.
2. **Browser session:** Prefer a Next.js server-side/BFF session boundary with an opaque refresh/session cookie marked `HttpOnly`, `Secure` in production, and an appropriate `SameSite` policy. Do not store access or refresh tokens in browser local storage. If cross-site cookie use is required by deployment, explicitly configure CORS and CSRF protections.
3. **Access token:** The BFF obtains a signed, short-lived JWT access token for backend requests. Proposed maximum lifetime: **15 minutes**. Validate signature, issuer, audience, issued-at, and expiration. Keep signing keys in server-only configuration. Resolve the token subject to the current account on protected requests so role changes and deactivation take effect without trusting stale role claims.
4. **Renewal:** If persistent login is needed, use a rotating, server-revocable refresh/session credential with a bounded lifetime. Proposed initial policy: **7-day inactivity expiry and 30-day absolute expiry**, subject to deployment and clinical workflow review. Store only a verifier/hash for refresh credentials; detect reuse and revoke the session family.
5. **Logout:** Logout revokes the refresh/session credential server-side and clears the browser cookie. Because a self-contained JWT remains valid until expiry unless checked against server-side session state, protected requests must either verify that the session remains active or accept only the short residual access-token window. The policy should use session revocation checks where immediate logout is required.
6. **Disabled account or role change:** On each protected request and refresh, check the account’s current active state and role. A disabled account is denied even if it presents an otherwise unexpired JWT; its refresh sessions are revoked. A role change applies on the next request, not after trusting an old role claim.
7. **Expiry and reauthentication:** Expired access tokens are renewed only through a valid, active refresh session; otherwise the user is sent to login. Expired/revoked/invalid tokens return `401`. A valid user lacking endpoint permission receives `403`.
8. **Audit:** Record authentication success/failure, logout/session revocation, account administration, and privileged workflow decisions without recording passwords, raw tokens, or signing secrets.

## 8. Known conflicts and route gaps

These points must be resolved or deliberately accepted before implementation:

1. **Administrator naming:** The product document says “Administrator,” while the requested canonical role is “Admin.” This policy treats them as the same role and recommends persisting/displaying `Admin` consistently.
2. **Result return versus rejection:** The product requires a Supervisor to approve, return for correction, or reject a result, and says returned or rejected work needs a reason. The current `ResultReview` schema in `results/routes.py` accepts only `approve` and `reject`. Its rejection path sets the result to `Rejected`, the test request back to `Processing`, and stores the reason in `Result.comments`; this behaves like a return-for-correction, but does not represent a distinct final rejection. The policy calls for distinct `Returned` and `Rejected` outcomes, each with a reason, unless the product owner explicitly chooses to keep the current combined meaning.
3. **Generic test-request status endpoint bypass risk:** `PATCH /test-requests/{request_id}/status` currently allows `Pending Approval → Requested/Rejected` and `Awaiting Review → Completed/Processing/Rejected` without encoding which role may make those transitions. This policy reserves custom-request decisions for `/review` and result review for `/results/{result_id}/review`; implementation must restrict or redesign the generic endpoint so it cannot bypass those role and separation-of-duties rules.
4. **Missing actor identity:** `SampleCreate` and `ResultCreate` currently accept client-supplied `receiving_staff` and `performed_by`. The product requires meaningful action history, but existing text fields do not establish an authenticated identity. New actions must use the authenticated user; historical rows must remain intact and unverified unless reconciled.
5. **Missing processing-note endpoint:** Product requirements include adding processing notes, but none of the six route modules currently exposes that operation. Its permitted roles, attribution, and history behavior must be specified when the endpoint is designed.
6. **Account lifecycle is not implemented:** Product scope includes staff and role management, but none of the existing routes provides account creation, role assignment, or deactivation. Those operations require new authenticated endpoints and an initial-Admin provisioning procedure.
7. **Role permissions beyond stated responsibilities:** This matrix makes the explicit least-privilege choice that Admin cannot read or alter clinical patient/workflow records. The product document assigns Admin staff, roles, departments, and settings, but does not explicitly say whether Admin should have read-only operational or patient-record access. Confirm this boundary before implementation.
8. **Return/correction route semantics:** `PATCH /results/{result_id}/correct` currently accepts only results in `Rejected` status. If return and final rejection become distinct, the correction endpoint must accept only the return/correction state; final rejection must not be editable as if returned.

## Endpoint inventory reviewed

The matrix was checked against the route declarations in:

- `backend/app/patients/routes.py`
- `backend/app/samples/routes.py`
- `backend/app/departments/routes.py`
- `backend/app/tests/routes.py`
- `backend/app/test_requests/routes.py`
- `backend/app/results/routes.py`

The current routes do not implement any of the authentication or authorization rules in this document.
