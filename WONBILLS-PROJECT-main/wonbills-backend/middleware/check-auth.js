const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] },
      (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({
              success: false,
              message: "Session expired, please login again"
            });
          }

          return res.status(403).json({
            success: false,
            message: "Invalid authentication token"
          });
        }

        if (!decoded?.userId) {
          return res.status(403).json({
            success: false,
            message: "Invalid token payload"
          });
        }

        req.user = {
          userId: String(decoded.userId),
          role: decoded.role
        };

        next();
      }
    );
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Generates new access token
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      { algorithms: ["HS256"] },
      (err, decoded) => {
        if (err || decoded?.type !== "refresh") {
          return res.status(403).json({
            success: false,
            message: "Invalid refresh token"
          });
        }

        const accessToken = jwt.sign(
          {
            userId: decoded.userId,
            role: decoded.role,
            type: "access"
          },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
          success: true
        });
      }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports = { authenticateToken, refreshAccessToken };
