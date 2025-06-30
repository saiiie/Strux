'use client'

import { Sidebar } from '@/app/components/components';
import { adminTabs } from '@/app/utilities/utilities';

export default function DashboardPage() {
    return (
        <>
            <Sidebar tabs={adminTabs()} />
        </>
    );
}