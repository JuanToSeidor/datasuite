"use client";

import React, { useState, useMemo } from "react";
import { Button, Drawer } from "caralstable";
import { CaralIcon, Brand } from "@/components/icons";
import { Input, Select, SelectOption, DataTable, DataTableColumn } from "@/components/ui";

export type LoginMethod = "microsoft" | "email";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  department: string;
  loginMethod: LoginMethod;
  role: string;
  avatarColor?: string;
}

const ROLE_OPTIONS: SelectOption[] = [
  { value: "SuperAdmin", label: "SuperAdmin", iconName: "shieldHalved" },
  { value: "Admin", label: "Admin", iconName: "userConfig" },
  { value: "Editor", label: "Editor", iconName: "edit" },
  { value: "Viewer", label: "Viewer", iconName: "eye" },
  { value: "Data Engineer", label: "Data Engineer", iconName: "database" },
  { value: "Data Architect", label: "Data Architect", iconName: "cubeInCube" },
  { value: "Billing Manager", label: "Billing Manager", iconName: "creditCard" },
  { value: "DevOps Lead", label: "DevOps Lead", iconName: "cloud" },
  { value: "Senior Analyst", label: "Senior Analyst", iconName: "chartSimple" },
  { value: "Security Auditor", label: "Security Auditor", iconName: "lock" },
  { value: "Cost Optimizer", label: "Cost Optimizer", iconName: "dolar" },
  { value: "BI Consultant", label: "BI Consultant", iconName: "presentationScreenChart" },
  { value: "Site Reliability Engineer", label: "Site Reliability Engineer", iconName: "gear" },
  { value: "Account Executive", label: "Account Executive", iconName: "portafolio" },
];

const LOGIN_METHOD_OPTIONS: SelectOption[] = [
  { value: "microsoft", label: "Microsoft (Azure AD / SSO)", iconName: "window" },
  { value: "email", label: "Email Corporativo & Password", iconName: "envelope" },
];

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: "Cloud FinOps", label: "Cloud FinOps", iconName: "cloud" },
  { value: "Data & AI", label: "Data & AI", iconName: "database" },
  { value: "Finance", label: "Finance", iconName: "dolar" },
  { value: "Infrastructure", label: "Infrastructure", iconName: "cube" },
  { value: "Analytics", label: "Analytics", iconName: "chartSimple" },
  { value: "Data Engineering", label: "Data Engineering", iconName: "cubeInCube" },
  { value: "Operations", label: "Operations", iconName: "gear" },
  { value: "Security & Compliance", label: "Security & Compliance", iconName: "shieldHalved" },
  { value: "Management", label: "Management", iconName: "users" },
  { value: "BI Solutions", label: "BI Solutions", iconName: "presentationScreenChart" },
  { value: "Platform Ops", label: "Platform Ops", iconName: "network" },
  { value: "Enterprise Sales", label: "Enterprise Sales", iconName: "portafolio" },
  { value: "General", label: "General", iconName: "circleInfo" },
];

const AVATAR_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
];

