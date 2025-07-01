'use client'

import { Sidebar } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';

export default function DashboardPage() {
    return (
        <>
            <Sidebar tabs={pmTabs()} />
        </>
    );
}