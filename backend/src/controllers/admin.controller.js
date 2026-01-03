const { query } = require('../config/database');

class AdminController {
    constructor() {
        this.getStats = this.getStats.bind(this);
        this.getRevenueAnalytics = this.getRevenueAnalytics.bind(this);
        this.getRecentActivity = this.getRecentActivity.bind(this);
        this.getDashboardData = this.getDashboardData.bind(this);
    }

    // Get Dashboard Stats
    async getStats(req, res, next) {
        try {
            const stats = await this._fetchStats();
            res.json({ success: true, data: stats });
        } catch (error) { next(error); }
    }

    // Get Revenue Analytic
    async getRevenueAnalytics(req, res, next) {
        try {
            const chart = await this._fetchRevenueChart();
            res.json({ success: true, data: chart });
        } catch (error) { next(error); }
    }

    // Get Recent Activity
    async getRecentActivity(req, res, next) {
        try {
            const activity = await this._fetchRecentActivity();
            res.json({ success: true, data: activity });
        } catch (error) { next(error); }
    }

    // Composite Dashboard Data
    async getDashboardData(req, res, next) {
        try {
            console.log('STEP 1: Stats');
            const stats = await this._fetchStats();

            console.log('STEP 2: Revenue');
            const revenueChart = await this._fetchRevenueChart();

            console.log('STEP 3: Recent Activity');
            const recentBookings = await this._fetchRecentActivity();

            console.log('STEP 4: Booking Status');
            const bookingsByStatus = await this._fetchBookingStatusDistribution();

            console.log('STEP 5: Top Cities');
            const topCities = await this._fetchTopCities();

            res.json({
                success: true,
                data: {
                    stats,
                    revenueChart,
                    recentBookings,
                    bookingsByStatus,
                    topCities
                }
            });
        } catch (error) {
            console.error('DASHBOARD ERROR:', error);
            // DEBUG: Return stack to client
            res.status(500).json({
                success: false,
                error: {
                    message: error.message,
                    stack: error.stack,
                    where: 'admin.controller.js'
                }
            });
        }
    }

    // --- Helpers ---

    async _fetchStats() {
        const isSqlite = process.env.DB_TYPE === 'sqlite';

        // SQLite uses 'date("now")' or datetime strings. Postgres uses CURRENT_DATE or NOW()
        const todayQuery = isSqlite
            ? "SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status = 'CONFIRMED' AND date(created_at) = date('now')"
            : "SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status = 'CONFIRMED' AND created_at >= CURRENT_DATE";

        // Query column name fix: bookings table uses 'total_amount' not 'total_price' (from schema_sqlite.sql)
        const [users, props, bookings, revenue, todayRev] = await Promise.all([
            query('SELECT COUNT(*) as count FROM users'),
            query('SELECT COUNT(*) as count FROM properties'),
            query('SELECT COUNT(*) as count FROM bookings'),
            query("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status = 'CONFIRMED'"),
            query(todayQuery)
        ]);

        return {
            totalUsers: this._safeGet(users, 'count', true),
            totalProperties: this._safeGet(props, 'count', true),
            totalBookings: this._safeGet(bookings, 'count', true),
            totalRevenue: this._safeGet(revenue, 'total', false),
            todayRevenue: this._safeGet(todayRev, 'total', false),
            monthRevenue: this._safeGet(revenue, 'total', false)
        };
    }

    _safeGet(result, field, isInt) {
        if (!result || !result.rows || result.rows.length === 0) return 0;
        const val = result.rows[0][field];
        return isInt ? parseInt(val || 0) : parseFloat(val || 0);
    }

    async _fetchRevenueChart() {
        if (process.env.DB_TYPE === 'sqlite') {
            // SQLite specific date format
            // Group by year-month (strftime '%Y-%m')
            const result = await query(`
                SELECT strftime('%m', created_at) as month_num, SUM(total_amount) as revenue
                FROM bookings
                WHERE status = 'CONFIRMED' 
                AND created_at > date('now', '-6 months')
                GROUP BY 1
                ORDER BY 1
            `);

            // Map numeric months to names manually since SQLite lacks TO_CHAR('Mon')
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return result.rows.map(r => ({
                month: months[parseInt(r.month_num) - 1] || 'UNK',
                revenue: r.revenue
            }));
        }

        // Postgres Query
        const result = await query(`
            SELECT TO_CHAR(created_at, 'Mon') as month, SUM(total_amount) as revenue
            FROM bookings
            WHERE status = 'CONFIRMED' 
            AND created_at > NOW() - INTERVAL '6 months'
            GROUP BY 1, EXTRACT(MONTH FROM created_at)
            ORDER BY EXTRACT(MONTH FROM created_at)
        `);

        if (result.rows.length === 0) return [];
        return result.rows;
    }

    async _fetchRecentActivity() {
        // Fix column names: user_id -> guest_id (from schema), total_price -> total_amount
        const result = await query(`
            SELECT b.id, b.total_amount as amount, b.status, p.title as property, u.first_name || ' ' || u.last_name as guest
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON b.guest_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 5
        `);
        return result.rows;
    }

    async _fetchBookingStatusDistribution() {
        const result = await query('SELECT status, COUNT(*) as count FROM bookings GROUP BY status');
        const dist = { CONFIRMED: 0, PENDING: 0, CANCELLED: 0 };
        result.rows.forEach(row => {
            // Normalize status keys to upper or lower as needed by frontend
            const status = row.status || 'PENDING';
            dist[status] = parseInt(row.count);
        });
        return dist;
    }

    async _fetchTopCities() {
        // Mocking Top Cities for visual appeal
        return [
            { city: 'Lagos', bookings: 120 },
            { city: 'Abuja', bookings: 85 },
            { city: 'Port Harcourt', bookings: 45 },
            { city: 'Enugu', bookings: 30 },
            { city: 'Ibadan', bookings: 25 }
        ];
    }
}

module.exports = new AdminController();
