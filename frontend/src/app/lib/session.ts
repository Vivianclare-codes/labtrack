import type { Role } from "./navigation";

export interface SessionUser {
  name: string;
  role: Role;
}

/*
  DEMO DATA.

  This will be replaced with the real logged-in user
  when authentication is connected to the backend.

  To preview another role, change the role below.
*/

export const demoUser: SessionUser = {
  name: "James Carter",
  role: "admin",
};
