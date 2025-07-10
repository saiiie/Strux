// HREFS TEMPORARY ONLY!!!
import { Folder, File, Clipboard, User, LogOut } from 'lucide-react';

export function adminTabs(){
    const adminTabs = [
        { label: "Projects", svg: <Folder size={28} color="#FBFBFB"/>, href: "/dashboard/admin/projects" },
        { label: "Inventory Logs", svg: <File size={28} color="#FBFBFB"/>, href: "/dashboard/admin/inventory-logs" },
        { label: "Material Requests", svg: <Clipboard size={28} color="#FBFBFB"/>, href: "/dashboard/admin/material-requests" },
        { label: "Accounts", svg: <User size={28} color="#FBFBFB"/>, href: "/dashboard/admin/accounts" },
        { label: "Log Out", svg: <LogOut size={26} color="#FBFBFB"/>, href: "/dashboard/admin" }
    ]

    return adminTabs;
}

export function pmTabs(){
    const pmTabs = [
        // { label: "Projects", svg: <Folder size={28} color="#FBFBFB"/>, href: "/dashboard/admin" },
        { label: "Inventory Logs", svg: <File size={28} color="#FBFBFB"/>, href: "/dashboard/admin" },
        { label: "Material Requests", svg: <Clipboard size={28} color="#FBFBFB"/>, href: "/dashboard/admin" },
        { label: "Log Out", svg: <LogOut size={26} color="#FBFBFB"/>, href: "/dashboard/admin" }
    ]

    return pmTabs;
}

export function projectsColumns(){
    const projColumns = [
        { header: 'Project ID', accessor: 'projectid' },
        { header: 'Name', accessor: 'projectname' },
        { header: 'Location', accessor: 'location' },
        { header: 'Project Manager', accessor: 'project_manager_name' },
        { header: 'Status', accessor: 'status' }
    ];

    return projColumns;
}

export function accountsColumns(){
    const accountColumns = [
        {header: 'User ID', accessor: 'username'},
        {header: 'Full Name', accessor: 'name'},
        {header: 'Role', accessor: 'role'},
    ];

    return accountColumns;
}