const INITIAL_USERS: UserItem[] = [
  {
    id: "1",
    name: "Juan David Torres",
    email: "jdtorres@seidoranalytics.com",
    department: "Cloud FinOps",
    loginMethod: "microsoft",
    role: "SuperAdmin",
    avatarColor: "#3b82f6",
  },
  {
    id: "2",
    name: "Ana Martínez",
    email: "amartinez@seidoranalytics.com",
    department: "Cloud FinOps",
    loginMethod: "microsoft",
    role: "Admin",
    avatarColor: "#10b981",
  },
  {
    id: "3",
    name: "Carlos Gómez",
    email: "cgomez@seidoranalytics.com",
    department: "Data & AI",
    loginMethod: "email",
    role: "Data Engineer",
    avatarColor: "#f59e0b",
  },
  {
    id: "4",
    name: "Lucía Fernández",
    email: "lfernandez@seidoranalytics.com",
    department: "Finance",
    loginMethod: "microsoft",
    role: "Billing Manager",
    avatarColor: "#8b5cf6",
  },
  {
    id: "5",
    name: "Martín Silva",
    email: "msilva@seidoranalytics.com",
    department: "Infrastructure",
    loginMethod: "microsoft",
    role: "DevOps Lead",
    avatarColor: "#ec4899",
  },
  {
    id: "6",
    name: "Valentina Rojas",
    email: "vrojas@seidoranalytics.com",
    department: "Analytics",
    loginMethod: "email",
    role: "Senior Analyst",
    avatarColor: "#06b6d4",
  },
  {
    id: "7",
    name: "Diego Álvarez",
    email: "dalvarez@seidoranalytics.com",
    department: "Data Engineering",
    loginMethod: "microsoft",
    role: "Data Architect",
    avatarColor: "#f97316",
  },
  {
    id: "8",
    name: "Sofía Benítez",
    email: "sbenitez@seidoranalytics.com",
    department: "Operations",
    loginMethod: "email",
    role: "Editor",
    avatarColor: "#6366f1",
  },
  {
    id: "9",
    name: "Javier Castro",
    email: "jcastro@seidoranalytics.com",
    department: "Security & Compliance",
    loginMethod: "microsoft",
    role: "Security Auditor",
    avatarColor: "#3b82f6",
  },
  {
    id: "10",
    name: "Camila Herrera",
    email: "cherrera@seidoranalytics.com",
    department: "Management",
    loginMethod: "email",
    role: "Viewer",
    avatarColor: "#10b981",
  },
  {
    id: "11",
    name: "Mateo López",
    email: "mlopez@seidoranalytics.com",
    department: "Cloud FinOps",
    loginMethod: "microsoft",
    role: "Data Architect",
    avatarColor: "#f59e0b",
  },
  {
    id: "12",
    name: "Elena Navarro",
    email: "enavarro@seidoranalytics.com",
    department: "Cloud FinOps",
    loginMethod: "microsoft",
    role: "Cost Optimizer",
    avatarColor: "#8b5cf6",
  },
  {
    id: "13",
    name: "Pablo Domínguez",
    email: "pdominguez@seidoranalytics.com",
    department: "BI Solutions",
    loginMethod: "email",
    role: "BI Consultant",
    avatarColor: "#ec4899",
  },
  {
    id: "14",
    name: "Agustina Morales",
    email: "amorales@seidoranalytics.com",
    department: "Platform Ops",
    loginMethod: "microsoft",
    role: "Site Reliability Engineer",
    avatarColor: "#06b6d4",
  },
  {
    id: "15",
    name: "Federico Vargas",
    email: "fvargas@seidoranalytics.com",
    department: "Enterprise Sales",
    loginMethod: "email",
    role: "Account Executive",
    avatarColor: "#f97316",
  },
];

