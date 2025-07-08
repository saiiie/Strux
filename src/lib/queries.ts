import { pool } from './db';

export async function getProjectByPM(pmid: string) {
    const result = await pool.query(
        'SELECT * FROM projects WHERE pmid = $1', [pmid]
    );
    return result.rows;
}

export const getAllProjects = async () => {
    const result = await pool.query(`
        SELECT
            p.projectid,
            p.projectname,
            p.location,
            p.status,
            p.startdate,
            p.enddate,
            p.client,
            CONCAT(pm.fname, ' ', pm.lname) AS project_manager_name
        FROM projects p
        JOIN project_managers pm ON p.pmid = pm.pmid;
    `);

    return result.rows;
};


export const getAllPM = async () => {
    const result = await pool.query(`
        SELECT pmid, fname, lname FROM project_managers
    `);
    return result.rows;
}