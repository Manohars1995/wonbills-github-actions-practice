
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const authenticateToken = async (req, res, next) => {
    try {
        /* ---------------- READ ACCESS TOKEN ---------------- */
        const token = req.cookies?.access_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No access token",
            });
        }

        /* ---------------- VERIFY TOKEN ---------------- */
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /* ---------------- FIND USER ---------------- */
        const user = await User.findById(decoded.id).lean();

        if (!user || !user.status) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive",
            });
        }

        /* ---------------- ATTACH USER TO REQUEST ---------------- */
        req.user = {
            userId: user._id,
            email: user.email,
            phone: user.contact_number,
            userName: user.full_name,
            userType: user.user_type,
            profile: user.profile_picture,
            isSubscribed: user.is_subscribed,
            free_trial: user.free_trial,
            trial_expiry: user.trial_expiry,
            status: user.status,
        };

        next();
    } catch (err) {
        console.error("JWT verify error:", err);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
};

const logOut = async (req, res) => {
    try {
        /* ---------------- CLEAR COOKIES ---------------- */
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

const getNewRefreshToken = (req, res) => {
    try {
        /* ---------------- READ REFRESH TOKEN ---------------- */
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token",
            });
        }

        /* ---------------- VERIFY REFRESH TOKEN ---------------- */
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        /* ---------------- ISSUE NEW ACCESS TOKEN ---------------- */
        const newAccessToken = jwt.sign(
            {
                id: decoded.id,
                role: decoded.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        /* ---------------- SET ACCESS TOKEN COOKIE ---------------- */
        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return res.status(200).json({
            success: true,
            message: "Access token refreshed",
        });

    } catch (err) {
        console.error("Refresh token error:", err);

        /* ---------------- CLEAR COOKIES ---------------- */
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};


module.exports = {
    authenticateToken, logOut, getNewRefreshToken
}