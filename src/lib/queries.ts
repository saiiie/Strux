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
            p.pmid,
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
            pm.pmid,
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

export const changeAccountStatus = async ({ newStatus, username }) => {
  const result = await pool.query(`
            UPDATE accounts
            SET is_active = $1
            WHERE username = $2;
        `, [newStatus, username]);
  return result.rowCount;
}

export const changeProjectDetails = async ({ project }) => {
  const {
    projectid,
    projectname,
    location,
    startdate,
    enddate,
    pmid,
    status,
    client,
  } = project;

  const query = `
    UPDATE projects
    SET
      projectname = $1,
      location = $2,
      startdate = $3,
      enddate = $4,
      pmid = $5,
      status = $6,
      client = $7
    WHERE projectid = $8
    RETURNING *;
  `;

  const values = [
    projectname,
    location,
    startdate,
    enddate,
    pmid,
    status,
    client,
    projectid,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};


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

export async function getMaterialRequestsByPM(pmid: string) {
  const query = `
    SELECT 
      mr.request_id,
      mr.request_date,
      mr.status,
      p.projectname
    FROM material_requests mr
    JOIN projects p ON mr.projectid = p.projectid
    WHERE p.pmid = $1
    ORDER BY mr.request_date DESC;
  `;

  const result = await pool.query(query, [pmid]);
  return result.rows;
}

// ---------------------------------------------------------
export const getLogEntriesByLogId = async (log_id: string) => {
  const result = await pool.query(`
    SELECT * 
    FROM log_entry 
    WHERE log_id = $1
  `, [log_id]);

  return result.rows;
};

export const getAllMaterials = async () => {
  const res = await pool.query(
    `SELECT material_id, name FROM materials ORDER BY name`
  );
  return res.rows;
};

export async function createLog(projectId: string, entries: any[]) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const logRes = await client.query(
      `INSERT INTO inventory_logs (log_date, projectid)
        VALUES (NOW(), $1)
        RETURNING log_id`,
      [projectId]
    );

    const logId = logRes.rows[0].log_id;

    for (const entry of entries) {
      const { materialId, beginningQty, qtyReceived, qtyUsed, endingQty } = entry;

      await client.query(
        `INSERT INTO log_entry
          (beginning_qty, qty_received, qty_used, ending_qty, log_id, material_id)
          VALUES ($1, $2, $3, $4, $5, $6)`,
        [beginningQty, qtyReceived, qtyUsed, endingQty, logId, materialId]
      );
    }

    await client.query('COMMIT');
    return logId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getRequestEntriesByRequestId(request_id: number) {
  const query = `
    SELECT 
      re.entry_id,
      re.request_id,
      m.name AS material_name,
      re.qty_requested,
      re.qty_received,
      re.status
    FROM request_entry re
    JOIN materials m ON re.material_id = m.material_id
    WHERE re.request_id = $1
  `;
  const result = await pool.query(query, [request_id]);
  return result.rows;
}