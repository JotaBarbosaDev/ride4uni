module.exports = {
	apps: [
		{
			name: "sir-app-front",
			cwd: process.cwd(),
			script: "npm",
			args: "start",
			interpreter: "none",
			watch: false,
			exec_mode: "fork",
			instances: 1,
			autorestart: true,
			max_restarts: 0,
			restart_delay: 5000,
			exp_backoff_restart_delay: 200,
			min_uptime: "20s",
			kill_timeout: 8000,
			listen_timeout: 10000,

			time: true,
			out_file: "./logs/pm2-out.log",
			error_file: "./logs/pm2-err.log",
			merge_logs: true,
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",

			env: {
				NODE_ENV: "production",
				PORT: "3069",
			},
		},
	],
};
