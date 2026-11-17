/**
 * Permisos de jobs que consume el editor (en datasync venían de `role.permissions.jobs.permissions`
 * del usuario logueado). En la demo el usuario tiene todos los permisos; cuando la suite tenga
 * roles reales, basta con pasar otro objeto desde la página.
 */
export interface TPermissionsJob {
  editJob: boolean;
  deleteJob: boolean;
  runJob: boolean;
  scheduleExecution: boolean;
}

export const DEMO_PERMISSIONS_JOBS: TPermissionsJob = {
  editJob: true,
  deleteJob: true,
  runJob: true,
  scheduleExecution: true,
};
