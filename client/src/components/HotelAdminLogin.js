import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as yup from 'yup' 

const AdminLoginSchema = yup.object().shape({
  name: yup.string().required('Admin Name is required.'),
  password: yup.string().required('Password is required.'),
});

const HotelAdminSignIn = ({ onAdminLogin }) => {
  const [submissionError, setSubmissionError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()

  const initialValues = { name: '', password: '' };

  const handleSubmit = (values, { setSubmitting }) => {
    setIsLoading(true)
    setSubmissionError(null)

    fetch("/admin/login", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    })
      .then((res) => {
        setIsLoading(false)
        if (res.ok) {
          return res.json().then((data) => {
            const adminUser = data.admin || data;
            if (onAdminLogin) {
              onAdminLogin({ ...adminUser, role: 'admin' })
            }
            setSubmitting(false);
            history.push("/admin/home");
          })
        } else {
          res.json().then((err) => {
            setSubmissionError(err.message || 'Invalid admin name or password.')
            setSubmitting(false)
          }).catch(() => {
            setSubmissionError('Server returned an unknown error.')
            setSubmitting(false)
          })
        }
      })
      .catch(() => {
        setIsLoading(false)
        setSubmissionError('Network error or server unreachable.')
        setSubmitting(false)
      })
  }

  return (
    <div style={styles.container}>
      <h2 style={{...styles.header, color: '#f44336'}}>Hotel Admin Login 🛠️</h2>

      <Formik initialValues={initialValues} validationSchema={AdminLoginSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form style={styles.form}>
            <label htmlFor="name" style={styles.label}>Admin Name/Username</label>
            <Field type="text" id="name" name="name" style={styles.input} />
            <ErrorMessage name="name" component="div" style={styles.errorMessageField} />

            <label htmlFor="password" style={styles.label}>Password</label>
            <Field type="password" id="password" name="password" style={styles.input} />
            <ErrorMessage name="password" component="div" style={styles.errorMessageField} />

            <button 
              type="submit" 
              disabled={isSubmitting || isLoading} 
              style={{...styles.button, backgroundColor: '#f44336'}}
            >
              {isLoading || isSubmitting ? 'Logging in...' : 'Sign In'}
            </button>

            {submissionError && (
              <div style={styles.errorContainer}>
                <p style={styles.errorMessage}>Error: {submissionError}</p>
              </div>
            )}
          </Form>
        )}
      </Formik>

      <p style={styles.footer}>
        New admin? <Link to="/admin/signup" style={{color: '#f44336', fontWeight: 'bold'}}>Register here</Link>
      </p>
      <p style={styles.footer}>
        <Link to="/" style={{color: '#666'}}>Back to Home</Link>
      </p>
    </div>
  )
}

export default HotelAdminSignIn


const styles = {
  container: {
    maxWidth: '450px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
  },
  input: {
    padding: '12px',
    marginBottom: '5px', 
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px', 
    transition: 'background-color 0.3s',
  },
  errorContainer: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#ffe6e6',
    border: '1px solid #ff9999',
    borderRadius: '6px',
  },
  errorMessage: {
    margin: '5px 0',
    color: '#cc0000',
    fontSize: '14px',
  },
  errorMessageField: {
    color: '#cc0000',
    fontSize: '12px',
    marginBottom: '15px',
    marginTop: '2px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
  }
}
