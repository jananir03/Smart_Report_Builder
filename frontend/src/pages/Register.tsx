import {
  useState,
  type FormEvent,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  PersonAddRounded,
} from "@mui/icons-material";

import {
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";

import { registerUser } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (name.trim().length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter a password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
        },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Unable to create your account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #FFF7FA 0%, #F0EEFF 100%)",
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #5B4BDB, #F973A4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <PersonAddRounded
                  sx={{
                    color: "white",
                    fontSize: 32,
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                Create Account
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Start building smarter
                reports today.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.5}>
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  fullWidth
                  autoFocus
                />

                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  fullWidth
                  autoComplete="email"
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
                  autoComplete="new-password"
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  fullWidth
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.4,
                  }}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
              </Stack>
            </Box>

            <Typography
              textAlign="center"
              color="text.secondary"
            >
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                fontWeight={600}
              >
                Sign in
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}