export function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);

  // Invite User Drawer state
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");
  const [newUserDepartment, setNewUserDepartment] = useState<string>("Cloud FinOps");
  const [newUserRole, setNewUserRole] = useState<string>("Editor");
  const [newUserLoginMethod, setNewUserLoginMethod] = useState<LoginMethod>("microsoft");

  // Edit User Drawer state
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editDepartment, setEditDepartment] = useState<string>("Cloud FinOps");
  const [editRole, setEditRole] = useState<string>("Editor");
  const [editLoginMethod, setEditLoginMethod] = useState<LoginMethod>("microsoft");

  const handleCreateUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newUser: UserItem = {
      id: String(Date.now()),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      department: newUserDepartment.trim() || "General",
      role: newUserRole,
      loginMethod: newUserLoginMethod,
      avatarColor: randomColor,
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsInviteDrawerOpen(false);
    setNewUserName("");
    setNewUserEmail("");
  };

  const openEditDrawer = (user: UserItem) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditDepartment(user.department);
    setEditRole(user.role);
    setEditLoginMethod(user.loginMethod);
  };

  const closeEditDrawer = () => {
    setEditingUser(null);
  };

  const handleSaveEditUser = () => {
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
            ...u,
            name: editName.trim(),
            email: editEmail.trim(),
            department: editDepartment,
            role: editRole,
            loginMethod: editLoginMethod,
          }
          : u
      )
    );
    closeEditDrawer();
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${target?.name}"?`);
    if (confirm) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // Distinct departments for filter select suggestions
  const departmentOptions = useMemo(() => {
    const list = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
    return list.map((d) => ({ label: d, value: d }));
  }, [users]);

  // Distinct roles for filter select suggestions
  const roleOptions = useMemo(() => {
    const list = Array.from(new Set(users.map((u) => u.role).filter(Boolean)));
    return list.map((r) => ({ label: r, value: r }));
  }, [users]);

  // Columns for the Agnostic Users Table
  const userColumns = useMemo<DataTableColumn<UserItem>[]>(() => {
    return [
      // 1. Usuario Column (Avatar + Display Name)
      {
        id: "name",
        accessorKey: "name",
        header: "Usuario",
        filterLabel: "Usuario",
        filterType: "text",
        width: 250,
        minWidth: 180,
        cell: ({ row }) => {
          const initials = row.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: row.avatarColor || "#3b82f6" }}
                className="size-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold shadow-xs shrink-0 select-none"
              >
                {initials}
              </div>
              <span className="font-bold text-neutral-900 truncate" title={row.name}>
                {row.name}
              </span>
            </div>
          );
        },
        footer: ({ filteredData }) => (
          <span className="font-bold text-neutral-900">
            Total: {filteredData.length} usuarios
          </span>
        ),
      },

      // 2. Mail Column
      {
        id: "email",
        accessorKey: "email",
        header: "Mail",
        filterLabel: "Mail",
        filterType: "text",
        width: 280,
        minWidth: 200,
        cell: ({ value }) => (
          <div className="flex items-center gap-1.5 text-neutral-800">
            <span className="shrink-0">
              <CaralIcon name="envelope" size={14} />
            </span>
            <span className="font-mono text-xs text-neutral-900 truncate" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ),
      },

      // 3. Departamento Column
      {
        id: "department",
        accessorKey: "department",
        header: "Departamento",
        filterLabel: "Departamento",
        filterType: "select",
        filterSelectOptions: departmentOptions,
        width: 190,
        minWidth: 140,
        cell: ({ value }) => (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-container border border-neutral-500 text-neutral-900">
            {String(value || "General")}
          </span>
        ),
      },

      // 4. Método de Login Column (Microsoft SSO o Email)
      {
        id: "loginMethod",
        accessorKey: "loginMethod",
        header: "Método de Login",
        filterLabel: "Método de Login",
        filterType: "select",
        filterSelectOptions: [
          { label: "Microsoft", value: "microsoft" },
          { label: "Email", value: "email" },
        ],
        width: 190,
        minWidth: 150,
        cell: ({ value }) => {
          const isMicrosoft = value === "microsoft";

          if (isMicrosoft) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-info-light text-info-hard border border-info-main/30">
                <div className="grid grid-cols-2 gap-0.5 size-3 shrink-0">
                  <div className="bg-[#f25022] rounded-[0.5px]" />
                  <div className="bg-[#7fba00] rounded-[0.5px]" />
                  <div className="bg-[#00a4ef] rounded-[0.5px]" />
                  <div className="bg-[#ffb900] rounded-[0.5px]" />
                </div>
                <span>Microsoft</span>
              </span>
            );
          }

          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-container text-neutral-800 border border-neutral-500">
              <span className="text-neutral-700">
                <CaralIcon name="envelope" size={13} />
              </span>
              <span>Email & Password</span>
            </span>
          );
        },
      },

      // 5. Rol Column
      {
        id: "role",
        accessorKey: "role",
        header: "Rol",
        filterLabel: "Rol",
        filterType: "select",
        filterSelectOptions: roleOptions,
        width: 170,
        minWidth: 130,
        cell: ({ value }) => {
          const roleStr = String(value || "Viewer");
          const roleOption = ROLE_OPTIONS.find((r) => r.value === roleStr);
          const icon = roleOption?.iconName || "user";

          const roleColors: Record<string, string> = {
            SuperAdmin: "bg-danger-light text-danger-hard border-danger-main/30",
            Admin: "bg-warning-light text-warning-hard border-warning-main/30",
            Editor: "bg-info-light text-info-hard border-info-main/30",
            Viewer: "bg-container text-neutral-800 border-neutral-500",
            "Data Engineer": "bg-indigo-light text-indigo-hard border-indigo-main/30",
            "Data Architect": "bg-indigo-light text-indigo-hard border-indigo-main/30",
            "Billing Manager": "bg-success-light text-success-hard border-success-main/30",
            "DevOps Lead": "bg-cyan-light text-cyan-hard border-cyan-main/30",
          };

          const colorClass =
            roleColors[roleStr] || "bg-info-light text-info-hard border-info-main/30";

          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${colorClass}`}
            >
              <CaralIcon name={icon} size={13} />
              <span>{roleStr}</span>
            </span>
          );
        },
      },

      // 6. Acciones Column (Solo Editar)
      {
        id: "actions",
        header: "Acciones",
        filterType: "none",
        align: "center",
        width: 80,
        minWidth: 70,
        resizable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              isIconButton
              iconName="edit"
              onClick={() => openEditDrawer(row)}
              className="text-neutral-800 hover:text-info-main cursor-pointer"
              title="Editar usuario"
            />
          </div>
        ),
      },
    ];
  }, [departmentOptions, roleOptions]);

  return (
    <div className="w-full flex flex-col gap-4 text-left font-poppins">
      {/* Agnostic DataTable with custom user columns configuration */}
      <DataTable<UserItem>
        title="Gestión de Usuarios"
        description="Administra los usuarios de la plataforma, sus correos, departamentos, métodos de autenticación y roles de acceso."

        toolbarRight={
          <Button
            variant="info"
            iconName="plus"
            onClick={() => setIsInviteDrawerOpen(true)}
          >
            Invite user
          </Button>
        }
        data={users}
        columns={userColumns}
        keyExtractor={(row) => row.id}
        canSearch={true}
        searchPlaceholder="Buscar por usuario, email, departamento o rol..."
        canFilterColumns={true}
        canFilterErrors={false}
        canExport={true}
        exportFileName="usuarios_plataforma"
        canExpand={true}
        canReadjust={true}
        labels={{
          itemPlural: "usuarios",
          emptyMessage: "No se encontraron usuarios para los filtros seleccionados.",
          filterDrawerTitle: "Filtros de Usuarios",
          filterDrawerDescription: "Selecciona una columna y una condición para filtrar la lista de usuarios.",
        }}
      />

      {/* ========================================================= */}
      {/* DRAWER: INVITE / ADD NEW USER                             */}
      {/* ========================================================= */}
      <Drawer
        isOpen={isInviteDrawerOpen}
        onClose={() => setIsInviteDrawerOpen(false)}
        title="Invitar Nuevo Usuario"
      >
        <div className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins p-1">
          <div className="flex-1 space-y-4">
            <p className="text-xs text-neutral-800">
              Ingresa los datos del nuevo usuario para enviarle la invitación a la plataforma.
            </p>

            <Input
              label="Nombre Completo *"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Javier Gómez"
              detail="Nombre de visualización del usuario."
            />

            <Input
              label="Email Corporativo *"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="usuario@seidoranalytics.com"
              detail="Dirección de correo para inicio de sesión."
              className="font-mono"
            />

            <Select
              label="Departamento *"
              value={newUserDepartment}
              onValueChange={(val) => setNewUserDepartment(String(val))}
              options={DEPARTMENT_OPTIONS}
              placeholder="Selecciona departamento..."
              detail="Área u unidad organizativa."
            />



            <Select
              label="Rol *"
              value={newUserRole}
              onValueChange={(val) => setNewUserRole(String(val))}
              options={ROLE_OPTIONS}
              placeholder="Selecciona un rol..."
              detail="Rol de acceso que define permisos y privilegios."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-400">
            <Button
              variant="ghost"
              onClick={() => setIsInviteDrawerOpen(false)}
              className="text-neutral-800 hover:text-neutral-900"
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleCreateUser}
              className="text-neutral-100!"
            >
              Invitar Usuario
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ========================================================= */}
      {/* DRAWER: EDIT USER (POR FILA)                              */}
      {/* ========================================================= */}
      {editingUser && (
        <Drawer
          isOpen={true}
          onClose={closeEditDrawer}
          title={`Editar Usuario: ${editingUser.name}`}
        >
          <div className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins p-1">
            <div className="flex-1 space-y-4">
              <p className="text-xs text-neutral-800">
                Modifica los datos del usuario, departamento, método de autenticación y rol asignado.
              </p>

              <Input
                label="Nombre Completo *"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre del usuario"
              />

              <Input
                label="Email Corporativo *"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="usuario@seidoranalytics.com"
                className="font-mono"
              />

              <Select
                label="Departamento *"
                value={editDepartment}
                onValueChange={(val) => setEditDepartment(String(val))}
                options={DEPARTMENT_OPTIONS}
                placeholder="Selecciona departamento..."
              />



              <Select
                label="Rol *"
                value={editRole}
                onValueChange={(val) => setEditRole(String(val))}
                options={ROLE_OPTIONS}
                placeholder="Selecciona un rol..."
              />

              {/* ZONA DE SEGURIDAD / ELIMINAR USUARIO */}
              <div className="mt-6 pt-4 border-t border-neutral-400 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-danger-main">
                  <CaralIcon name="shieldHalved" size={15} />
                  <span className="text-xs font-bold uppercase tracking-wider text-danger-hard">
                    Zona de Seguridad
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-danger-light/40 text-danger-hard border border-danger-main/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className=" font-bold ">
                      Eliminar usuario
                    </span>
                    <span className="text-[11px]  mt-0.5">
                      Esta acción eliminará a este usuario y revocará todos sus accesos a la organización de forma permanente.
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    iconName="trash"
                    onClick={() => {
                      if (editingUser) {
                        handleDeleteUser(editingUser.id);
                        closeEditDrawer();
                      }
                    }}
                    className="shrink-0"
                  >
                    Eliminar Usuario
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-400">
              <Button
                variant="ghost"
                onClick={closeEditDrawer}
                className="text-neutral-800 hover:text-neutral-900"
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleSaveEditUser}
                className="text-neutral-100!"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
