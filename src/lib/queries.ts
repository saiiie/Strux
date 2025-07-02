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
            CONCAT(pm.fname, ' ', pm.lname) AS project_manager_name
        FROM 
            projects p
        JOIN 
            project_managers pm ON p.projectid = pm.projectid;
    `);

    return result.rows;
};
