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

export const getAllAccounts = async () => {
    const result = await pool.query(`
        SELECT 
            a.username,
            a.role,
            CONCAT(pm.fname, ' ', pm.lname) AS name
        FROM 
            accounts a
        JOIN 
            project_managers pm ON a.account_id = pm.account_id
        WHERE 
            a.role = 'Project Manager';
    `);

    return result.rows;
}

export const getAllLogs = async () => {
    const result = await pool.query(`
        SELECT 
            l.log_id,
            l.log_date,
            p.projectname,
            p.location,
            CONCAT(pm.fname, ' ', pm.lname) AS project_manager
        FROM inventory_logs l
        JOIN projects p ON l.projectid = p.projectid
        JOIN project_managers pm ON p.pmid = pm.pmid
        ORDER BY l.log_date DESC;
    `);

    return result.rows;
};

export async function getInventoryLogsByPM(pmid: string) {
    const result = await pool.query(
        `SELECT l.log_id AS id, l.log_date
         FROM inventory_logs l
         JOIN projects p ON l.projectid = p.projectid
         WHERE p.pmid = $1
         ORDER BY l.log_date DESC`,
        [pmid]
    );
    return result.rows;
}