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

export async function getMatNamefromMaterials(materialid: string) {
  try {
    const result = await pool.query(
      `SELECT name FROM materials WHERE material_id = $1`,
      [materialid]
    );

    if (result.rows.length === 0) {
      return null; // Material not found
    }

    return result.rows[0].name;
  } catch (error) {
    console.error('Error fetching material name:', error);
    throw error;
  }
}

export async function getLogEntriesByLogId(log_id: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM log_entry WHERE log_id = $1`,
      [log_id]
    );

    if (result.rows.length === 0) {
      return [];
    }

    return result.rows;
  } catch (error) {
    console.error('Error fetching log entries:', error);
    throw error;
  }
}