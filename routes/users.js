const router = require("express").Router();
const {
  userRegister,
  userLogin,
  userAuth,
  serializeUser,
  checkRole,
} = require("../utils/auth");

//register
router.post("/register-user", async (req, res) => {
  await userRegister(req.body, "user", res);
});
router.post("/register-admin", async (req, res) => {
  await userRegister(req.body, "admin", res);
});
router.post("/register-super-admin", async (req, res) => {
  await userRegister(req.body, "superadmin", res);
});

//login

router.post("/login-user", async (req, res) => {
  await userLogin(req.body, "user", res);
});
router.post("/login-admin", async (req, res) => {
  await userLogin(req.body, "admin", res);
});
router.post("/login-super-admin", async (req, res) => {
  await userLogin(req.body, "superadmin", res);
});

//profile
router.get("/profile", userAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

//protected
router.get(
  "/user-protected",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.send("authorized route for user");
  }
);
router.get(
  "/admin-protected",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.send("authorized route for admin");
  }
);
router.get(
  "/super-admin-protected",
  userAuth,
  checkRole(["superadmin"]),
  async (req, res) => {
    console.log(req.body);
    return res.send("authorized route for superadmin");
  }
);

module.exports = router;
