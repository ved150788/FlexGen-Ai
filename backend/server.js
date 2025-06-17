const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables (you should set these in production)
const JWT_SECRET =
	process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SESSION_SECRET = process.env.SESSION_SECRET || "your-session-secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";

// Database setup
const dbPath = path.join(__dirname, "auth.db");
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
	// Users table
	db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        firstName TEXT,
        lastName TEXT,
        avatar TEXT,
        provider TEXT DEFAULT 'local',
        providerId TEXT,
        isEmailVerified BOOLEAN DEFAULT FALSE,
        emailVerificationToken TEXT,
        resetPasswordToken TEXT,
        resetPasswordExpires INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME,
        isActive BOOLEAN DEFAULT TRUE
    )`);

	// Scan history table
	db.run(`CREATE TABLE IF NOT EXISTS scan_history (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        scanType TEXT NOT NULL,
        targetUrl TEXT,
        targetIp TEXT,
        scanResults TEXT,
        scanStatus TEXT DEFAULT 'completed',
        riskLevel TEXT,
        threatsFound INTEGER DEFAULT 0,
        scanDuration INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);

	// User sessions table
	db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        sessionToken TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);

	// User preferences table
	db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        emailNotifications BOOLEAN DEFAULT TRUE,
        securityAlerts BOOLEAN DEFAULT TRUE,
        marketingEmails BOOLEAN DEFAULT FALSE,
        theme TEXT DEFAULT 'light',
        language TEXT DEFAULT 'en',
        timezone TEXT DEFAULT 'UTC',
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);
});

// Middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
				fontSrc: ["'self'", "https://fonts.gstatic.com"],
				imgSrc: ["'self'", "data:", "https:"],
				connectSrc: ["'self'", "https://api.github.com"],
			},
		},
	})
);

app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? [
						"https://flexgenai.com",
						"https://www.flexgenai.com",
						"https://flexgen-ai.vercel.app",
				  ]
				: ["http://localhost:3000", "http://127.0.0.1:3000"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
	})
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		async (email, password, done) => {
			try {
				db.get(
					"SELECT * FROM users WHERE email = ? AND isActive = 1",
					[email],
					async (err, user) => {
						if (err) return done(err);
						if (!user)
							return done(null, false, {
								message: "Invalid email or password",
							});

						const isValidPassword = await bcrypt.compare(
							password,
							user.password
						);
						if (!isValidPassword)
							return done(null, false, {
								message: "Invalid email or password",
							});

						// Update last login
						db.run(
							"UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?",
							[user.id]
						);

						return done(null, user);
					}
				);
			} catch (error) {
				return done(error);
			}
		}
	)
);

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: GOOGLE_CLIENT_ID,
				clientSecret: GOOGLE_CLIENT_SECRET,
				callbackURL:
					process.env.NODE_ENV === "production"
						? process.env.PRODUCTION_GOOGLE_CALLBACK_URL ||
						  "https://api.flexgenai.com/auth/google/callback"
						: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const email = profile.emails[0].value;
					const googleId = profile.id;

					db.get(
						"SELECT * FROM users WHERE email = ? OR (provider = ? AND providerId = ?)",
						[email, "google", googleId],
						(err, user) => {
							if (err) return done(err);

							if (user) {
								// Update last login
								db.run(
									"UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?",
									[user.id]
								);
								return done(null, user);
							}

							// Create new user
							const userId = uuidv4();
							const userData = {
								id: userId,
								email: email,
								firstName: profile.name.givenName,
								lastName: profile.name.familyName,
								avatar: profile.photos[0]?.value,
								provider: "google",
								providerId: googleId,
								isEmailVerified: true,
							};

							db.run(
								`INSERT INTO users (id, email, firstName, lastName, avatar, provider, providerId, isEmailVerified) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
								[
									userData.id,
									userData.email,
									userData.firstName,
									userData.lastName,
									userData.avatar,
									userData.provider,
									userData.providerId,
									userData.isEmailVerified,
								],
								function (err) {
									if (err) return done(err);

									// Create default preferences
									db.run(
										`INSERT INTO user_preferences (id, userId) VALUES (?, ?)`,
										[uuidv4(), userData.id]
									);

									return done(null, userData);
								}
							);
						}
					);
				} catch (error) {
					return done(error);
				}
			}
		)
	);
}

// Facebook OAuth Strategy
if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
	passport.use(
		new FacebookStrategy(
			{
				clientID: FACEBOOK_APP_ID,
				clientSecret: FACEBOOK_APP_SECRET,
				callbackURL:
					process.env.NODE_ENV === "production"
						? process.env.PRODUCTION_FACEBOOK_CALLBACK_URL ||
						  "https://api.flexgenai.com/auth/facebook/callback"
						: process.env.FACEBOOK_CALLBACK_URL || "/auth/facebook/callback",
				profileFields: ["id", "emails", "name", "picture.type(large)"],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const email = profile.emails[0].value;
					const facebookId = profile.id;

					db.get(
						"SELECT * FROM users WHERE email = ? OR (provider = ? AND providerId = ?)",
						[email, "facebook", facebookId],
						(err, user) => {
							if (err) return done(err);

							if (user) {
								// Update last login
								db.run(
									"UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?",
									[user.id]
								);
								return done(null, user);
							}

							// Create new user
							const userId = uuidv4();
							const userData = {
								id: userId,
								email: email,
								firstName: profile.name.givenName,
								lastName: profile.name.familyName,
								avatar: profile.photos[0]?.value,
								provider: "facebook",
								providerId: facebookId,
								isEmailVerified: true,
							};

							db.run(
								`INSERT INTO users (id, email, firstName, lastName, avatar, provider, providerId, isEmailVerified) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
								[
									userData.id,
									userData.email,
									userData.firstName,
									userData.lastName,
									userData.avatar,
									userData.provider,
									userData.providerId,
									userData.isEmailVerified,
								],
								function (err) {
									if (err) return done(err);

									// Create default preferences
									db.run(
										`INSERT INTO user_preferences (id, userId) VALUES (?, ?)`,
										[uuidv4(), userData.id]
									);

									return done(null, userData);
								}
							);
						}
					);
				} catch (error) {
					return done(error);
				}
			}
		)
	);
}

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	db.get(
		"SELECT * FROM users WHERE id = ? AND isActive = 1",
		[id],
		(err, user) => {
			done(err, user);
		}
	);
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};

