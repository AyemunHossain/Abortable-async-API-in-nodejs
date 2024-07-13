const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: "!!19$^ashiK!!19$^ROOTPass@@@@",
    database: 'boiler_plate'
});

const checkPoolStatus = async () => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        return 'Connection pool is healthy';
    } catch (error) {
        return 'Connection pool is not healthy: ' + error.message;
    }
};

checkPoolStatus().then(console.log).catch(console.error);

class AbortError extends Error {
    constructor(message) {
        super(message);
        this.name = "AbortError";
    }
}

const executeQuery = async (signal) => {
    const connection = await pool.getConnection();
    
    return new Promise((resolve, reject) => {

        signal.addEventListener("abort", () => {
            connection.destroy();
            reject(new AbortError("Query aborted due to timeout"));
        });

        connection.query('SELECT SLEEP(10)')
            .then(([results]) => {
                if (!signal.aborted) {
                    clearTimeout(queryTimeout); // Clear the timeout on successful completion
                    resolve(results);
                }
            })
            .catch((error) => {
                if (!signal.aborted) {
                    clearTimeout(queryTimeout); // Clear the timeout on error
                    reject(error);
                }
            })
            .finally(() => {
                connection.release();
            });

    });
};

module.exports = {
    executeQuery,
    AbortError
};
