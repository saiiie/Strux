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
            a.password,
            p.projectname,
            CONCAT(pm.fname, ' ', pm.lname) AS name,
            a.is_active
        FROM 
            accounts a
        JOIN 
            project_managers pm ON a.account_id = pm.account_id
        LEFT JOIN
            projects p ON p.pmid = pm.pmid
        WHERE 
            a.role = 'Project Manager';
    `);
    return result.rows;
}

export const changeAccountStatus = async ({newStatus, username}) => {
    const result = await pool.query(`
            UPDATE accounts
            SET is_active = $1
            WHERE username = $2;
        `, [newStatus, username]);
        return result.rowCount;
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

export const getAllRequests = async () => {
  const result = await pool.query(`
    SELECT 
      mr.request_id,
      mr.request_date,
      mr.status,
      CONCAT(p.projectname, ': ', p.location) AS project_info,
      CONCAT(pm.fname, ' ', pm.lname) AS pm_name,
      pm.pmid
    FROM material_requests mr
    JOIN projects p ON mr.projectid = p.projectid
    JOIN project_managers pm ON p.pmid = pm.pmid
    ORDER BY mr.request_date DESC;
  `);

  return result.rows;
};

// PROJECT MANAGERS QUERIES ------------------------------
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

export const getMatNamefromMaterials = async (materialid: string) => {
  const result = await pool.query(`
    SELECT name 
    FROM materials 
    WHERE material_id = $1
  `, [materialid]);

  return result.rows[0]?.name || null;
};


export const getLogEntriesByLogId = async (log_id: string) => {
  const result = await pool.query(`
    SELECT * 
    FROM log_entry 
    WHERE log_id = $1
  `, [log_id]);

  return result.rows;
};


export async function createLogEntry(entry) {
  const {
    beginning_qty,
    qty_received,
    qty_used,
    ending_qty,
    project_id,
    pm_id,
    log_date,
  } = entry;

  // Validate required fields

  if (!log_date) {
    throw new Error(`Missing required field: log_date`);
  }
  // Insert query
  const query = `
    INSERT INTO log_entry (
      beginning_qty,
      qty_received,
      qty_used,
      ending_qty,
      project_id,
      pm_id,
      log_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    parseInt(beginning_qty, 10),
    parseInt(qty_received, 10),
    parseInt(qty_used, 10),
    parseInt(ending_qty, 10),
    project_id,
    pm_id,
    log_date,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the newly created log entry
  } catch (error) {
    console.error
  }
}