// Middleware to check authentication for tool execution
const requireAuthForTools = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			error: "Authentication required",
			message: "Please sign in to use this tool",
			requiresAuth: true,
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		return res.status(403).json({
			error: "Invalid or expired token",
			message: "Please sign in again to continue",
			requiresAuth: true,
		});
	}
};

// Routes

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Register
app.post("/auth/register", async (req, res) => {
	try {
		const { email, password, firstName, lastName } = req.body;

		// Validation
		if (!email || !password || !firstName || !lastName) {
			return res.status(400).json({ error: "All fields are required" });
		}

		if (!validator.isEmail(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		if (password.length < 8) {
			return res
				.status(400)
				.json({ error: "Password must be at least 8 characters long" });
		}

		// Check if user already exists
		db.get(
			"SELECT id FROM users WHERE email = ?",
			[email],
			async (err, existingUser) => {
				if (err) {
					console.error("Database error:", err);
					return res.status(500).json({ error: "Internal server error" });
				}

				if (existingUser) {
					return res
						.status(409)
						.json({ error: "User already exists with this email" });
				}

				try {
					// Hash password
					const saltRounds = 12;
					const hashedPassword = await bcrypt.hash(password, saltRounds);

					// Create user
					const userId = uuidv4();
					const emailVerificationToken = uuidv4();

					db.run(
						`INSERT INTO users (id, email, password, firstName, lastName, emailVerificationToken) 
                        VALUES (?, ?, ?, ?, ?, ?)`,
						[
							userId,
							email,
							hashedPassword,
							firstName,
							lastName,
							emailVerificationToken,
						],
						function (err) {
							if (err) {
								console.error("Database error:", err);
								return res.status(500).json({ error: "Failed to create user" });
							}

							// Create default preferences
							db.run(
								`INSERT INTO user_preferences (id, userId) VALUES (?, ?)`,
								[uuidv4(), userId],
								(err) => {
									if (err)
										console.error("Failed to create user preferences:", err);
								}
							);

							// Generate JWT token
							const token = jwt.sign({ userId }, JWT_SECRET, {
								expiresIn: "24h",
							});

							res.status(201).json({
								message: "User created successfully",
								token,
								user: {
									id: userId,
									email,
									firstName,
									lastName,
									isEmailVerified: false,
								},
							});
						}
					);
				} catch (hashError) {
					console.error("Password hashing error:", hashError);
					return res.status(500).json({ error: "Internal server error" });
				}
			}
		);
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Login
app.post("/auth/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) {
			console.error("Login error:", err);
			return res.status(500).json({ error: "Internal server error" });
		}

		if (!user) {
			return res
				.status(401)
				.json({ error: info.message || "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
			expiresIn: "24h",
		});

		res.json({
			message: "Login successful",
			token,
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				avatar: user.avatar,
				isEmailVerified: user.isEmailVerified,
			},
		});
	})(req, res, next);
});

// Google OAuth routes
app.get("/auth/google", (req, res, next) => {
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		return res.status(400).json({
			error: "Google OAuth is not configured",
			message:
				"Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables",
			setup_instructions:
				"Run 'node setup-google-oauth.js' for detailed setup instructions",
		});
	}
	passport.authenticate("google", { scope: ["profile", "email"] })(
		req,
		res,
		next
	);
});

app.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login?error=google_auth_failed",
	}),
	(req, res) => {
		const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, {
			expiresIn: "24h",
		});
		res.redirect(
			`${
				process.env.FRONTEND_URL || "http://localhost:3000"
			}/dashboard?token=${token}`
		);
	}
);

// Facebook OAuth routes
app.get(
	"/auth/facebook",
	passport.authenticate("facebook", { scope: ["email"] })
);

