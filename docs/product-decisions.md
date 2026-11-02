# LabTrack Product Decisions

This document records the major product decisions and rules for LabTrack.

It acts as a reference for development and helps ensure that product, frontend, backend, and database decisions remain consistent.

## 1. Product Scope

LabTrack is a Hospital Laboratory Management System designed for a single hospital.

The MVP supports multiple laboratory departments:

- Haematology
- Microbiology
- Chemical Pathology
- Histopathology
- Serology/Immunology

## 2. User Roles

LabTrack has four main user roles:

### Administrator

Responsible for:

- Staff management
- Roles
- Departments
- System settings

### Receptionist

Responsible for:

- Patient registration
- Patient records
- Sample registration
- Test requests

### Laboratory Scientist

Responsible for:

- Departmental tests and work
- Processing tests
- Adding processing notes
- Entering results
- Saving progress
- Submitting results for supervisor review

### Laboratory Supervisor

Responsible for:

- Approving or rejecting custom test requests
- Monitoring laboratory operations
- Reviewing submitted results
- Approving results
- Returning results for correction
- Rejecting results 

## 3. Core Product Rules

### Central Patient Registration

Patients are registered centrally and can have multiple samples and laboratory requests over time.

### Samples and Test Requests

A sample and a test request are not the same thing.

A single sample can have multiple test requests.

A single sample can involve multiple laboratory departments depending on the tests requested.

Each test request belongs to the appropriate laboratory department.

### Test Types

LabTrack supports:

- Predefined tests from the hospital's test catalogue
- Custom test requests

Custom test requests require Laboratory Supervisor approval before they can proceed through the workflow.

### Result Approval

Laboratory Scientists can enter and submit results, but they cannot approve their own results.

Submitted results must be reviewed by a Laboratory Supervisor.

A supervisor can:

- Approve a result
- Return a result for correction
- Reject a result

Returned or rejected results must include a reason.

### Activity and Workflow History

Important actions and workflow changes should be recorded.

This includes relevant events such as:

- Important status changes
- Custom test request decisions
- Result submissions
- Result approvals, returns, or rejections

## 4. Main Workflow

The core laboratory workflow is:

1. A patient is registered or identified in the system.
2. A sample is registered for the patient.
3. One or more test requests are created for the sample.
4. Tests are assigned to the appropriate laboratory departments.
5. The tests enter the laboratory processing workflow.
6. A Laboratory Scientist processes the assigned tests.
7. Results are entered and saved.
8. The Laboratory Scientist submits completed results for review.
9. A Laboratory Supervisor reviews the submitted results.
10. The Supervisor approves the result, returns it for correction, or rejects it.
11. Approved work contributes to completion of the overall sample workflow.

### Main Operational Statuses

The product conceptually supports the following main statuses:

- Registered
- Received
- Pending Processing
- Processing
- Awaiting Approval
- Completed

Exceptional statuses may include:

- Rejected
- On Hold
- Cancelled

The final implementation must carefully distinguish between sample-level status and individual test request/result statuses.

## 5. MVP Boundaries

The first version of LabTrack focuses on the core hospital laboratory workflow.

### Included in the MVP

- Single hospital scope
- Central patient registration
- Patient records
- Multiple laboratory departments
- Sample registration and tracking
- Multiple test requests per sample
- Predefined test catalogue
- Custom test requests
- Custom test request approval
- Laboratory processing workflow
- Processing notes
- Result entry
- Result submission
- Supervisor result review
- Result approval, return, and rejection
- Role-based access
- Operational dashboard
- Operational reports
- Activity and audit history
- Staff, department, and role management
- Demo profiles for demonstrating the system

### Not Included in the Initial MVP

The following features are intentionally postponed:

- Multiple hospitals or multi-tenancy
- Laboratory instrument integration
- Barcode or QR code scanning
- Automated notifications
- Real-time updates
- Patient portal
- Customer billing and payments
- Advanced analytics or AI features
- Inventory management
- External hospital system integrations

These features may be reconsidered after the core MVP is complete.

## 6. Development Principles

LabTrack will be developed using an intentional, understanding-first approach.

### Learning Before Speed

The goal is to understand how and why the system works, not to complete the project as quickly as possible.

Progress is based on understanding rather than a fixed schedule.

### Build in Vertical Slices

Where appropriate, features will be developed through connected steps:

1. Understand the feature and its requirements
2. Build or adapt the frontend
3. Build the backend logic
4. Connect the database
5. Integrate frontend and backend
6. Test the complete workflow

### Grow Complexity Gradually

The project should not begin with unnecessary complex architecture.

Project structure and technical complexity will grow when there is a clear reason for them.

### Progressive Deployment

LabTrack will be developed and deployed progressively.

Meaningful milestones will be tested locally and deployed as the application grows rather than waiting until the entire project is finished.

### Documentation

Important product and technical decisions should be documented so they can be revisited throughout development.

### Build in Public

Documentation of the development journey is optional.

When a milestone is worth sharing, the simplest suitable format should be used:

- Screenshot
- Screenshot carousel
- Text post
- Short screen recording when necessary

The goal is to document the development journey, not to become a full-time content creator.

