import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik } from "formik";
import type { IRegisterResponse, INavigate } from "@/models/type";
import { register } from "@/services/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  function handleRegisterToast(
    res: { status: number },
    data: IRegisterResponse,
    navigate: INavigate
  ) {
    if (res.status >= 200 && res.status < 300) {
      toast.success("Registration successful!");
      navigate("/login");
    } else {
      toast.error(data.detail || "Registration failed");
    }
  }

  const handleSubmit = async (
    values: {
      email: string;
      password: string;
      confirmPassword: string;
      username: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const { res, data } = await register({
        email: values.email,
        password: values.password,
        username: values.username,
      });
      handleRegisterToast(res, data, navigate);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex ">
        <img
          src="https://www.pixelkicks.co.uk/wp-content/uploads/2023/09/building-an-ecommerce-website.jpg"
          alt=""
          className="w-1/2 h-96 rounded-l-xl rou"
        />
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
          }}
          validate={(values) => {
            const errors: {
              email?: string;
              password?: string;
              confirmPassword?: string;
              username?: string;
            } = {};
            if (!values.username) {
              errors.username = "Username is required";
            }
            if (!values.email) {
              errors.email = "Email is required";
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = "Email is invalid";
            }
            if (!values.password) {
              errors.password = "Password is required";
            } else if (
              !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                values.password
              )
            ) {
              errors.password =
                "Password must be at least 8 characters and include uppercase, lowercase, number and special character";
            }
            if (!values.confirmPassword) {
              errors.confirmPassword = "Please confirm your password";
            } else if (values.password !== values.confirmPassword) {
              errors.confirmPassword = "Passwords do not match";
            }
            return errors;
          }}
          onSubmit={handleSubmit}
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
              className="bg-white p-6 rounded-lg shadow-md w-96"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  className={`w-full p-2 border rounded ${
                    errors.username && touched.username ? "border-red-500" : ""
                  }`}
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                {errors.username && touched.username && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.username}
                  </div>
                )}
              </div>

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

              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  className={`w-full p-2 border rounded ${
                    errors.confirmPassword && touched.confirmPassword
                      ? "border-red-500"
                      : ""
                  }`}
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