app.get(
	"/auth/facebook/callback",
	passport.authenticate("facebook", {
		failureRedirect: "/login?error=facebook_auth_failed",
	}),
	(req, res) => {
		const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, {
			expiresIn: "24h",
		});
		const frontendUrl =
			process.env.NODE_ENV === "production"
				? process.env.PRODUCTION_FRONTEND_URL || "https://flexgenai.com"
				: process.env.FRONTEND_URL || "http://localhost:3000";
		res.redirect(`${frontendUrl}/dashboard?token=${token}`);
	}
);

// Get user profile
app.get("/auth/profile", verifyToken, (req, res) => {
	db.get(
		`SELECT u.*, up.* FROM users u 
            LEFT JOIN user_preferences up ON u.id = up.userId 
            WHERE u.id = ? AND u.isActive = 1`,
		[req.userId],
		(err, user) => {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Internal server error" });
			}

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			// Remove sensitive data
			const {
				password,
				emailVerificationToken,
				resetPasswordToken,
				...safeUser
			} = user;

			res.json({ user: safeUser });
		}
	);
});

// Update user profile
app.put("/auth/profile", verifyToken, (req, res) => {
	const { firstName, lastName, avatar } = req.body;

	db.run(
		`UPDATE users SET firstName = ?, lastName = ?, avatar = ?, updatedAt = CURRENT_TIMESTAMP 
            WHERE id = ?`,
		[firstName, lastName, avatar, req.userId],
		function (err) {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Failed to update profile" });
			}

			res.json({ message: "Profile updated successfully" });
		}
	);
});

// Get scan history
app.get("/scans/history", verifyToken, (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const offset = (page - 1) * limit;

	// Get total count
	db.get(
		"SELECT COUNT(*) as total FROM scan_history WHERE userId = ?",
		[req.userId],
		(err, countResult) => {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Internal server error" });
			}

			// Get scans with pagination
			db.all(
				`SELECT * FROM scan_history WHERE userId = ? 
                ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
				[req.userId, limit, offset],
				(err, scans) => {
					if (err) {
						console.error("Database error:", err);
						return res.status(500).json({ error: "Internal server error" });
					}

					res.json({
						scans: scans.map((scan) => ({
							...scan,
							scanResults: scan.scanResults
								? JSON.parse(scan.scanResults)
								: null,
						})),
						pagination: {
							page,
							limit,
							total: countResult.total,
							totalPages: Math.ceil(countResult.total / limit),
						},
					});
				}
			);
		}
	);
});

// Save scan result
app.post("/scans/save", verifyToken, (req, res) => {
	const {
		scanType,
		targetUrl,
		targetIp,
		scanResults,
		riskLevel,
		threatsFound,
		scanDuration,
	} = req.body;

	if (!scanType) {
		return res.status(400).json({ error: "Scan type is required" });
	}

	const scanId = uuidv4();

	db.run(
		`INSERT INTO scan_history 
            (id, userId, scanType, targetUrl, targetIp, scanResults, riskLevel, threatsFound, scanDuration) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			scanId,
			req.userId,
			scanType,
			targetUrl,
			targetIp,
			JSON.stringify(scanResults),
			riskLevel,
			threatsFound,
			scanDuration,
		],
		function (err) {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Failed to save scan result" });
			}

			res.status(201).json({
				message: "Scan result saved successfully",
				scanId: scanId,
			});
		}
	);
});

// Logout
app.post("/auth/logout", verifyToken, (req, res) => {
	// In a more sophisticated setup, you might want to blacklist the token
	res.json({ message: "Logged out successfully" });
});

// User preferences
app.get("/auth/preferences", verifyToken, (req, res) => {
	db.get(
		"SELECT * FROM user_preferences WHERE userId = ?",
		[req.userId],
		(err, preferences) => {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Internal server error" });
			}

			res.json({ preferences: preferences || {} });
		}
	);
});

app.put("/auth/preferences", verifyToken, (req, res) => {
	const {
		emailNotifications,
		securityAlerts,
		marketingEmails,
		theme,
		language,
		timezone,
	} = req.body;

	db.run(
		`UPDATE user_preferences SET 
            emailNotifications = ?, securityAlerts = ?, marketingEmails = ?, 
            theme = ?, language = ?, timezone = ? 
            WHERE userId = ?`,
		[
			emailNotifications,
			securityAlerts,
			marketingEmails,
			theme,
			language,
			timezone,
			req.userId,
		],
		function (err) {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Failed to update preferences" });
			}

			res.json({ message: "Preferences updated successfully" });
		}
	);
});

// Apply authentication middleware only to tool execution endpoints
app.post("/api/tools/*", requireAuthForTools);

// Token validation endpoint
app.get("/auth/validate", verifyToken, async (req, res) => {
	try {
		// Get user data from database
		db.get(
			"SELECT id, email, firstName, lastName, avatar, isEmailVerified, createdAt, lastLogin FROM users WHERE id = ?",
			[req.userId],
			(err, user) => {
				if (err) {
					console.error("Database error:", err);
					return res.status(500).json({ error: "Internal server error" });
				}

				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				res.json({ user });
			}
		);
	} catch (error) {
		console.error("Token validation error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
	console.log(`Authentication server running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
