import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom' 
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'

// --- Yup Validation Schema ---
const AdminSignupSchema = yup.object().shape({
  name: yup.string().required('Admin Name is required.'),
  password: yup.string().min(8, 'Password must be at least 8 characters.').required('Password is required.'),
  passwordConfirmation: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match.') 
    .required('Password confirmation is required.'),
})

const HotelAdminSignUp = ({ onAdminLogin }) => {
  const [submissionError, setSubmissionError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory() 

  const initialValues = {
    name: '',
    password: '',
    passwordConfirmation: '',
  }

  const handleSubmit = (values, { setSubmitting }) => {  
    setIsLoading(true)
    setSubmissionError(null)

    const payload = {
      name: values.name,
      hotel_id: Number(values.hotel_id),
      password: values.password,
    }

    fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        setIsLoading(false)
        if (res.ok) {
          return res.json().then((adminUser) => {
            if (onAdminLogin) {
              onAdminLogin({ ...adminUser, role: 'admin' }) 
            }
            window.alert("Sign up Successful! Welcome!")
            history.push("/admin/hotel") 
          })
        } else {
          res.json().then((err) => {
            if (Array.isArray(err.errors)) {
              setSubmissionError(err.errors.join(', '))
            } else if (err.message) {
              setSubmissionError(err.message)
            } else {
              setSubmissionError('Registration failed due to server error.')
            }
          }).catch(() => {
            setSubmissionError('Server returned an unknown error.')
          })
        }
      })
      .catch(() => {
        setIsLoading(false)
        setSubmissionError('Network error or server unreachable.')
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div style={styles.container}>
      <h2 style={{...styles.header, color: '#f44336'}}>Admin Registration 🏨</h2>
      
      <Formik
        initialValues={initialValues}
        validationSchema={AdminSignupSchema}
        onSubmit={handleSubmit} 
      >
        {({ isSubmitting }) => (
          <Form style={styles.form}>
            
            <label htmlFor="name" style={styles.label}>Admin Name(Username)</label>
            <Field type="text" id="name" name="name" style={styles.input} />
            <ErrorMessage name="name" component="div" style={styles.errorMessageField} />

            <label htmlFor="password" style={styles.label}>Password (min 8 chars)</label>
            <Field type="password" id="password" name="password" style={styles.input} />
            <ErrorMessage name="password" component="div" style={styles.errorMessageField} />

            <label htmlFor="passwordConfirmation" style={styles.label}>Confirm Password</label>
            <Field type="password" id="passwordConfirmation" name="passwordConfirmation" style={styles.input} />
            <ErrorMessage name="passwordConfirmation" component="div" style={styles.errorMessageField} />

            <button 
              type="submit" 
              disabled={isSubmitting || isLoading} 
              style={{...styles.button, backgroundColor: '#f44336'}}
            >
              {isLoading || isSubmitting ? 'Creating Account...' : 'Register Admin'}
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
        Already registered? <Link to="/admin/login" style={{color: '#f44336', fontWeight: 'bold'}}>Sign in here</Link>
      </p>
      <p style={styles.footer}>
        <Link to="/" style={{color: '#666'}}>Back to Home</Link>
      </p>
    </div>
  )
}

export default HotelAdminSignUp

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
