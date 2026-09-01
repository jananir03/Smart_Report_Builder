import {
  useState,
  type FormEvent,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  BarChartRounded,
  LockRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    location.state?.from?.pathname ||
    "/dashboard";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        email.trim(),
        password
      );

      navigate(from, {
        replace: true,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background:
          "linear-gradient(135deg, #F5F3FF 0%, #FFF7F9 48%, #F1FAFF 100%)",
      }}
    >
      {/* Decorative circle - top left */}

      <Box
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(108, 92, 231, 0.18), rgba(108, 92, 231, 0.03))",
          top: -100,
          left: -90,
        }}
      />

      {/* Decorative circle - bottom right */}

      <Box
        sx={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(255, 107, 157, 0.16), rgba(255, 107, 157, 0.02))",
          bottom: -160,
          right: -110,
        }}
      />

      {/* Small decorative shape */}

      <Box
        sx={{
          position: "absolute",
          width: 90,
          height: 90,
          borderRadius: "24px",
          background:
            "rgba(255, 193, 7, 0.12)",
          transform: "rotate(25deg)",
          top: "18%",
          right: "12%",
          display: {
            xs: "none",
            md: "block",
          },
        }}
      />

      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 1,
          borderRadius: "24px",
          border:
            "1px solid rgba(108, 92, 231, 0.12)",
          boxShadow:
            "0 20px 60px rgba(63, 55, 110, 0.12)",
          background:
            "rgba(255, 255, 255, 0.94)",
        }}
      >
        <Box
          sx={{
            height: 7,
            background:
              "linear-gradient(90deg, #6C5CE7, #FF6B9D, #4DB6E6)",
          }}
        />

        <Box
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
          }}
        >
          <Stack spacing={3}>
            {/* Logo */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #6C5CE7, #8578EE)",
                  boxShadow:
                    "0 8px 20px rgba(108, 92, 231, 0.25)",
                }}
              >
                <BarChartRounded
                  sx={{
                    color: "#fff",
                    fontSize: 28,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  fontWeight={800}
                  fontSize={18}
                  lineHeight={1.1}
                >
                  Smart Reports
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Analytics made simple
                </Typography>
              </Box>
            </Box>

            {/* Heading */}

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#24213A",
                }}
              >
                Welcome back
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.8,
                }}
              >
                Sign in to continue to your
                analytics workspace.
              </Typography>
            </Box>

            {/* Error */}

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: "12px",
                }}
              >
                {error}
              </Alert>
            )}

            {/* Form */}

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.2}>
                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  fullWidth
                  autoFocus
                  autoComplete="email"
                  placeholder="you@example.com"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  fullWidth
                  autoComplete="current-password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    !loading ? (
                      <LockRounded />
                    ) : undefined
                  }
                  sx={{
                    mt: 0.5,
                    py: 1.35,
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: 15,
                    textTransform: "none",
                    background:
                      "linear-gradient(90deg, #6C5CE7, #8174ED)",
                    boxShadow:
                      "0 8px 18px rgba(108, 92, 231, 0.22)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #5D4ED5, #7164DF)",
                      boxShadow:
                        "0 10px 22px rgba(108, 92, 231, 0.28)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={23}
                      color="inherit"
                    />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Small feature */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: 1.5,
                borderRadius: "12px",
                background:
                  "rgba(108, 92, 231, 0.055)",
              }}
            >
              <TrendingUpRounded
                color="primary"
                fontSize="small"
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Create reports and turn
                your data into insights.
              </Typography>
            </Box>

            {/* Register */}

            <Typography
              textAlign="center"
              color="text.secondary"
              fontSize={14}
            >
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                fontWeight={700}
                color="primary"
              >
                Create one
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}