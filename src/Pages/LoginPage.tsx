import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { login } from "../services/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex">
        <img
          src="https://www.pixelkicks.co.uk/wp-content/uploads/2023/09/building-an-ecommerce-website.jpg"
          alt=""
          className="w-1/2 h-96 rounded-l-xl"
        />
        <Formik
          initialValues={{ email: "", password: "" }}
          validate={(values) => {
            const errors: { email?: string; password?: string } = {};
            if (!values.email) {
              errors.email = "Email is required";
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = "Invalid email address";
            }
            if (!values.password) {
              errors.password = "Password is required";
            } else if (values.password.length < 6) {
              errors.password = "Wrong password";
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            try {
              const data = await login(values);

              localStorage.setItem("token", data.session.access_token);
              localStorage.setItem("user", JSON.stringify(data.user));

              if (data.user.role === "admin") {
                navigate("/admin");
              } else {
                navigate("/");
              }

              toast.success("Login successful!");
            } catch (error) {
              console.error("Login error:", error);
              toast.error("An error occurred during login");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-r-xl p-6 w-96"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Log in</h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  className={`w-full p-2 border rounded ${
                    errors.email && touched.email ? "border-red-500" : ""
                  }`}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                {errors.email && touched.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  className={`w-full p-2 border rounded ${
                    errors.password && touched.password ? "border-red-500" : ""
                  }`}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                {errors.password && touched.password && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
