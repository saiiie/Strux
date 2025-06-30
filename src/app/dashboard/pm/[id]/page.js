'use client'

import { useParams } from 'next/navigation'; 

export default function ProjectManagerDashboard() {
  const params = useParams();
  const { id: pmid } = params;

  return (
    <div>
      <h1>Project Manager ID: {pmid}</h1>
    </div>
  );
}