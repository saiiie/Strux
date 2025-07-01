'use client'

import { Sidebar } from '@/app/components/components';
import { pmTabs } from '@/app/utilities/utilities';

export default function DashboardPage() {
    return (
        <>
            <Sidebar tabs={pmTabs()} />
        </>
    );
}